import base64
import gzip
import json
import logging
import os
import traceback
from datetime import date

import boto3
import pyotp
import requests

bitskins_secret = os.environ['BITSKINS_SECRET']
bitskins_token = pyotp.TOTP(bitskins_secret)
bitskins_api_key = os.environ['BITSKINS_API_KEY']
result_s3_bucket = os.environ['RESULTS_BUCKET']
sns_topic = os.environ['SNS_TOPIC_ARN']
own_prices_table = os.environ['OWN_PRICES_TABLE']
steam_apis_key = os.environ['STEAM_APIS_COM_API_KEY']
skinport_client_id = os.environ['SKINPORT_CLIENT_ID']
skinport_client_secret = os.environ['SKINPORT_CLIENT_SECRET']
pricempire_token = os.environ['PRICEMPIRE_TOKEN']
skinwallet_api_key = os.environ['SKINWALLET_API_KEY']

special_phases = ["Ruby", "Sapphire", "Black Pearl", "Emerald"]
knives = ["Bayonet", "Bowie Knife", "Butterfly Knife", "Falchion Knife", "Flip Knife",
          "Gut Knife", "Huntsman Knife", "Karambit", "M9 Bayonet", "Navaja Knife",
          "Shadow Daggers", "Stiletto Knife", "Talon Knife", "Ursus Knife", "Nomad Knife",
          "Skeleton Knife", "Survival Knife", "Paracord Knife", "Classic Knife"]
gloves = ["Gloves", "Hand Wraps"]

master_list = []

log = logging.getLogger(__name__)
formatter = logging.Formatter("%(asctime)s [%(levelname)-10s] - %(message)s", datefmt="%d-%b-%y %H:%M:%S")
stream = logging.StreamHandler()
stream.setFormatter(formatter)
log.addHandler(stream)
log.setLevel(logging.INFO)


def lambda_handler(event, context):
    arn_split = context.invoked_function_arn.split(':')
    stage_candidate = arn_split[len(arn_split) - 1]
    stage = 'dev' if stage_candidate == 'priceScraper' else 'prod'  # if there is an alias it's prod

    if stage == "dev":
        log.setLevel(logging.INFO)
    else:
        log.setLevel(logging.WARNING)

    own_prices, response = fetch_own_prices()
    steam_prices = fetch_steamapis(response, stage)
    csgobackpack_prices = fetch_csgobackpack(response)
    bitskins_prices = request_bitskins(response, stage)
    lootfarm_prices = request_lootfarm(response, stage)
    csgotm_prices = fetch_csgotm(stage)
    csmoney_prices = request_csmoney(stage)
    skinport_prices = request_skinport(stage)
    (
        buff163_prices,
        csgoempire_prices,
        csgoexo_prices,
        swapgg_prices
    ) = request_priceempire(stage)

    # not used apparently
    skinwallet_prices = fetch_skinwallet(response, stage)

    csgotrader_prices = create_csgotrader_prices(buff163_prices, csgobackpack_prices, csmoney_prices, own_prices, stage, steam_prices)

    # only push if all of them have valid results
    # (aka all the requests succeeded)

    all_prices_list = [
        bitskins_prices,
        buff163_prices,
        csgoempire_prices,
        csgoexo_prices,
        csgotm_prices,
        csgotrader_prices,
        csmoney_prices,
        lootfarm_prices,
        skinport_prices,
        steam_prices,
        swapgg_prices,
    ]

    if all(all_prices_list):
        push_final_prices(bitskins_prices, buff163_prices, csgoempire_prices, csgoexo_prices, csgotm_prices, csgotrader_prices, csmoney_prices, lootfarm_prices,
                          skinport_prices, stage, steam_prices, swapgg_prices)
        return {
            "statusCode": 200,
            "body": "\"Success!\""
        }
    falsy_prices = [p for p in all_prices_list if not p]
    falsy_prices_str = ", ".join(falsy_prices) + " failed to be set."
    log.error(falsy_prices_str)
    return {
        "statusCode": 500,
        "body": falsy_prices_str
    }


def fetch_own_prices():
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-2')
    table = dynamodb.Table(own_prices_table)
    log.info("Getting own prices from Dynamo")
    response = table.scan(ProjectionExpression="market_hash_name, price")
    own_prices = {}
    for item in response['Items']:
        name = item["market_hash_name"]
        own_prices[name] = float(item["price"])
        add_to_master_list(name)
    return own_prices, response


