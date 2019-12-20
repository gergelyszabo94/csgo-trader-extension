import json
import requests
import boto3
import pyotp
import os
import gzip
from datetime import date

bitskins_secret = os.environ['BITSKINS_SECRET']
bitskins_token = pyotp.TOTP(bitskins_secret)
bitskins_api_key = os.environ['BITSKINS_API_KEY']
result_s3_bucket = os.environ['RESULTS_BUCKET']
sns_topic = os.environ['SNS_TOPIC_ARN']
stage = os.environ['STAGE']
own_prices_table = os.environ['OWN_PRICES_TABLE']
steam_apis_key = os.environ['STEAM_APIS_COM_API_KEY']


def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-2')
    table = dynamodb.Table(own_prices_table)

    print("Getting own prices from Dynamo")

    response = table.scan(ProjectionExpression="market_hash_name, price")
    own_prices = {}

    for item in response['Items']:
        own_prices[item.get('market_hash_name')] = float(item.get('price'))

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
        extract = {}
        print("Extracting pricing information")

        for item in items:
            extract[item["market_hash_name"]] = {
                "steam": item["prices"]
            }

        print("Pricing information extracted")

    print('Requesting bitskins prices')
    try:
        response = requests.get("https://bitskins.com/api/v1/get_all_item_prices/?api_key=" + bitskins_api_key + "&code=" + bitskins_token.now() + "&app_id=730")
    except Exception as e:
        print(e)
        error = "Error during bitskins request"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }

    if response.status_code == 200 and response.json()['status'] == "success":
        print("Extracting pricing info")
        items = response.json()['prices']
        for item in items:
            name = item.get('market_hash_name').replace('\xe2\x98\x85', '\u2605').replace("/", '-')
            pricing_mode = item.get('pricing_mode')
            price = item.get('price')
            instant_sale_price = item.get('instant_sale_price')
            skewness = item.get('skewness')

            if name == "M4A1-S | Icarus Fell (Field-Tested)":
                continue
            elif "M4A4 | Emperor" in name:
                name = name.replace("M4A4 | Emperor", 'M4A4 | The Emperor')
            elif name == "Music Kit | Damjan Mravunac, The Talos Principal":
                name = "Music Kit | Damjan Mravunac, The Talos Principle"
            elif name == "Sticker | AdreN (Foil) | MLG Columbus 2016":
                name = "Sticker | AdreN (Foil)  | MLG Columbus 2016"
            elif name == "Sticker | Boom(Foil)":
                name = "Sticker | Boom (Foil)"
            elif name == "Sticker | Boom(Holo)":
                name = "Sticker | Boom (Holo)"
            elif name == "Sticker | Countdown(Foil)":
                name = "Sticker | Countdown (Foil)"
            elif name == "Sticker | Coutdown (Holo)" or name == "Sticker | Coutdown(Holo)":  # check which one has valid pricing info
                name = "Sticker | Countdown (Holo)"
            elif name == "Sticker | Don't Worry(Foil)":
                name = "Sticker | Don't Worry (Foil)"
            elif name == "Sticker | Don't Worry(Holo)":
                name = "Sticker | Don't Worry (Holo)"
            elif name == "Sticker | Hard Cluck Life(Foil)":
                name = "Sticker | Hard Cluck Life (Foil)"
            elif name == "Sticker | Hard Cluck Life(Holo)":
                name = "Sticker | Hard Cluck Life (Holo)"
            elif name == "Sticker | Ivette(Holo)":
                name = "Sticker | Ivette (Holo)"
            elif name == "Sticker | Kimberly(Holo)":
                name = "Sticker | Kimberly (Holo)"
            elif name == "Sticker | MIXWELL | Cologne 2016":
                name = "Sticker | mixwell | Cologne 2016"
            elif name == "Sticker | MIXWELL (Foil) | Cologne 2016":
                name = "Sticker | mixwell (Foil) | Cologne 2016"
            elif name == "Sticker | Martha(Holo)":
                name = "Sticker | Martha (Holo)"
            elif name == "Sticker | Merietta(Holo)":
                name = "Sticker | Merietta (Holo)"
            elif name == "Sticker | Move It(Foil)":
                name = "Sticker | Move It (Foil)"
            elif name == "Sticker | Move It(Holo)":
                name = "Sticker | Move It (Holo)"
            elif name == "Sticker | Rush (Foil) | Cologne 2016":
                name = "Sticker | RUSH (Foil) | Cologne 2016"
            elif name == "Sticker | Rush | Cologne 2016":
                name = "Sticker | RUSH | Cologne 2016"
            elif name == "Sticker | STANISLAW (Foil) | Cologne 2016":
                name = "Sticker | stanislaw (Foil) | Cologne 2016"
            elif name == "Sticker | STANISLAW | Cologne 2016":
                name = "Sticker | stanislaw | Cologne 2016"
            elif name == "Sticker | Sherry(Holo)":
                name = "Sticker | Sherry (Holo)"
            elif name == "Sticker | Snyper (Foil) | Cologne 2015":
                name = "Sticker | SnypeR (Foil) | Cologne 2015"
            elif name == "Sticker | Snyper | Cologne 2015":
                name = "Sticker | SnypeR | Cologne 2015"
            elif name == "Sticker | Tamara(Holo)":
                name = "Sticker | Tamara (Holo)"
            elif name == "Sticker | The Pro(Foil)":
                name = "Sticker | The Pro (Foil)"

            if instant_sale_price == "None":
                instant_sale_price = "null"

            try:
                extract[name]['bitskins'] = {
                    "pricing_mode": pricing_mode,
                    "price": price,
                    "instant_sale_price": instant_sale_price,
                    "skewness": skewness
                }
            except KeyError:
                print(name + " was not previously present, added")
                extract[name] = {
                    "steam": "null",
                    "bitskins": {
                        "pricing_mode": pricing_mode,
                        "price": price,
                        "instant_sale_price": instant_sale_price,
                        "skewness": skewness
                    }
                }
        for item in extract:
            try:
                extract[item]['bitskins'] = extract[item]['bitskins']
            except KeyError:
                extract[item]['bitskins'] = "null"
        print("Pricing info extracted")
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
        print("Extracting pricing information")
        for item in items:
            name = item.get('name')
            price = item.get('price') / 100

            if "M4A4 | Emperor" in name:
                name = name.replace("M4A4 | Emperor", 'M4A4 | The Emperor')

            try:
                extract[name]['lootfarm'] = price
            except KeyError:
                print(name)

        for item in extract:
            try:
                extract[item]['lootfarm'] = extract[item]['lootfarm']
            except KeyError:
                extract[item]['lootfarm'] = "null"
        print("Pricing information extracted")

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
        for item in items:
            name = item.get('market_hash_name')
            price = item.get('price')

            if name == "Sticker | Boom(Foil)":
                name = "Sticker | Boom (Foil)"
            elif name == "Sticker | Don't Worry(Foil)":
                name = "Sticker | Don't Worry (Foil)"
            elif name == "Sticker | Move It(Foil)":
                name = "Sticker | Move It (Foil)"
            elif name == "Ninjas in Pyjamas (Holo) | DreamHack 201":
                name = "Ninjas in Pyjamas (Holo) | DreamHack 2014"

            try:
                extract[name]['csgotm'] = price
            except KeyError:
                print(name)

        for item in extract:
            try:
                extract[item]['csgotm'] = extract[item]['csgotm']
            except KeyError:
                extract[item]['csgotm'] = "null"
        print("Pricing information extracted")

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
        for item in items:
            item = items.get(item)
            name = item.get('m').replace("/", '-')
            price = item.get('a')

            if "M4A4 | Emperor" in name:
                name = name.replace("M4A4 | Emperor", 'M4A4 | The Emperor')
            elif name == "★ StatTrak™ Navaja Knife | Doppler Phase 1 (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Phase 2 (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Phase 3 (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Phase 4 (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Ruby (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Sapphire (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Black Pearl (Minimal Wear)":
                try:
                    extract["★ StatTrak™ Navaja Knife | Doppler (Minimal Wear)"] = extract[
                        "★ StatTrak™ Navaja Knife | Doppler (Minimal Wear)"]
                except:
                    extract["★ StatTrak™ Navaja Knife | Doppler (Minimal Wear)"] = {
                        "steam": "null",
                        "bitskins": "null",
                        "lootfarm": "null",
                        "csgotm": "null",
                        "csmoney": {
                            'price': "null",
                            'doppler': {}
                        }
                    }
            elif name == "★ StatTrak™ Talon Knife | Doppler Phase 1 (Minimal Wear)" or name == "★ StatTrak™ Talon Knife | Doppler Phase 2 (Minimal Wear)" or name == "★ StatTrak™ Talon Knife | Doppler Phase 3 (Minimal Wear)" or name == "★ StatTrak™ Talon Knife | Doppler Phase 4 (Minimal Wear)" or name == "★ StatTrak™ Talon Knife | Doppler Ruby (Minimal Wear)" or name == "★ StatTrak™ Talon Knife | Doppler Sapphire (Minimal Wear)" or name == "★ StatTrak™ Talon Knife | Doppler Black Pearl (Minimal Wear)":
                try:
                    extract["★ StatTrak™ Talon Knife | Doppler (Minimal Wear)"] = extract[
                        "★ StatTrak™ Talon Knife | Doppler (Minimal Wear)"]
                except:
                    extract["★ StatTrak™ Talon Knife | Doppler (Minimal Wear)"] = {
                        "steam": "null",
                        "bitskins": "null",
                        "lootfarm": "null",
                        "csgotm": "null",
                        "csmoney": {
                            'price': "null",
                            'doppler': {}
                        }
                    }
            elif name == "★ StatTrak™ Stiletto Knife | Doppler Phase 1 (Minimal Wear)" or name == "★ StatTrak™ Stiletto Knife | Doppler Phase 2 (Minimal Wear)" or name == "★ StatTrak™ Stiletto Knife | Doppler Phase 3 (Minimal Wear)" or name == "★ StatTrak™ Stiletto Knife | Doppler Phase 4 (Minimal Wear)" or name == "★ StatTrak™ Stiletto Knife | Doppler Ruby (Minimal Wear)" or name == "★ StatTrak™ Stiletto Knife | Doppler Sapphire (Minimal Wear)" or name == "★ StatTrak™ Stiletto Knife | Doppler Black Pearl (Minimal Wear)":
                try:
                    extract["★ StatTrak™ Stiletto Knife | Doppler (Minimal Wear)"] = extract[
                        "★ StatTrak™ Stiletto Knife | Doppler (Minimal Wear)"]
                except:
                    extract["★ StatTrak™ Stiletto Knife | Doppler (Minimal Wear)"] = {
                        "steam": "null",
                        "bitskins": "null",
                        "lootfarm": "null",
                        "csgotm": "null",
                        "csmoney": {
                            'price': "null",
                            'doppler': {}
                        }
                    }
            elif name == "Music Kit | Damjan Mravunac, The Talos Principal" or name == "Music Kit | Damjan Mravunac The Talos Principle":
                name = "Music Kit | Damjan Mravunac, The Talos Principle"
            elif name == "Sticker | Coutdown (Holo)":
                name = "Sticker | Countdown (Holo)"
            elif name == "Sealed Graffiti | GGWP (Battle-Scarred)":
                name = "Sealed Graffiti | GGWP (Battle Green)"
            elif name == "Sealed Graffiti | Karambit (Battle-Scarred)":
                name = "Sealed Graffiti | Karambit (Battle Green)"
            elif name == "Sealed Graffiti | Ninja (Battle-Scarred)":
                name = "Sealed Graffiti | Ninja (Battle Green)"
            elif name == "Music Kit | Austin Wintory Desert Fire":
                name = "Music Kit | Austin Wintory, Desert Fire"
            elif name == "Music Kit | AWOLNATION I Am":
                name = "Music Kit | AWOLNATION, I Am"
            elif name == "Music Kit | Beartooth Disgusting":
                name = "Music Kit | Beartooth, Disgusting"
            elif name == "Music Kit | Daniel Sadowski Crimson Assault":
                name = "Music Kit | Daniel Sadowski, Crimson Assault"
            elif name == "Music Kit | Daniel Sadowski The 8-Bit Kit":
                name = "Music Kit | Daniel Sadowski, The 8-Bit Kit"
            elif name == "Music Kit | Daniel Sadowski Total Domination":
                name = "Music Kit | Daniel Sadowski, Total Domination"
            elif name == "Music Kit | Darude Moments CSGO":
                name = "Music Kit | Darude, Moments CSGO"
            elif name == "Music Kit | Dren Death's Head Demolition":
                name = "Music Kit | Dren, Death's Head Demolition"
            elif name == "Music Kit | Feed Me High Noon":
                name = "Music Kit | Feed Me, High Noon"
            elif name == "Music Kit | Ian Hultquist Lion's Mouth":
                name = "Music Kit | Ian Hultquist, Lion's Mouth"
            elif name == "Music Kit | Kelly Bailey Hazardous Environments":
                name = "Music Kit | Kelly Bailey, Hazardous Environments"
            elif name == "Music Kit | Ki:Theory MOLOTOV":
                name = "Music Kit | Ki:Theory, MOLOTOV"
            elif name == "Music Kit | Lennie Moore Java Havana Funkaloo":
                name = "Music Kit | Lennie Moore, Java Havana Funkaloo"
            elif name == "Music Kit | Mateo Messina For No Mankind":
                name = "Music Kit | Mateo Messina, For No Mankind"
            elif name == "Music Kit | Matt Lange IsoRhythm":
                name = "Music Kit | Matt Lange, IsoRhythm"
            elif name == "Music Kit | Michael Bross Invasion!":
                name = "Music Kit | Michael Bross, Invasion!"
            elif name == "Music Kit | Mord Fustang Diamonds":
                name = "Music Kit | Mord Fustang, Diamonds"
            elif name == "Music Kit | New Beat Fund Sponge Fingerz":
                name = "Music Kit | New Beat Fund, Sponge Fingerz"
            elif name == "Music Kit | Noisia Sharpened":
                name = "Music Kit | Noisia, Sharpened"
            elif name == "Music Kit | Proxy Battlepack":
                name = "Music Kit | Proxy, Battlepack"
            elif name == "Music Kit | Robert Allaire Insurgency":
                name = "Music Kit | Robert Allaire, Insurgency"
            elif name == "Music Kit | Sasha LNOE":
                name = "Music Kit | Sasha, LNOE"
            elif name == "Music Kit | Sean Murray A*D*8":
                name = "Music Kit | Sean Murray, A*D*8"
            elif name == "Music Kit | Skog II-Headshot":
                name = "Music Kit | Skog, II-Headshot"
            elif name == "Music Kit | Skog Metal":
                name = "Music Kit | Skog, Metal"
            elif name == "Music Kit | Troels Folmann Uber Blasto Phone":
                name = "Music Kit | Troels Folmann, Uber Blasto Phone"
            elif name == "Music Kit | Various Artists Hotline Miami":
                name = "Music Kit | Various Artists, Hotline Miami"
            elif name == "StatTrak™ Music Kit | Austin Wintory Desert Fire":
                name = "StatTrak™ Music Kit | Austin Wintory, Desert Fire"
            elif name == "StatTrak™ Music Kit | AWOLNATION I Am":
                name = "StatTrak™ Music Kit | AWOLNATION, I Am"
            elif name == "StatTrak™ Music Kit | Beartooth Disgusting":
                name = "StatTrak™ Music Kit | Beartooth, Disgusting"
            elif name == "StatTrak™ Music Kit | Daniel Sadowski Crimson Assault":
                name = "StatTrak™ Music Kit | Daniel Sadowski, Crimson Assault"
            elif name == "StatTrak™ Music Kit | Daniel Sadowski The 8-Bit Kit":
                name = "StatTrak™ Music Kit | Daniel Sadowski, The 8-Bit Kit"
            elif name == "StatTrak™ Music Kit | Daniel Sadowski Total Domination":
                name = "StatTrak™ Music Kit | Daniel Sadowski, Total Domination"
            elif name == "StatTrak™ Music Kit | Darude Moments CSGO":
                name = "StatTrak™ Music Kit | Darude, Moments CSGO"
            elif name == "StatTrak™ Music Kit | Dren Death's Head Demolition":
                name = "StatTrak™ Music Kit | Dren, Death's Head Demolition"
            elif name == "StatTrak™ Music Kit | Feed Me High Noon":
                name = "StatTrak™ Music Kit | Feed Me, High Noon"
            elif name == "StatTrak™ Music Kit | Ian Hultquist Lion's Mouth":
                name = "StatTrak™ Music Kit | Ian Hultquist, Lion's Mouth"
            elif name == "StatTrak™ Music Kit | Kelly Bailey Hazardous Environments":
                name = "StatTrak™ Music Kit | Kelly Bailey, Hazardous Environments"
            elif name == "StatTrak™ Music Kit | Ki:Theory MOLOTOV":
                name = "StatTrak™ Music Kit | Ki:Theory, MOLOTOV"
            elif name == "StatTrak™ Music Kit | Lennie Moore Java Havana Funkaloo":
                name = "StatTrak™ Music Kit | Lennie Moore, Java Havana Funkaloo"
            elif name == "StatTrak™ Music Kit | Mateo Messina For No Mankind":
                name = "StatTrak™ Music Kit | Mateo Messina, For No Mankind"
            elif name == "StatTrak™ Music Kit | Matt Lange IsoRhythm":
                name = "StatTrak™ Music Kit | Matt Lange, IsoRhythm"
            elif name == "StatTrak™ Music Kit | Michael Bross Invasion!":
                name = "StatTrak™ Music Kit | Michael Bross, Invasion!"
            elif name == "StatTrak™ Music Kit | Mord Fustang Diamonds":
                name = "StatTrak™ Music Kit | Mord Fustang, Diamonds"
            elif name == "StatTrak™ Music Kit | New Beat Fund Sponge Fingerz":
                name = "StatTrak™ Music Kit | New Beat Fund, Sponge Fingerz"
            elif name == "StatTrak™ Music Kit | Noisia Sharpened":
                name = "StatTrak™ Music Kit | Noisia, Sharpened"
            elif name == "StatTrak™ Music Kit | Proxy Battlepack":
                name = "StatTrak™ Music Kit | Proxy, Battlepack"
            elif name == "StatTrak™ Music Kit | Robert Allaire Insurgency":
                name = "StatTrak™ Music Kit | Robert Allaire, Insurgency"
            elif name == "StatTrak™ Music Kit | Sasha LNOE":
                name = "StatTrak™ Music Kit | Sasha, LNOE"
            elif name == "StatTrak™ Music Kit | Sean Murray A*D*8":
                name = "StatTrak™ Music Kit | Sean Murray, A*D*8"
            elif name == "StatTrak™ Music Kit | Skog II-Headshot":
                name = "StatTrak™ Music Kit | Skog, II-Headshot"
            elif name == "StatTrak™ Music Kit | Skog Metal":
                name = "StatTrak™ Music Kit | Skog, Metal"
            elif name == "StatTrak™ Music Kit | Troels Folmann Uber Blasto Phone":
                name = "StatTrak™ Music Kit | Troels Folmann, Uber Blasto Phone"
            elif name == "StatTrak™ Music Kit | Various Artists Hotline Miami":
                name = "StatTrak™ Music Kit | Various Artists, Hotline Miami"

            if "Doppler" in name:
                phase = name.split("Doppler ")[1].split(" (")[0]
                name = name.replace(phase + " ", "")
                try:
                    extract[name]['csmoney']['doppler'][phase] = price
                except KeyError:
                    extract[name]['csmoney'] = {
                        'price': price,
                        'doppler': {
                            phase: price
                        }
                    }
                if phase == "Phase 3":
                    extract[name]['csmoney']['price'] = price
            else:
                try:
                    extract[name]['csmoney'] = {
                        'price': price,
                        'doppler': "null"
                    }
                except KeyError:
                    print(name + " was not previously present, added")
                    extract[name] = {
                        "steam": "null",
                        "bitskins": "null",
                        "lootfarm": "null",
                        "csgotm": "null",
                        "csmoney": {
                            'price': price,
                            'doppler': "null"
                        }
                    }

        for item in extract:
            try:
                extract[item]['csmoney'] = extract[item]['csmoney']
            except KeyError:
                if "Doppler" not in item:
                    print(item)
                    extract[item]['csmoney'] = {
                        "price": "null",
                        "doppler": "null"
                    }
        print("Pricing information extracted")
    else:
        error = "Could not get items from cs.money"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }

    print('Adding own prices that are not present yet')
    for item in own_prices:
        if item not in extract:
            extract[item] = {
                "steam": "null",
                "bitskins": "null",
                "lootfarm": "null",
                "csgotm": "null",
                "csmoney": {
                    'price': "null",
                    'doppler': "null"
                },
                "csgotrader": {
                    "price": own_prices[item],
                    "doppler": "null"
                }
            }

    print("Creates own pricing")
    print("Calculate market trends")

    week_to_day = 0
    month_to_week = 0
    count = 0
    for item in extract:
        if "steam" in extract[item] and "safe_ts" in extract[item]["steam"] and "last_24h" in extract[item]["steam"]["safe_ts"] and "last_7d" in \
                extract[item]["steam"]["safe_ts"] and "last_30d" in extract[item]["steam"]["safe_ts"]:
            daily = float(extract[item]["steam"]["safe_ts"]["last_24h"])
            weekly = float(extract[item]["steam"]["safe_ts"]["last_7d"])
            monthly = float(extract[item]["steam"]["safe_ts"]["last_30d"])
            if (daily != 0 and weekly != 0 and monthly != 0) and (daily != 0.03 and weekly != 0.03 and monthly != 0.03):
                week_to_day += (daily / weekly)
                month_to_week += (weekly / monthly)
                count += 1
    week_to_day = week_to_day / count
    month_to_week = month_to_week / count
    print("Market trends: WtD: " + str(week_to_day) + " MtW: " + str(month_to_week))

    print("Getting price difference ratio between steam:bitskins and steam:csmoney")
    st_bit = 0
    st_csm = 0
    count = 0

    for item in extract:
        if "steam" in extract[item] and "safe_ts" in extract[item]["steam"] and "last_7d" in extract[item]["steam"]["safe_ts"] and "bitskins" in extract[item] and "price" in extract[item]["bitskins"] \
                and "csmoney" in extract[item] and "price" in extract[item]["csmoney"] and extract[item]["csmoney"]["price"] != "" and extract[item]["csmoney"]["price"] != "null":
            st_weekly = float(extract[item]["steam"]["safe_ts"]["last_7d"])
            bit = float(extract[item]["bitskins"]["price"])
            csm = float(extract[item]["csmoney"]["price"])
            if (st_weekly != 0 and bit != 0 and csm != 0) and (st_weekly != 0.03 and bit != 0.03 and csm != 0.03):
                st_bit += (st_weekly / bit)
                st_csm += (st_weekly / csm)
                count += 1
    st_bit = st_bit / count
    st_csm = st_csm / count
    print("Steam:Bitskins: " + str(st_bit) + " Steam:Csmoney:  " + str(st_csm))

    for item in extract:
        steam_aggregate = get_steam_price(item, extract, week_to_day, month_to_week)
        if "csgotrader" not in extract[item]:
            extract[item]["csgotrader"] = {
                "price": "null",
                "doppler": "null"
            }
        if steam_aggregate != "null":
            extract[item]["csgotrader"]["price"] = float("{0:.2f}".format(steam_aggregate))
        elif extract[item]["csmoney"]["price"] != "null" and extract[item]["csmoney"]["price"] != 0:
            extract[item]["csgotrader"]["price"] = float("{0:.2f}".format(float(extract[item]["csmoney"]["price"]) * st_csm * week_to_day))  # case F
        elif "price" in extract[item]["bitskins"] and extract[item]["bitskins"]["price"] != "null":
            extract[item]["csgotrader"]["price"] = float("{0:.2f}".format(float(extract[item]["bitskins"]["price"]) * st_bit * week_to_day))  # case G
        else:
            if "csgotrader" not in extract[item]:
                extract[item]["csgotrader"]["price"] = "null"  # case H


        if "Doppler" in item:
            extract[item]["csgotrader"]["doppler"] = {}
            for phase in extract[item]["csmoney"]["doppler"]:
                extract[item]["csgotrader"]["doppler"][phase] = float("{0:.2f}".format(float(extract[item]["csmoney"]["doppler"][phase]) * st_csm))  # case I
        else:
            extract[item]["csgotrader"]["doppler"] = "null"
    push_to_s3(extract)
    return {
        'statusCode': 200,
        'body': json.dumps('Success!')
    }


