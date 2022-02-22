import base64
import gzip
import json
import logging
import os
import sys
import traceback
from datetime import date
from typing import Union, Tuple, Any, Dict, Optional

import boto3
import pyotp
import requests
from requests.exceptions import RequestException

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
    steam_prices = fetch_steamapis(stage)
    csgobackpack_prices = fetch_csgobackpack()
    bitskins_prices = fetch_bitskins(stage)
    lootfarm_prices = fetch_lootfarm(stage)
    csgotm_prices = fetch_csgotm(stage)
    csmoney_prices = fetch_csmoney(stage)
    skinport_prices = fetch_skinport(stage)
    cstrade_prices = fetch_cstrade(stage)
    skinwallet_prices = fetch_skinwallet(stage)
    (
        buff163_prices,
        csgoempire_prices,
        csgoexo_prices,
        swapgg_prices
    ) = fetch_priceempire(stage)

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
        cstrade_prices,
        skinwallet_prices,
    ]

    if all(all_prices_list):
        push_final_prices(bitskins_prices, buff163_prices, csgoempire_prices, csgoexo_prices, csgotm_prices, csgotrader_prices, csmoney_prices, lootfarm_prices,
                          skinport_prices, stage, steam_prices, swapgg_prices, cstrade_prices, skinwallet_prices)
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


def fetch_own_prices() -> Tuple[Dict[str, float], Any]:
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


def create_csgotrader_prices(buff163_prices, csgobackpack_prices, csmoney_prices, own_prices, stage, steam_prices) -> dict:
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

            if "Doppler" in item and item in csmoney_prices and "doppler" in csmoney_prices[item] and csmoney_prices[item]["doppler"]:
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
                      skinport_prices, stage, steam_prices, swapgg_prices, cstrade_prices, skinwallet_prices):
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
        extract[item]["cstrade"] = cstrade_prices.get(item)
        extract[item]["skinwallet"] = skinwallet_prices.get(item)
        extract[item]["buff163"] = buff163_prices.get(item, {
            "starting_at": None,
            "highest_order": None,
        })
    push_to_s3(extract, 'prices_v6', stage)

def fetch_cstrade(stage) -> Dict[str, float]:
    log.info("Requesting prices from cs.trade")
    try:
        response = requests.get("https://cdn.cs.trade:2096/api/prices_CSGO")
        response.raise_for_status()
        log.info("Received response from cs.trade")
    except RequestException:
        handle_exception("Error during cs.trade request")
        return {}

    log.info("Valid response from cs.trade")
    log.info("Extracting pricing information")

    cstrade_prices = {}
    items = response.json()

    for name, item in items.items():
        if "Doppler" not in name:
            if name in cstrade_prices:
                cstrade_prices[name]["price"] = item.get("price")
            else:
                cstrade_prices[name] = {
                    "price": item.get("price"),
                }
        else:
            removed_phase = remove_phase_from_name(name)
            name_without_phase = removed_phase.get("name")
            doppler_phase = removed_phase.get("phase")

            if name_without_phase in cstrade_prices:
                if doppler_phase is not "":
                    cstrade_prices[name_without_phase]["doppler"][doppler_phase] = item.get("price")
                else:
                    cstrade_prices[name_without_phase]["price"] = item.get("price")
            else:
                cstrade_prices[name_without_phase] = {}

                if doppler_phase is not "":
                    cstrade_prices[name_without_phase] = {
                        "doppler": {
                            doppler_phase: item.get("price")
                        },
                        "price": None,
                    }
                else:
                    cstrade_prices[name_without_phase] = {
                        "doppler": {},
                        "price": item.get("price"),
                    }

    log.info("Pricing information extracted")
    push_to_s3(cstrade_prices, 'cstrade', stage)

    return cstrade_prices