def create_csgotrader_prices(buff163_prices, csgobackpack_prices, csmoney_prices, own_prices, stage, steam_prices):
    log.info("Creates own pricing")
    log.info("Calculate market trends")
    week_to_day = 0
    month_to_week = 0
    count = 0
    for item in master_list:

        item_prices = steam_prices.get(item)

        if (
                item_prices
                and "safe_ts" in item_prices
                and "last_24h" in item_prices["safe_ts"]
                and "last_7d" in item_prices["safe_ts"]
                and "last_30d" in item_prices["safe_ts"]
        ):
            daily = float(item_prices["safe_ts"]["last_24h"])
            weekly = float(item_prices["safe_ts"]["last_7d"])
            monthly = float(item_prices["safe_ts"]["last_30d"])

            if daily > 0.1 and weekly > 0.1 and monthly > 0.1:
                wtd_ratio = daily / weekly
                mtw_ratio = weekly / monthly

                if 0 < wtd_ratio < 2 and 0 < mtw_ratio < 2:
                    week_to_day += wtd_ratio
                    month_to_week += mtw_ratio
                    count += 1
    week_to_day /= count
    month_to_week /= count
    log.info("Market trends: WtD: " + str(week_to_day) + " MtW: " + str(month_to_week))
    log.info("Getting price difference ratio between steam:buff and steam:csmoney")
    st_buff = 0
    st_csm = 0
    count = 0
    for item in master_list:

        item_steam_prices = steam_prices.get(item)
        item_buff_prices = buff163_prices.get(item)
        item_csmoney_prices = csmoney_prices.get(item)

        if (
                item_steam_prices
                and item_buff_prices
                and item_csmoney_prices
                and "safe_ts" in item_steam_prices
                and "last_7d" in item_steam_prices["safe_ts"]
                and item_buff_prices["highest_order"]["price"]
                and item_buff_prices["starting_at"]["price"]
                and "price" in item_csmoney_prices
                and item_csmoney_prices["price"]
        ):
            st_weekly = float(item_steam_prices["safe_ts"]["last_7d"])
            buff_mid_price = (float(item_buff_prices["highest_order"]["price"]) + float(item_buff_prices["starting_at"]["price"])) / 2
            csm = float(item_csmoney_prices["price"])
            if st_weekly > 0.1 and buff_mid_price > 0.1 and csm > 0.1:
                st_buff_ratio = st_weekly / buff_mid_price
                st_csm_ratio = st_weekly / csm

                if 0 < st_buff_ratio < 2 and 0 < st_csm_ratio < 2:
                    st_buff += st_buff_ratio
                    st_csm += st_csm_ratio
                    count += 1
    st_buff /= count
    st_csm /= count
    log.info("Steam:Buff: " + str(st_buff) + " Steam:Csmoney:  " + str(st_csm))
    log.info("Creating csgotrader prices")
    csgotrader_prices = {}
    for item in master_list:
        if item is not None:
            steam_aggregate = get_steam_price(item, steam_prices, week_to_day, month_to_week)
            steam_aggregate_price = steam_aggregate["price"]
            case = steam_aggregate["case"]  # only used to debug pricing in dev mode
            price = None

            if (
                    steam_aggregate_price
                    and not is_mispriced_knife(item, steam_aggregate_price)
                    and not is_mispriced_glove(item, steam_aggregate_price)
                    and not is_mispriced_compared_to_csb(item, steam_aggregate_price, csgobackpack_prices)
            ):
                if steam_aggregate_price >= 800 and item in buff163_prices and buff163_prices[item]["starting_at"]["price"]:
                    price = get_formatted_float(float(buff163_prices[item]["starting_at"]["price"]) * st_buff * week_to_day)
                    case = "H"
                else:
                    price = get_formatted_float(steam_aggregate_price)
            elif item in csmoney_prices and "price" in csmoney_prices[item] and csmoney_prices[item]["price"]:
                price = get_formatted_float(float(csmoney_prices[item]["price"]) * st_csm * week_to_day)
                case = "F"
            elif item in buff163_prices and buff163_prices[item]["starting_at"]["price"]:
                price = get_formatted_float(float(buff163_prices[item]["starting_at"]["price"]) * st_buff * week_to_day)
                case = "G"
            elif item in own_prices:
                price = own_prices[item]
                case = "H"

            if "Doppler" in item:
                doppler = {}
                for phase in csmoney_prices[item]["doppler"]:
                    doppler[phase] = get_formatted_float(float(csmoney_prices[item]["doppler"][phase]) * st_csm)

                if stage == "dev":
                    csgotrader_prices[item] = {
                        "price": price,
                        "case": "J",
                        "doppler": doppler
                    }
                else:
                    csgotrader_prices[item] = {
                        "price": price,
                        "doppler": doppler
                    }
            elif stage == "dev":
                csgotrader_prices[item] = {
                    "price": price,
                    "case": case
                }
            else:
                csgotrader_prices[item] = {"price": price}
    log.info("Check if the non-st version is cheaper")
    for item, value in csgotrader_prices.items():
        is_st = "StatTrak\u2122" in item
        if is_st:
            none_st_name = get_non_st_name(item)
            if (
                    none_st_name in csgotrader_prices
                    and csgotrader_prices[none_st_name]["price"]
                    and value["price"]
                    and float(csgotrader_prices[none_st_name]["price"])
                    > float(csgotrader_prices[item]["price"])
            ):
                # if the st version is cheaper then the non-st's price is used
                if stage == "dev":
                    csgotrader_prices[item] = {
                        "price": float(csgotrader_prices[none_st_name]["price"]) * 1.1,
                        "case": "E"
                    }
                else:
                    csgotrader_prices[item] = {"price": float(csgotrader_prices[none_st_name]["price"]) * 1.1}
    log.info("csgotrader prices created")
    push_to_s3(csgotrader_prices, 'csgotrader', stage)
    return csgotrader_prices


