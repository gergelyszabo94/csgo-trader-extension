import json
import requests
import boto3
import pyotp
import os
import gzip
from datetime import date
import base64

bitskins_secret = os.environ['BITSKINS_SECRET']
bitskins_token = pyotp.TOTP(bitskins_secret)
bitskins_api_key = os.environ['BITSKINS_API_KEY']
result_s3_bucket = os.environ['RESULTS_BUCKET']
sns_topic = os.environ['SNS_TOPIC_ARN']
own_prices_table = os.environ['OWN_PRICES_TABLE']
steam_apis_key = os.environ['STEAM_APIS_COM_API_KEY']
skinport_cliend_id = os.environ['SKINPORT_CLIENT_ID']
skinport_cliend_secret = os.environ['SKINPORT_CLIENT_SECRET']
pricempire_url = os.environ['PRICEMPIRE_URL']
pricempire_token = os.environ['PRICEMPIRE_TOKEN']
pricempire_header = os.environ['PRICEMPIRE_HEADER']
pricempire_header_value = os.environ['PRICEMPIRE_HEADER_VALUE']

special_phases = ["Ruby", "Sapphire", "Black Pearl", "Emerald"]
knives = ["Bayonet", "Bowie Knife", "Butterfly Knife", "Falchion Knife", "Flip Knife",
          "Gut Knife", "Huntsman Knife", "Karambit", "M9 Bayonet", "Navaja Knife",
          "Shadow Daggers", "Stiletto Knife", "Talon Knife", "Ursus Knife", "Nomad Knife",
          "Skeleton Knife", "Survival Knife", "Paracord Knife", "Classic Knife"]

gloves = ["Gloves", "Hand Wraps"]