def fetch_skinwallet(stage) -> Dict[str, float]:
    log.info("Requesting prices from skinwallet.com")
    try:
        response = requests.get("https://www.skinwallet.com/market/api/offers/overview", params={
            "appId": "730"
        }, headers={
            "accept": "application/json",
            "x-auth-token": skinwallet_api_key
        })
        response.raise_for_status()
        log.info("Received response from skinwallet.com")
    except RequestException:
        handle_exception("Error during skinwallet request")
        return {}

    if response.json()['status'] != 'Success':
        handle_invalid_data("skinwallet.com", response.status_code)
        return {}

    log.info("Valid response from skinwallet.com")
    log.info("Extracting pricing information")

    skinwallet_prices = {}
    items = response.json()['result']

    for item in items:
        name = item.get('marketHashName')
        skinwallet_prices[name] = item.get('cheapestOffer').get('price').get('amount')

    log.info("Pricing information extracted")
    push_to_s3(skinwallet_prices, 'skinwallet', stage)

    return skinwallet_prices


# trying to typehint all of these would get really ugly really fast

def fetch_priceempire(stage) -> Tuple[dict, dict, dict, dict]:
    log.info("Requesting prices from pricempire")

    try:
        response = requests.get("https://api.pricempire.com/v2/getAllItems", params={
            "token": pricempire_token,
            "currency": "USD",
            "source": "csgoempire,swapgg,csgoexo,buff,buff163,buff163_quick",
            "inflationThreshold": "1000",
            "maxAge": "30",
        })
        response.raise_for_status()
        log.info("Received response from pricempire")
    except RequestException:
        handle_exception("Error during priceempire request")
        return {}, {}, {}, {}

    response_json = response.json()

    csgoempire_prices = {}
    swapgg_prices = {}
    csgoexo_prices = {}
    buff163_prices = {}

    if not (response.status_code == 200 and len(response_json) != 0):
        handle_invalid_data("priceempire", response.status_code)
        return {}, {}, {}, {}

    log.info("Valid response from pricempire")
    log.info("Extracting pricing information")

    for name, price in response_json.items():
        # pricempire_prices = item.get('prices')

        if price is not None:
            csgoempire_prices[name] = get_formatted_float_divided_by_100(price.get('csgoempire', {}))
            swapgg_prices[name] = get_formatted_float_divided_by_100(price.get('swapgg', {}))
            csgoexo_prices[name] = get_formatted_float_divided_by_100(price.get('csgoexo', {}))

            item_buff163_price = price.get('buff163', {})
            item_buff163_quick_price = price.get('buff163_quick', {})

            item_buff163_prices = {"starting_at": {}, "highest_order": {}}
            item_buff163_prices["starting_at"]["price"] = get_formatted_float_divided_by_100(item_buff163_price)
            item_buff163_prices["highest_order"]["price"] = get_formatted_float_divided_by_100(item_buff163_quick_price)

            if "Doppler" in name:
                item_buff163_prices["starting_at"]["doppler"] = {
                    "Sapphire": get_formatted_float_divided_by_100(price.get("buff_sapphire", {})),
                    "Ruby": get_formatted_float_divided_by_100(price.get("buff_ruby", {})),
                    "Black Pearl": get_formatted_float_divided_by_100(price.get("buff_bp", {})),
                    "Emerald": get_formatted_float_divided_by_100(price.get("buff_emerald", {})),
                    "Phase 1": get_formatted_float_divided_by_100(price.get("buff_p1", {})),
                    "Phase 2": get_formatted_float_divided_by_100(price.get("buff_p2", {})),
                    "Phase 3": get_formatted_float_divided_by_100(price.get("buff_p3", {})),
                    "Phase 4": get_formatted_float_divided_by_100(price.get("buff_p4", {})),
                }
                item_buff163_prices["highest_order"]["doppler"] = {
                    "Sapphire": get_formatted_float_divided_by_100(price.get("buff_sapphire_quick", {})),
                    "Ruby": get_formatted_float_divided_by_100(price.get("buff_ruby_quick", {})),
                    "Black Pearl": get_formatted_float_divided_by_100(price.get("buff_bp_quick", {})),
                    "Emerald": get_formatted_float_divided_by_100(price.get("buff_emerald_quick", {})),
                    "Phase 1": get_formatted_float_divided_by_100(price.get("buff_p1_quick", {})),
                    "Phase 2": get_formatted_float_divided_by_100(price.get("buff_p2_quick", {})),
                    "Phase 3": get_formatted_float_divided_by_100(price.get("buff_p3_quick", {})),
                    "Phase 4": get_formatted_float_divided_by_100(price.get("buff_p4_quick", {})),
                }
            buff163_prices[name] = item_buff163_prices
            add_to_master_list(name)

    log.info("Pricing information extracted")
    push_to_s3(csgoempire_prices, 'csgoempire', stage)
    push_to_s3(swapgg_prices, 'swapgg', stage)
    push_to_s3(csgoexo_prices, 'csgoexo', stage)
    push_to_s3(buff163_prices, 'buff163', stage)

    return buff163_prices, csgoempire_prices, csgoexo_prices, swapgg_prices