def push_final_prices(bitskins_prices, buff163_prices, csgoempire_prices, csgoexo_prices, csgotm_prices, csgotrader_prices, csmoney_prices, lootfarm_prices,
                      skinport_prices, stage, steam_prices, swapgg_prices):
    log.info("Putting together the final prices dict")
    extract = {}
    for item in master_list:
        extract[item] = {}
        if item in steam_prices and "safe_ts" in steam_prices[item]:
            extract[item]["steam"] = steam_prices[item]["safe_ts"]
        else:
            extract[item]["steam"] = {
                "last_90d": None,
                "last_30d": None,
                "last_7d": None,
                "last_24h": None
            }
        extract[item]["bitskins"] = bitskins_prices.get(item)
        extract[item]["lootfarm"] = lootfarm_prices.get(item)
        extract[item]["csgotm"] = csgotm_prices.get(item)
        extract[item]["csmoney"] = csmoney_prices.get(item)
        extract[item]["skinport"] = skinport_prices.get(item)
        extract[item]["csgotrader"] = csgotrader_prices.get(item)
        extract[item]["csgoempire"] = csgoempire_prices.get(item)
        extract[item]["swapgg"] = swapgg_prices.get(item)
        extract[item]["csgoexo"] = csgoexo_prices.get(item)
        extract[item]["buff163"] = buff163_prices.get(item, {
            "starting_at": None,
            "highest_order": None,
        })
    push_to_s3(extract, 'prices_v6', stage)


def fetch_skinwallet(response, stage):
    log.info("Requesting prices from skinwallet.com")
    try:
        response = requests.get("https://www.skinwallet.com/market/api/offers/overview", params={
            "appId": "730"
        }, headers={
            "accept": "application/json",
            "x-auth-token": skinwallet_api_key
        })
    except Exception as e:
        handle_exception(e, "Error during skinwallet request")
    log.info("Received response from skinwallet.com")
    skinwallet_prices = {}
    if response.status_code == 200 and response.json()['status'] == 'Success':
        log.info("Valid response from skinwallet.com")
        items = response.json()['result']
        log.info("Extracting pricing information")
        for item in items:
            name = item.get('marketHashName')
            skinwallet_prices[name] = item.get('cheapestOffer').get('price').get('amount')

        log.info("Pricing information extracted")
        push_to_s3(skinwallet_prices, 'skinwallet', stage)

    else:
        error = "Could not get items from skinwallet.com"
        alert_via_sns(error)
        log.warning(error, " status code: ", response.status_code)
    return skinwallet_prices