def push_to_s3(content):
    print("Getting date for result path")

    today = date.today()
    year = today.strftime("%Y")
    month = today.strftime("%m")
    day = today.strftime("%d")

    s3 = boto3.resource('s3')

    if stage == "prod":
        print("Updating latest/prices_v2.json in s3")
        s3.Object(result_s3_bucket, 'latest/prices_v2.json').put(
            Body=(gzip.compress(bytes(json.dumps(content).encode('UTF-8')), 9)),
            ContentEncoding='gzip'
        )
        print("latest.json updated")
        print(f'Uploading prices to {year}/{month}/{day}/prices_v2.json')
        s3.Object(result_s3_bucket, f'{year}/{month}/{day}/prices_v2.json').put(
            Body=(gzip.compress(bytes(json.dumps(content).encode('UTF-8')), 9)),
            ContentEncoding='gzip'
        )
        print("Upload complete")
    elif stage == "dev":
        print("Updating test/prices.json in s3")
        s3.Object(result_s3_bucket, 'test/prices.json').put(
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


def get_steam_price(item, extract, daily_trend, weekly_trend):
    if "steam" in extract[item] and "safe" in extract[item]["steam"]:
        return extract[item]["steam"]["safe"]
        # if "24_hours" in extract[item]["csgobackpack"] and "sold" in extract[item]["csgobackpack"]["24_hours"] and \
        #         extract[item]["csgobackpack"]["24_hours"]["sold"] != "" and float(
        #     extract[item]["csgobackpack"]["24_hours"]["sold"]) >= 5.0:
        #     if abs(1 - float(extract[item]["csgobackpack"]["24_hours"]["average"]) / float(
        #             extract[item]["csgobackpack"]["7_days"]["average"])) <= 0.1:
        #         return extract[item]["csgobackpack"]["24_hours"]["average"]  # case A
        #     elif abs(1 - float(extract[item]["csgobackpack"]["24_hours"]["median"]) / float(
        #             extract[item]["csgobackpack"]["7_days"]["average"])) <= 0.1:
        #         return extract[item]["csgobackpack"]["24_hours"]["median"]  # case B
        #     else:
        #         return float(extract[item]["csgobackpack"]["7_days"]["average"]) * daily_trend  # case C
        # elif "7_days" in extract[item]["csgobackpack"]:
        #     if float(extract[item]["csgobackpack"]["30_days"]["average"]) != 0.0 and abs(
        #             1 - float(extract[item]["csgobackpack"]["7_days"]["average"]) / float(
        #                 extract[item]["csgobackpack"]["30_days"]["average"])) <= 0.1 and float(
        #         extract[item]["csgobackpack"]["7_days"]["sold"]) >= 5.0:
        #         return float(extract[item]["csgobackpack"]["7_days"]["average"]) * daily_trend  # case D
        #     else:
        #         return float(extract[item]["csgobackpack"]["30_days"]["average"]) * weekly_trend * daily_trend  # case E
        # elif "30_days" in extract[item]["csgobackpack"]:
        #     return float(extract[item]["csgobackpack"]["30_days"]["average"]) * weekly_trend * daily_trend  # case E
        # else:
        #     return "null"
    else:
        return "null"