def fetch_skinport(stage) -> Dict[str, Dict[str, Optional[float]]]:
    # base64 encoding of auth header per docs:
    # https://docs.skinport.com/#authentication
    log.info("Requesting prices from skinport.com")

    try:
        response = requests.get("https://api.skinport.com/v1/items", params={
            "app_id": "730"
        }, headers={
            "Authorization": "Basic " + (base64.b64encode((skinport_client_id + ":" + skinport_client_secret).encode('ascii'))).decode('ascii')
        })
        response.raise_for_status()
        log.info("Received response from skinport.com")
    except RequestException:
        handle_exception("Error during skinport request")
        return {}

    log.info("Valid response from skinport.com")
    log.info("Extracting pricing information")

    skinport_prices = {}
    items = response.json()

    for item in items:
        name = item.get('market_hash_name')
        suggested_price = item.get('suggested_price')
        starting_at = item.get('min_price')

        skinport_prices[name] = {
            "suggested_price": suggested_price,
            "starting_at": starting_at,
        }
        add_to_master_list(name)

    log.info("Pricing information extracted")
    push_to_s3(skinport_prices, 'skinport', stage)
    return skinport_prices


def fetch_csmoney(stage) -> Dict[str, Dict[str, float]]:
    log.info("Requesting prices from cs.money")

    try:
        response = requests.get("https://old.cs.money/js/database-skins/library-en-730.js")
        response.raise_for_status()
        log.info("Received response from cs.money")
    except RequestException:
        handle_exception("Error during csmoney request")
        return {}

    log.info("Valid response from cs.money")
    log.info("Extracting pricing information")

    csmoney_prices = {}
    items = json.loads(response.content.decode().split("skinsBaseList[730] = ")[1])

    for item in items.values():
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
    return csmoney_prices


def fetch_csgotm(stage) -> Dict[str, str]:
    log.info("Requesting prices from csgo.tm")

    try:
        response = requests.get("https://market.csgo.com/api/v2/prices/USD.json")
        response.raise_for_status()
        log.info("Received response from csgo.tm")
    except RequestException:
        handle_exception("Error during csgo.tm request")
        return {}

    if not (response.json()['success']):
        handle_invalid_data("csgo.tm", response.status_code)
        return {}

    log.info("Valid response from csgo.tm")
    log.info("Extracting pricing information")

    csgotm_prices = {}
    items = response.json()['items']

    for item in items:
        name = item.get('market_hash_name')
        price = item.get('price')

        csgotm_prices[name] = price
        add_to_master_list(name)

    log.info("Pricing information extracted")
    push_to_s3(csgotm_prices, 'csgotm', stage)
    return csgotm_prices


def fetch_lootfarm(stage) -> Dict[str, float]:
    log.info("Requesting prices from loot.farm")

    try:
        response = requests.get("https://loot.farm/fullprice.json")
        response.raise_for_status()
        log.info("Received response from loot.farm")
    except RequestException:
        handle_exception("Error during loot.farm request")
        return {}

    log.info("Valid response from loot.farm")
    log.info("Extracting pricing information")

    lootfarm_prices = {}
    items = response.json()

    for item in items:
        name = item.get('name')
        price = item.get('price') / 100

        if "M4A4 | Emperor" in name:
            name = name.replace("M4A4 | Emperor", 'M4A4 | The Emperor')

        if "Doppler" in name:
            phase = name.split("Doppler ")[1].split(" (")[0]
            name = name.replace(phase + " ", "")

            if phase not in special_phases:
                continue

        lootfarm_prices[name] = price
        add_to_master_list(name)

    log.info("Pricing information extracted")
    push_to_s3(lootfarm_prices, 'lootfarm', stage)
    return lootfarm_prices