def request_priceempire(stage):
    log.info("Requesting prices from pricempire")
    response = requests.get("https://api.pricempire.com/v1/getAllItems", params={
        "token": pricempire_token,
        "currency": "USD"
    })
    log.info("Received response from pricempire")
    response_json = response.json()

    csgoempire_prices = {}
    swapgg_prices = {}
    csgoexo_prices = {}
    buff163_prices = {}

    if response.status_code == 200 and len(response_json) != 0 and response_json.get("status") is True:
        log.info("Valid response from pricempire")
        items = response_json.get("items")
        log.info("Extracting pricing information")

        for item in items:
            name = item.get('name')
            pricempire_prices = item.get('prices')

            if pricempire_prices is not None:
                csgoempire_prices[name] = get_formatted_float_divided_by_100(pricempire_prices.get('csgoempire', {}).get('price'))
                swapgg_prices[name] = get_formatted_float_divided_by_100(pricempire_prices.get('swapgg', {}).get('price'))
                csgoexo_prices[name] = get_formatted_float_divided_by_100(pricempire_prices.get('csgoexo', {}).get('price'))

                item_buff163_price = pricempire_prices.get('buff163', {}).get('price')
                item_buff163_quick_price = pricempire_prices.get('buff163_quick', {}).get('price')

                item_buff163_prices = {"starting_at": {}, "highest_order": {}}
                item_buff163_prices["starting_at"]["price"] = get_formatted_float_divided_by_100(item_buff163_price)
                item_buff163_prices["highest_order"]["price"] = get_formatted_float_divided_by_100(item_buff163_quick_price)

                if "Doppler" in name:
                    item_buff163_prices["starting_at"]["doppler"] = {
                        "Sapphire": get_formatted_float_divided_by_100(pricempire_prices.get("buff_sapphire", {}).get("price")),
                        "Ruby": get_formatted_float_divided_by_100(pricempire_prices.get("buff_ruby", {}).get("price")),
                        "Black Pearl": get_formatted_float_divided_by_100(pricempire_prices.get("buff_bp", {}).get("price")),
                        "Emerald": get_formatted_float_divided_by_100(pricempire_prices.get("buff_emerald", {}).get("price")),
                        "Phase 1": get_formatted_float_divided_by_100(pricempire_prices.get("buff_p1", {}).get("price")),
                        "Phase 2": get_formatted_float_divided_by_100(pricempire_prices.get("buff_p2", {}).get("price")),
                        "Phase 3": get_formatted_float_divided_by_100(pricempire_prices.get("buff_p3", {}).get("price")),
                        "Phase 4": get_formatted_float_divided_by_100(pricempire_prices.get("buff_p4", {}).get("price")),
                    }
                    item_buff163_prices["highest_order"]["doppler"] = {
                        "Sapphire": get_formatted_float_divided_by_100(pricempire_prices.get("buff_sapphire_quick", {}).get("price")),
                        "Ruby": get_formatted_float_divided_by_100(pricempire_prices.get("buff_ruby_quick", {}).get("price")),
                        "Black Pearl": get_formatted_float_divided_by_100(pricempire_prices.get("buff_bp_quick", {}).get("price")),
                        "Emerald": get_formatted_float_divided_by_100(pricempire_prices.get("buff_emerald_quick", {}).get("price")),
                        "Phase 1": get_formatted_float_divided_by_100(pricempire_prices.get("buff_p1_quick", {}).get("price")),
                        "Phase 2": get_formatted_float_divided_by_100(pricempire_prices.get("buff_p2_quick", {}).get("price")),
                        "Phase 3": get_formatted_float_divided_by_100(pricempire_prices.get("buff_p3_quick", {}).get("price")),
                        "Phase 4": get_formatted_float_divided_by_100(pricempire_prices.get("buff_p4_quick", {}).get("price")),
                    }
                buff163_prices[name] = item_buff163_prices
                add_to_master_list(name)

        log.info("Pricing information extracted")
        push_to_s3(csgoempire_prices, 'csgoempire', stage)
        push_to_s3(swapgg_prices, 'swapgg', stage)
        push_to_s3(csgoexo_prices, 'csgoexo', stage)
        push_to_s3(buff163_prices, 'buff163', stage)

    else:
        error = "Could not get items from pricempire"
        alert_via_sns(error)
        log.warning(error, " status code: ", response.status_code)
    return buff163_prices, csgoempire_prices, csgoexo_prices, swapgg_prices