def lambda_handler(event, context):
    arn_split = context.invoked_function_arn.split(':')
    stage_candidate = arn_split[len(arn_split) - 1]
    stage = 'dev' if stage_candidate == 'priceScraper' else 'prod'  # if there is an alias it's prod

    # buff prices are in rehminbi, they have to be converted
    print("Getting exchange rates")
    try:
        response = requests.get("https://prices.csgotrader.app/latest/exchange_rates.json")
    except Exception as e:
        print(e)
        error = "Error requesting exchange rates"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }

    exchange_rates = response.json()

    master_list = []

    dynamodb = boto3.resource('dynamodb', region_name='eu-west-2')
    table = dynamodb.Table(own_prices_table)

    print("Getting own prices from Dynamo")

    response = table.scan(ProjectionExpression="market_hash_name, price")
    own_prices = {}

    for item in response['Items']:
        name = item["market_hash_name"]
        own_prices[name] = float(item["price"])
        add_to_master_list(master_list, name, False)

    print('Getting Prices from Steam APIs')
    try:
        response = requests.get("https://api.steamapis.com/market/items/730?api_key=" + steam_apis_key)
    except Exception as e:
        print(e)
        error = "Error during steam apis request"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }

    print('Received response from steamapis.com')

    if response.status_code == 200:
        print("Valid response from steamapis.com")
        items = response.json()['data']
        steam_prices = {}
        steam_prices_only = {}
        print("Extracting pricing information")

        for item in items:
            name = item["market_hash_name"]
            steam_prices[name] = item["prices"]
            if "safe_ts" in item["prices"]:
                steam_prices_only[name] = item["prices"]["safe_ts"]
            add_to_master_list(master_list, name, False)

        print("Pricing information extracted")
        push_to_s3(steam_prices_only, 'steam', stage)

    print("Requesting prices from csgobackpack.net")
    try:
        response = requests.get("http://csgobackpack.net/api/GetItemsList/v2/")
    except Exception as e:
        print(e)
        error = "Error during csgobackpack request"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }

    print("Received response from csgobackpack.net")

    if response.status_code == 200 and response.json()['success']:
        print("Valid response from csgobackpack.net")
        items = response.json()['items_list']
        csgobackpack_prices = {}
        print("Extracting pricing information")
        for key, value in items.items():
            name = items.get(key).get('name').replace("&#39", "'")
            price = items.get(key).get('price')

            if price:
                csgobackpack_prices[name] = price
            else:
                csgobackpack_prices[name] = "null"

        print("Pricing information extracted")

    else:
        error = "Could not get items from csgobackpack.net"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }

    print('Requesting bitskins prices')
    try:
        response = requests.get(
            "https://bitskins.com/api/v1/get_all_item_prices/?api_key=" + bitskins_api_key + "&code=" + bitskins_token.now() + "&app_id=730")
    except Exception as e:
        print(e)
        error = "Error during bitskins request"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }

    if response.status_code == 200:
        try:
            if response.json()['status'] == "success":
                bitskins_prices = {}
                print("Extracting pricing info")
                items = response.json()['prices']
                for item in items:
                    name = item.get('market_hash_name').replace('\xe2\x98\x85', '\u2605').replace("/", '-')
                    add_to_master_list(master_list, name, True)
                    instant_sale_price = item.get('instant_sale_price')

                    if instant_sale_price == "None":
                        instant_sale_price = "null"

                    bitskins_prices[name] = {
                        "price": item["price"],
                        "instant_sale_price": item["instant_sale_price"]
                    }
                print("Pricing info extracted")
                push_to_s3(bitskins_prices, 'bitskins', stage)
        except Exception as e:
            print(e)
            error = "Bitskins maintenance?"
            alert_via_sns(f'{error}: {e}')
            return {
                'statusCode': 500,
                'body': json.dumps(error)
            }
    elif response.status_code == 401:
        error = "Could not get items from bitskins, it's most likely an authentication problem"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }
    else:
        error = "Could not get items from bitskins"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }

    print("Requesting prices from loot.farm")
    try:
        response = requests.get("https://loot.farm/fullprice.json")
    except Exception as e:
        print(e)
        error = "Error during loot.farm request"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }
    print("Received response from loot.farm")

    if response.status_code == 200:
        print("Valid response from loot.farm")
        items = response.json()
        lootfarm_prices = {}
        print("Extracting pricing information")

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
                    add_to_master_list(master_list, name, True)
            else:
                lootfarm_prices[name] = price
                add_to_master_list(master_list, name, True)

        print("Pricing information extracted")
        push_to_s3(lootfarm_prices, 'lootfarm', stage)

    else:
        error = "Could not get items from loot.farm"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }

    print("Requesting prices from csgo.tm")
    response = requests.get("https://market.csgo.com/api/v2/prices/USD.json")
    print("Received response from csgo.tm")

    if response.status_code == 200 and response.json()['success']:
        print("Valid response from csgo.tm")
        items = response.json()['items']
        print("Extracting pricing information")

        csgotm_prices = {}
        for item in items:
            name = item.get('market_hash_name')
            price = item.get('price')

            csgotm_prices[name] = price
            add_to_master_list(master_list, name, True)

        print("Pricing information extracted")
        push_to_s3(csgotm_prices, 'csgotm', stage)

    else:
        error = "Could not get items from csgo.tm"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }

    print("Requesting prices from cs.money")
    response = requests.get("https://cs.money/js/database-skins/library-en-730.js")
    print("Received response from cs.money")

    if response.status_code == 200:
        print("Valid response from cs.money")
        items = json.loads(response.content.decode().split("skinsBaseList[730] = ")[1])
        print("Extracting pricing information")

        csmoney_prices = {}
        for item in items:
            item = items.get(item)
            name = item.get('m').replace("/", '-')
            price = item.get('a')

            if "Doppler" in name:
                phase = name.split("Doppler ")[1].split(" (")[0]
                name = name.replace(phase + " ", "")
                add_to_master_list(master_list, name, True)
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
                add_to_master_list(master_list, name, True)
                csmoney_prices[name] = {'price': price}

        print("Pricing information extracted")
        push_to_s3(csmoney_prices, 'csmoney', stage)
    else:
        error = "Could not get items from cs.money"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }

    # base64 encoding of auth header per docs:
    # https://docs.skinport.com/#authentication
    auth_string = (base64.b64encode((skinport_cliend_id + ":" + skinport_cliend_secret).encode('ascii'))).decode('ascii')
    print(auth_string)
    print("Requesting prices from skinport.com")
    response = requests.get(
        "https://api.skinport.com/v1/items?app_id=730",
        headers={"Authorization": "Basic " + auth_string},
    )
    print("Received response from skinport.com")

    if response.status_code == 200:
        print("Valid response from skinport.com")
        items = response.json()
        print("Extracting pricing information")

        skinport_prices = {}
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
            add_to_master_list(master_list, name, True)

        print("Pricing information extracted")
        push_to_s3(skinport_prices, 'skinport', stage)

    else:
        error = "Could not get items from skinport.com"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }

    print("Requesting prices from pricempire")
    response = requests.get(
        pricempire_url + pricempire_token,
        headers={pricempire_header: pricempire_header_value, "Cookie": "token=" + pricempire_token},
    )
    print("Received response from pricempire")

    if response.status_code == 200 and len(response.json()) != 0:
        print("Valid response from pricempire")
        items = response.json()
        print("Extracting pricing information")

        cny_rate = float(exchange_rates["CNY"])

        csgoempire_prices = {}
        swapgg_prices = {}
        csgoexo_prices = {}
        buff163_prices = {}

        for item in items:
            name = item.get('market_hash_name')
            csgoempire_price = item.get('csgoempire')
            swapgg_price = item.get('swapgg')
            csgoexo_price = item.get('csgoexo')

            buff_starting_at = item.get('buff163')
            buff_highest_order = item.get('buff163_quick')
            buff163_price = {
                "starting_at": "null" if buff_starting_at is None else float(buff_starting_at) / cny_rate,
                "highest_order": "null" if buff_highest_order is None else float(buff_highest_order) / cny_rate,
            }

            csgoempire_prices[name] = csgoempire_price
            swapgg_prices[name] = swapgg_price
            csgoexo_prices[name] = csgoexo_price
            buff163_prices[name] = buff163_price

            add_to_master_list(master_list, name, True)

        print("Pricing information extracted")
        push_to_s3(csgoempire_prices, 'csgoempire', stage)
        push_to_s3(swapgg_prices, 'swapgg', stage)
        push_to_s3(csgoexo_prices, 'csgoexo', stage)
        push_to_s3(buff163_prices, 'buff163', stage)

    else:
        error = "Could not get items from pricempire"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }

    print("Creates own pricing")
    print("Calculate market trends")

    week_to_day = 0
    month_to_week = 0
    count = 0
    for item in master_list:
        if item in steam_prices and "safe_ts" in steam_prices[item] and "last_24h" in steam_prices[item]["safe_ts"] \
                and "last_7d" in steam_prices[item]["safe_ts"] and "last_30d" in steam_prices[item]["safe_ts"]:
            daily = float(steam_prices[item]["safe_ts"]["last_24h"])
            weekly = float(steam_prices[item]["safe_ts"]["last_7d"])
            monthly = float(steam_prices[item]["safe_ts"]["last_30d"])
            if (daily != 0 and weekly != 0 and monthly != 0) and (daily > 0.1 and weekly > 0.1 and monthly > 0.1):
                wtd_ratio = daily / weekly
                mtw_ratio = weekly / monthly

                if 0 < wtd_ratio < 2 and 0 < mtw_ratio < 2:
                    week_to_day += wtd_ratio
                    month_to_week += mtw_ratio
                    count += 1
    week_to_day = week_to_day / count
    month_to_week = month_to_week / count
    print("Market trends: WtD: " + str(week_to_day) + " MtW: " + str(month_to_week))

    print("Getting price difference ratio between steam:bitskins and steam:csmoney")
    st_bit = 0
    st_csm = 0
    count = 0

    for item in master_list:
        if item in steam_prices and "safe_ts" in steam_prices[item] and "last_7d" in steam_prices[item]["safe_ts"] \
                and item in bitskins_prices and "price" in bitskins_prices[item] \
                and item in csmoney_prices and "price" in csmoney_prices[item] and csmoney_prices[item][
            "price"] != "" and csmoney_prices[item]["price"] != "null":
            st_weekly = float(steam_prices[item]["safe_ts"]["last_7d"])
            bit = float(bitskins_prices[item]["price"])
            csm = float(csmoney_prices[item]["price"])
            if (st_weekly != 0 and bit != 0 and csm != 0) and (st_weekly > 0.1 and bit > 0.1 and csm > 0.1):
                st_bit_ratio = st_weekly / bit
                st_csm_ratio = st_weekly / csm

                if 0 < st_bit_ratio < 2 and 0 < st_csm_ratio < 2:
                    st_bit += st_bit_ratio
                    st_csm += st_csm_ratio
                    count += 1
    st_bit = st_bit / count
    st_csm = st_csm / count
    print("Steam:Bitskins: " + str(st_bit) + " Steam:Csmoney:  " + str(st_csm))

    print("Creating csgotrader prices")
    csgotrader_prices = {}

    for item in master_list:
        steam_aggregate = get_steam_price(item, steam_prices, week_to_day, month_to_week)
        case = steam_aggregate["case"]  # only used to debug pricing in dev mode
        price = "null"

        if steam_aggregate["price"] != "null" and steam_aggregate["price"] != 0.0 \
                and not is_mispriced_knife(item, steam_aggregate["price"]) \
                and not is_mispriced_glove(item, steam_aggregate["price"]) \
                and not is_mispriced_compared_to_csb(item, steam_aggregate["price"], csgobackpack_prices):
            price = float("{0:.2f}".format(steam_aggregate["price"]))
        elif item in csmoney_prices and "price" in csmoney_prices[item] and csmoney_prices[item]["price"] != "null" and \
                csmoney_prices[item]["price"] != 0:
            price = float("{0:.2f}".format(float(csmoney_prices[item]["price"]) * st_csm * week_to_day))
            case = "F"
        elif item in bitskins_prices and "price" in bitskins_prices[item] and bitskins_prices[item]["price"] != "null":
            price = float("{0:.2f}".format(float(bitskins_prices[item]["price"]) * st_bit * week_to_day))
            case = "G"
        elif item in own_prices:
            price = own_prices[item]
            case = "H"

        if "Doppler" in item:
            doppler = {}
            for phase in csmoney_prices[item]["doppler"]:
                doppler[phase] = float("{0:.2f}".format(float(csmoney_prices[item]["doppler"][phase]) * st_csm))
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

    print("Check if the non-st version is cheaper")
    for item in csgotrader_prices:
        is_st = True if "StatTrak\u2122" in item else False
        if is_st:
            none_st_name = get_non_st_name(item)
            if none_st_name in csgotrader_prices and csgotrader_prices[none_st_name]["price"] != "null" \
                    and csgotrader_prices[item]["price"] != "null" and float(
                csgotrader_prices[none_st_name]["price"]) > float(csgotrader_prices[item]["price"]):
                # if the st version is cheaper then the non-st's price is used
                if stage == "dev":
                    csgotrader_prices[item] = {
                        "price": float(csgotrader_prices[none_st_name]["price"]) * 1.1,
                        "case": "E"
                    }
                else:
                    csgotrader_prices[item] = {"price": float(csgotrader_prices[none_st_name]["price"]) * 1.1}

    print("csgotrader prices created")
    push_to_s3(csgotrader_prices, 'csgotrader', stage)

    print("Putting together the final prices dict")
    extract = {}

    for item in master_list:
        extract[item] = {}
        if item in steam_prices and "safe_ts" in steam_prices[item]:
            extract[item]["steam"] = steam_prices[item]["safe_ts"]
        else:
            extract[item]["steam"] = {
                "last_90d": "null",
                "last_30d": "null",
                "last_7d": "null",
                "last_24h": "null"
            }
        if item in bitskins_prices:
            extract[item]["bitskins"] = bitskins_prices[item]
        else:
            extract[item]["bitskins"] = "null"
        if item in lootfarm_prices:
            extract[item]["lootfarm"] = lootfarm_prices[item]
        else:
            extract[item]["lootfarm"] = "null"
        if item in csgotm_prices:
            extract[item]["csgotm"] = csgotm_prices[item]
        else:
            extract[item]["csgotm"] = "null"
        if item in csmoney_prices:
            extract[item]["csmoney"] = csmoney_prices[item]
        else:
            extract[item]["csmoney"] = "null"
        if item in skinport_prices:
            extract[item]["skinport"] = skinport_prices[item]
        else:
            extract[item]["skinport"] = "null"
        if item in csgotrader_prices:
            extract[item]["csgotrader"] = csgotrader_prices[item]
        else:
            extract[item]["csgotrader"] = "null"
        if item in csgoempire_prices:
            extract[item]["csgoempire"] = csgoempire_prices[item]
        else:
            extract[item]["csgoempire"] = "null"
        if item in swapgg_prices:
            extract[item]["swapgg"] = swapgg_prices[item]
        else:
            extract[item]["swapgg"] = "null"
        if item in csgoexo_prices:
            extract[item]["csgoexo"] = csgoexo_prices[item]
        else:
            extract[item]["csgoexo"] = "null"
        if item in buff163_prices:
            extract[item]["buff163"] = buff163_prices[item]
        else:
            extract[item]["buff163"] = {
                "starting_at": "null",
                "highest_order": "null",
            }

    push_to_s3(extract, 'prices_v5', stage)
    return {
        'statusCode': 200,
        'body': json.dumps('Success!')
    }