def fetch_bitskins(stage) -> Dict[str, Dict[str, Optional[str]]]:
    log.info('Requesting bitskins prices')

    try:
        response = requests.get("https://bitskins.com/api/v1/get_all_item_prices/", params={
            "api_key": bitskins_api_key,
            "code": bitskins_token.now(),
            "app_id": "730"
        })
        response.raise_for_status()
        log.info("Received response from bitskins")
    except RequestException:
        handle_exception("Error during bitskins request")
        return {}

    if response.json().get('status') != "success":
        handle_invalid_data("bitskins", response.status_code)
        return {}

    bitskins_prices = {}
    try:
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
    except Exception:
        handle_exception("Bitskins maintenance?")
    return bitskins_prices


def fetch_csgobackpack() -> Dict[str, Optional[Dict[str, Dict[str, Union[str, float]]]]]:
    log.info("Requesting prices from csgobackpack.net")

    try:
        response = requests.get("http://csgobackpack.net/api/GetItemsList/v2/")
        response.raise_for_status()
        log.info("Received response from csgobackpack.net")
    except RequestException:
        handle_exception("Error during csgobackpack request")
        return {}

    if not (response.json()['success']):
        handle_invalid_data("csgobackpack.net", response.status_code)
        return {}

    log.info("Valid response from csgobackpack.net")
    log.info("Extracting pricing information")

    csgobackpack_prices = {}
    items = response.json()['items_list']

    for key, value in items.items():
        name = value.get('name').replace("&#39", "'")
        csgobackpack_prices[name] = value.get('price')

    log.info("Pricing information extracted")
    return csgobackpack_prices


def fetch_steamapis(stage) -> Dict[str, Dict[str, float]]:
    logging.info('Getting Prices from Steam APIs')

    try:
        response = requests.get("https://api.steamapis.com/market/items/730", params={
            "api_key": steam_apis_key
        })
        response.raise_for_status()
        log.info('Received response from steamapis.com')
    except RequestException:
        handle_exception("Error during steam apis request")
        return {}

    log.info("Valid response from steamapis.com")
    log.info("Extracting pricing information")

    steam_prices = {}
    steam_prices_only = {}
    items = response.json()['data']

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
    item_prices = steam_prices.get(item)
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


def get_formatted_float(price: Optional[float]):
    if price:
        return float("{0:.2f}".format(price))


def get_formatted_float_divided_by_100(price: Optional[float]):
    if price:
        return get_formatted_float(price / 100)


def handle_exception(text: str):
    logging.exception(text)
    if sys.last_value:
        formatted_exc = format_exception(sys.last_value)
        max_length = max(len(i) for i in formatted_exc.split("\n"))
        error_msg = "\n" + text.center(max_length) + "\n"
        error_msg += "-" * max_length + "\n"
        error_msg += formatted_exc
        alert_via_sns(error_msg)
    else:
        alert_via_sns(text)


def format_exception(e: BaseException):
    formatted_exc = traceback.format_exception(type(e), e, e.__traceback__)
    del formatted_exc[0]
    last_line = formatted_exc.pop()
    formatted_exc = [i.lstrip() for i in formatted_exc]
    return "".join(formatted_exc + [last_line])


def handle_invalid_data(name: str, status_code: int):
    error = f"Failed to parse request from {name}."
    alert_via_sns(error)
    log.warning(f"{error} status_code: {status_code}")

def remove_phase_from_name(item_name):
    name_without_phase = item_name
    item_phase = ""
    phases = [
        "Phase 1",
        "Phase 2",
        "Phase 3",
        "Phase 4",
        "Sapphire",
        "Ruby",
        "Black Pearl",
        "Emerald",
    ]

    for phase in phases:
        if phase in item_name:
            item_phase = phase
            name_without_phase = "".join(item_name.split(phase + " "))

    return {
        "name": name_without_phase,
        "phase": item_phase,
    }