def request_skinport(stage):
    # base64 encoding of auth header per docs:
    # https://docs.skinport.com/#authentication
    log.info("Requesting prices from skinport.com")
    response = requests.get("https://api.skinport.com/v1/items", params={
        "app_id": "730"
    }, headers={
        "Authorization": "Basic " + (base64.b64encode((skinport_client_id + ":" + skinport_client_secret).encode('ascii'))).decode('ascii')
    })
    log.info("Received response from skinport.com")
    skinport_prices = {}
    if response.status_code == 200:
        log.info("Valid response from skinport.com")
        items = response.json()
        log.info("Extracting pricing information")

        for item in items:
            name = item.get('market_hash_name')
            suggested_price = item.get('suggested_price')
            steam_price = item.get('steam_price')
            instant_price = item.get('instant_price')
            starting_at = item.get('min_price')

            skinport_prices[name] = {
                "suggested_price": suggested_price,
                "steam_price": steam_price,
                "instant_price": instant_price,
                "starting_at": starting_at,
            }
            add_to_master_list(name)

        log.info("Pricing information extracted")
        push_to_s3(skinport_prices, 'skinport', stage)

    else:
        error = "Could not get items from skinport.com"
        alert_via_sns(error)
        log.warning(error, " status code: ", response.status_code)
    return skinport_prices


def request_csmoney(stage):
    log.info("Requesting prices from cs.money")
    response = requests.get("https://old.cs.money/js/database-skins/library-en-730.js")
    log.info("Received response from cs.money")
    csmoney_prices = {}
    if response.status_code == 200:
        log.info("Valid response from cs.money")
        items = json.loads(response.content.decode().split("skinsBaseList[730] = ")[1])
        log.info("Extracting pricing information")
        for item in items:
            item = items.get(item)
            name = item.get('m').replace("/", '-')
            price = item.get('a')

            if "Doppler" in name:
                phase = name.split("Doppler ")[1].split(" (")[0]
                name = name.replace(phase + " ", "")
                add_to_master_list(name)
                try:
                    csmoney_prices[name]['doppler'][phase] = price
                except KeyError:
                    csmoney_prices[name] = {
                        'price': price,
                        'doppler': {
                            phase: price
                        }
                    }
                if phase == "Phase 3":
                    csmoney_prices[name]['price'] = price
            else:
                add_to_master_list(name)
                csmoney_prices[name] = {'price': price}

        log.info("Pricing information extracted")
        push_to_s3(csmoney_prices, 'csmoney', stage)
    else:
        error = "Could not get items from cs.money"
        alert_via_sns(error)
        log.warning(error, " status code: ", response.status_code)
    return csmoney_prices


def fetch_csgotm(stage):
    log.info("Requesting prices from csgo.tm")
    response = requests.get("https://market.csgo.com/api/v2/prices/USD.json")
    log.info("Received response from csgo.tm")
    csgotm_prices = {}
    if response.status_code == 200 and response.json()['success']:
        log.info("Valid response from csgo.tm")
        items = response.json()['items']
        log.info("Extracting pricing information")

        for item in items:
            name = item.get('market_hash_name')
            price = item.get('price')

            csgotm_prices[name] = price
            add_to_master_list(name)

        log.info("Pricing information extracted")
        push_to_s3(csgotm_prices, 'csgotm', stage)
    else:
        error = "Could not get items from csgo.tm"
        alert_via_sns(error)
        log.warning(error, " status code: ", response.status_code)
    return csgotm_prices


def request_lootfarm(response, stage):
    log.info("Requesting prices from loot.farm")
    try:
        response = requests.get("https://loot.farm/fullprice.json")
    except Exception as e:
        handle_exception(e, "Error during loot.farm request")
    log.info("Received response from loot.farm")
    lootfarm_prices = {}
    if response.status_code == 200:
        log.info("Valid response from loot.farm")
        items = response.json()
        log.info("Extracting pricing information")

        for item in items:
            name = item.get('name')
            price = item.get('price') / 100

            if "M4A4 | Emperor" in name:
                name = name.replace("M4A4 | Emperor", 'M4A4 | The Emperor')

            if "Doppler" in name:
                phase = name.split("Doppler ")[1].split(" (")[0]
                name = name.replace(phase + " ", "")
                if phase not in special_phases:
                    lootfarm_prices[name] = price
                    add_to_master_list(name)
            else:
                lootfarm_prices[name] = price
                add_to_master_list(name)

        log.info("Pricing information extracted")
        push_to_s3(lootfarm_prices, 'lootfarm', stage)

    else:
        error = "Could not get items from loot.farm"
        alert_via_sns(error)
        log.warning(error, " status code: ", response.status_code)
    return lootfarm_prices