def push_to_s3(content, provider, stage):
    s3 = boto3.resource('s3')

    if stage == "prod":
        print("Getting date for result path")

        today = date.today()
        year = today.strftime("%Y")
        month = today.strftime("%m")
        day = today.strftime("%d")

        print(f"Updating latest/{provider}.json in s3")
        s3.Object(result_s3_bucket, f'latest/{provider}.json').put(
            Body=(gzip.compress(bytes(json.dumps(content).encode('UTF-8')), 9)),
            ContentEncoding='gzip'
        )
        print(f"latest/{provider}.json updated")
        print(f'Uploading prices to {year}/{month}/{day}/{provider}.json')
        s3.Object(result_s3_bucket, f'{year}/{month}/{day}/{provider}.json').put(
            Body=(gzip.compress(bytes(json.dumps(content).encode('UTF-8')), 9)),
            ContentEncoding='gzip'
        )
        print("Upload complete")
    elif stage == "dev":
        print(f"Updating test/{provider}.json in s3")
        s3.Object(result_s3_bucket, f'test/{provider}.json').put(
            Body=(gzip.compress(bytes(json.dumps(content, indent=2).encode('UTF-8')), 9)),
            ContentEncoding='gzip'
        )


def alert_via_sns(error):
    print("Publishing error to SNS")

    sns = boto3.client('sns')

    response = sns.publish(
        TopicArn=sns_topic,
        Message=f'The script could not finish scrapping all prices, error: {error}',
    )

    print(response)