def request_bitskins(response, stage):
    log.info('Requesting bitskins prices')
    try:
        response = requests.get("https://bitskins.com/api/v1/get_all_item_prices/", params={
            "api_key": bitskins_api_key,
            "code": bitskins_token.now(),
            "app_id": "730"
        })
    except Exception as e:
        handle_exception(e, "Error during bitskins request")

    bitskins_prices = {}
    if response.status_code == 200:
        try:
            if response.json()['status'] == "success":
                log.info("Extracting pricing info")
                items = response.json()['prices']
                for item in items:
                    name = item.get('market_hash_name').replace('\xe2\x98\x85', '\u2605').replace("/", '-')
                    add_to_master_list(name)
                    instant_sale_price = item.get('instant_sale_price')

                    if instant_sale_price == "None":
                        instant_sale_price = None

                    bitskins_prices[name] = {
                        "price": item["price"],
                        "instant_sale_price": instant_sale_price
                    }
                log.info("Pricing info extracted")
                push_to_s3(bitskins_prices, 'bitskins', stage)
        except Exception as e:
            handle_exception(e, "Bitskins maintenance?")
    elif response.status_code == 401:
        error = "Could not get items from bitskins, it's most likely an authentication problem"
        alert_via_sns(error)
        log.warning(error, " status code: ", response.status_code)
    else:
        error = "Could not get items from bitskins"
        alert_via_sns(error)
        log.warning(error, " status code: ", response.status_code)
    return bitskins_prices


def fetch_csgobackpack(response):
    log.info("Requesting prices from csgobackpack.net")
    try:
        response = requests.get("http://csgobackpack.net/api/GetItemsList/v2/")
    except Exception as e:
        handle_exception(e, "Error during csgobackpack request")
    log.info("Received response from csgobackpack.net")
    csgobackpack_prices = {}
    if response.status_code == 200 and response.json()['success']:
        log.info("Valid response from csgobackpack.net")
        items = response.json()['items_list']
        log.info("Extracting pricing information")
        for key, value in items.items():
            name = value.get('name').replace("&#39", "'")
            csgobackpack_prices[name] = value.get('price')
        log.info("Pricing information extracted")
    else:
        error = "Could not get items from csgobackpack.net"
        alert_via_sns(error)
        log.warning(error, " status code: ", response.status_code)
    return csgobackpack_prices


def fetch_steamapis(response, stage):
    logging.info('Getting Prices from Steam APIs')
    try:
        response = requests.get("https://api.steamapis.com/market/items/730", params={
            "api_key": steam_apis_key
        })
    except Exception as e:
        handle_exception(e, "Error during steam apis request")
    log.info('Received response from steamapis.com')
    steam_prices = {}
    if response.status_code == 200:
        log.info("Valid response from steamapis.com")
        items = response.json()['data']

        steam_prices_only = {}
        log.info("Extracting pricing information")

        for item in items:
            name = item["market_hash_name"]
            steam_prices[name] = item["prices"]
            if "safe_ts" in item["prices"]:
                steam_prices_only[name] = item["prices"]["safe_ts"]
            add_to_master_list(name)

        log.info("Pricing information extracted")
        push_to_s3(steam_prices_only, 'steam', stage)
    return steam_prices


def push_to_s3(content, provider, stage):
    s3 = boto3.resource('s3')

    if stage == "prod":
        log.info("Getting date for result path")

        today = date.today()
        year = today.strftime("%Y")
        month = today.strftime("%m")
        day = today.strftime("%d")

        log.info(f"Updating latest/{provider}.json in s3")
        s3.Object(result_s3_bucket, f'latest/{provider}.json').put(
            Body=(gzip.compress(bytes(json.dumps(content).encode('UTF-8')), 9)),
            ContentEncoding='gzip'
        )
        log.info(f"latest/{provider}.json updated")
        log.info(f'Uploading prices to {year}/{month}/{day}/{provider}.json')
        s3.Object(result_s3_bucket, f'{year}/{month}/{day}/{provider}.json').put(
            Body=(gzip.compress(bytes(json.dumps(content).encode('UTF-8')), 9)),
            ContentEncoding='gzip'
        )
        log.info("Upload complete")
    elif stage == "dev":
        log.info(f"Updating test/{provider}.json in s3")
        s3.Object(result_s3_bucket, f'test/{provider}.json').put(
            Body=(gzip.compress(bytes(json.dumps(content, indent=2).encode('UTF-8')), 9)),
            ContentEncoding='gzip'
        )


def alert_via_sns(error):
    log.info("Publishing error to SNS")

    sns = boto3.client('sns')

    response = sns.publish(
        TopicArn=sns_topic,
        Message=f'The script could not finish scrapping all prices, error: {error}',
    )

    log.info(response)


def get_steam_price(item, steam_prices, daily_trend, weekly_trend):
    item_prices = steam_prices[item]
    if not (
            item in steam_prices
            and "safe" in item_prices
            and item_prices["safe"] is not None
            and "safe_ts" in item_prices
            and "sold" in item_prices
    ):
        return {
            "price": None,
            "case": "I"
        }

    sold_last_24h = float(item_prices["sold"]["last_24h"])
    sold_last_7d = float(item_prices["sold"]["last_7d"])
    safe_ts_last_24h = float(item_prices["safe_ts"]["last_24h"])
    safe_ts_last_7d = float(item_prices["safe_ts"]["last_7d"])
    safe_ts_last_30d = float(item_prices["safe_ts"]["last_30d"])

    if sold_last_24h >= 5.0 and safe_ts_last_7d != 0.0:
        if abs(1 - safe_ts_last_24h / safe_ts_last_7d) <= 0.1:
            return {
                "price": safe_ts_last_24h,
                "case": "A"
            }
        else:
            return {
                "price": safe_ts_last_7d * daily_trend,
                "case": "B"
            }
    elif safe_ts_last_7d != 0.0 and safe_ts_last_30d != 0.0:
        if abs(1 - safe_ts_last_7d / safe_ts_last_30d) <= 0.1 and sold_last_7d >= 5.0:
            return {
                "price": safe_ts_last_7d * daily_trend,
                "case": "C"
            }
        else:
            return {
                "price": safe_ts_last_30d * weekly_trend * daily_trend,
                "case": "D"
            }
    return {
        "price": safe_ts_last_30d * weekly_trend * daily_trend,
        "case": "D"
    }


def add_to_master_list(name, should_log=False):
    if name not in master_list:
        master_list.append(name)
        if should_log:
            log.info(name + " was not seen before, adding it to master list")


def is_mispriced_knife(item_name, price):
    return any(knife in item_name for knife in knives) and price < 50


def is_mispriced_glove(item_name, price):
    return any(glove in item_name for glove in gloves) and price < 60


def get_non_st_name(name):
    if name.split("StatTrak\u2122")[0] == "":  # when simple st (not a knife)
        return name.split("StatTrak\u2122 ")[1]
    else:
        return "".join(name.split("StatTrak\u2122 "))


def is_mispriced_compared_to_csb(item, price, csb_prices):
    if (
            price in csb_prices
            and "7_days" in csb_prices[item]
            and "median" in csb_prices[item]["7_days"]
            and csb_prices[item]["7_days"]["median"]
    ):
        ratio = csb_prices[item]["7_days"]["median"] / price
        return ratio < 0.8 or ratio > 1.2
    return False


def get_formatted_float(price):
    if price:
        return float("{0:.2f}".format(price))


def get_formatted_float_divided_by_100(price):
    return get_formatted_float(price / 100)


def handle_exception(e, text):
    logging.exception(text)
    formatted_exc = format_exception(e)
    max_length = max(len(i) for i in formatted_exc.split("\n"))
    error_msg = "\n" + text.center(max_length) + "\n"
    error_msg += "-" * max_length + "\n"
    error_msg += formatted_exc
    alert_via_sns(error_msg)


def format_exception(e):
    formatted_exc = traceback.format_exception(type(e), e, e.__traceback__)
    del formatted_exc[0]
    last_line = formatted_exc.pop()
    formatted_exc = [i.lstrip() for i in formatted_exc]
    return "".join(formatted_exc + [last_line])