def get_steam_price(item, steam_prices, daily_trend, weekly_trend):
    if item in steam_prices and "safe" in steam_prices[item] and steam_prices[item]["safe"] is not None:
        if "safe_ts" in steam_prices[item] and "sold" in steam_prices[item]:
            if float(steam_prices[item]["sold"]["last_24h"]) >= 5.0 and float(
                    steam_prices[item]["safe_ts"]["last_7d"]) != 0.0:
                if abs(1 - float(steam_prices[item]["safe_ts"]["last_24h"]) / float(
                        steam_prices[item]["safe_ts"]["last_7d"])) <= 0.1:
                    return {
                        "price": steam_prices[item]["safe_ts"]["last_24h"],
                        "case": "A"
                    }
                else:
                    return {
                        "price": float(steam_prices[item]["safe_ts"]["last_7d"]) * daily_trend,
                        "case": "B"
                    }
            elif float(steam_prices[item]["safe_ts"]["last_7d"]) != 0.0 and float(
                    steam_prices[item]["safe_ts"]["last_30d"]) != 0.0:
                if abs(1 - float(steam_prices[item]["safe_ts"]["last_7d"]) / float(
                        steam_prices[item]["safe_ts"]["last_30d"])) <= 0.1 \
                        and float(steam_prices[item]["sold"]["last_7d"]) >= 5.0:
                    return {
                        "price": float(steam_prices[item]["safe_ts"]["last_7d"]) * daily_trend,
                        "case": "C"
                    }
                else:
                    return {
                        "price": float(steam_prices[item]["safe_ts"]["last_30d"]) * weekly_trend * daily_trend,
                        "case": "D"
                    }
            else:
                return {
                    "price": float(steam_prices[item]["safe_ts"]["last_30d"]) * weekly_trend * daily_trend,
                    "case": "D"
                }

    return {
        "price": "null",
        "case": "I"
    }


def add_to_master_list(master_list, name, to_log):
    if name not in master_list:
        master_list.append(name)
        if to_log:
            print(name + " was not seen before, adding it to master list")


def is_mispriced_knife(item_name, price):
    contains = False

    for knife in knives:
        if knife in item_name:
            contains = True

    if contains and price < 50:
        return True
    else:
        return False


def is_mispriced_glove(item_name, price):
    contains = False

    for glove in gloves:
        if glove in item_name:
            contains = True

    if contains and price < 60:
        return True
    else:
        return False


def get_non_st_name(name):
    if name.split("StatTrak\u2122")[0] == "":  # when simple st (not a knife)
        return name.split("StatTrak\u2122 ")[1]
    else:
        return "".join(name.split("StatTrak\u2122 "))


def is_mispriced_compared_to_csb(item, price, csb_prices):
    if price in csb_prices and "7_days" in csb_prices[item] \
            and "median" in csb_prices[item]["7_days"] \
            and csb_prices[item]["7_days"]["median"] != "null" \
            and csb_prices[item]["7_days"]["median"] != 0:
        ratio = csb_prices[item]["7_days"]["median"] / price
        if ratio < 0.8 or ratio > 1.2:
            return True
        else:
            return False
    else:
        return False
