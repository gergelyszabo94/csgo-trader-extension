import json
import requests
import boto3
import pyotp
import os
from datetime import date


def lambda_handler(event, context):
    bitskins_secret = os.environ['BITSKINS_SECRET']
    bitskins_token = pyotp.TOTP(bitskins_secret)
    bitskins_api_key = os.environ['BITSKINS_API_KEY']

    print("Requesting prices from csgobackpack.net")
    try:
        response = requests.get("http://csgobackpack.net/api/GetItemsList/v2/")
    except Exception as e:
            print(e)
            error = "Error during csgobaackpack request"
            alert_via_sns(f'{error}: {e}')
            return {
                'statusCode': 500,
                'body': error
            }

    print("Received response from csgobackpack.net")

    if response.status_code == 200 and response.json()['success']:
        print("Valid response from csgobackpack.net")
        items = response.json()['items_list']
        extract = {}
        print("Extracting pricing information")
        for key, value in items.items():
            name = items.get(key).get('name')
            price = items.get(key).get('price')

            if price:
                extract[name] = {}
                extract[name]['csgobackpack'] = price
            else:
                extract[name] = {}
                extract[name]['csgobackpack'] = "null"

        print("Pricing information extracted")
        push_to_s3(extract)

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
            name = item.get('market_hash_name').replace('\xe2\x98\x85', '\u2605').replace("'", '&#39').replace("/", '-')
            pricing_mode = item.get('pricing_mode')
            price = item.get('price')
            instant_sale_price = item.get('instant_sale_price')
            skewness = item.get('skewness')
            missingFromCsgobackpack = [
                "P250 | Nevermore (Well-Worn)",
                "Sticker | Astralis (Holo) | London 2018",
                "Sticker | Astralis | London 2018",
                "Sticker | Avangar (Holo) | Boston 2018",
                "Sticker | Avangar | Boston 2018",
                "Sticker | BIG (Foil) | London 2018",
                "Sticker | BIG (Holo) | London 2018",
                "Sticker | BIG | London 2018",
                "Sticker | Blue Swallow",
                "Sticker | Cheongsam",
                "Sticker | Cheongsam (Holo)",
                "Sticker | Cloud9 (Holo) | Boston 2018",
                "Sticker | Cloud9 | Boston 2018",
                "Sticker | FaZe Clan (Holo) | Boston 2018",
                "Sticker | FaZe Clan | Boston 2018",
                "Sticker | Fancy Koi",
                "Sticker | Fancy Koi (Foil)",
                "Sticker | Flash Gaming | Boston 2018",
                "Sticker | Flipsid3 Tactics | Boston 2018",
                "Sticker | G2 Esports (Foil) | Boston 2018",
                "Sticker | G2 Esports | Boston 2018",
                "Sticker | Gambit Esports (Holo) | London 2018",
                "Sticker | Gambit Esports | London 2018",
                "Sticker | God of Fortune",
                "Sticker | Green Swallow",
                "Sticker | Guardian Dragon",
                "Sticker | Guardian Dragon (Foil)",
                "Sticker | HellRaisers (Holo) | London 2018",
                "Sticker | HellRaisers | London 2018",
                "Sticker | Hotpot",
                "Sticker | Huaji",
                "Sticker | JW | Katowice 2019",
                "Sticker | Longevity",
                "Sticker | Longevity (Foil)",
                "Sticker | Mahjong Fa",
                "Sticker | Mahjong Rooster",
                "Sticker | Mahjong Zhong",
                "Sticker | Misfits Gaming (Foil) | Boston 2018",
                "Sticker | Misfits Gaming | Boston 2018",
                "Sticker | Natus Vincere | Boston 2018",
                "Sticker | Natus Vincere (Holo) | Boston 2018",
                "Sticker | Nezha",
                "Sticker | Ninjas in Pyjamas (Foil) | London 2018",
                "Sticker | Ninjas in Pyjamas (Holo) | London 2018",
                "Sticker | Ninjas in Pyjamas | London 2018",
                "Sticker | Ninjas in Pyjamas | Katowice 2015",
                "Sticker | Non-Veg",
                "Sticker | Noodles",
                "Sticker | North (Foil) | London 2018",
                "Sticker | North (Holo) | London 2018",
                "Sticker | North | London 2018",
                "Sticker | OpTic Gaming (Foil) | London 2018",
                "Sticker | OpTic Gaming (Holo) | London 2018",
                "Sticker | OpTic Gaming | London 2018",
                "Sticker | PENTA Sports | Katowice 2015",
                "Sticker | Phoenix",
                "Sticker | Pixiu",
                "Sticker | Pixiu (Foil)",
                "Sticker | Quantum Bellator Fire | Boston 2018",
                "Sticker | Rage",
                "Sticker | Renegades (Foil) | Boston 2018",
                "Sticker | Renegades | Boston 2018",
                "Sticker | Renegades (Holo) | London 2018",
                "Sticker | Renegades | London 2018",
                "Sticker | Rice Bomb",
                "Sticker | Rogue (Foil) | London 2018",
                "Sticker | Rogue (Holo) | London 2018",
                "Sticker | Rogue | London 2018",
                "Sticker | Shaolin",
                "Sticker | Space Soldiers (Foil) | Boston 2018",
                "Sticker | Space Soldiers | Boston 2018",
                "Sticker | Space Soldiers (Foil) | London 2018",
                "Sticker | Space Soldiers (Holo) | London 2018",
                "Sticker | Space Soldiers | London 2018",
                "Sticker | Sprout Esports | Boston 2018",
                "Sticker | Team EnVyUs (Holo) | Boston 2018",
                "Sticker | Team EnVyUs | Boston 2018",
                "Sticker | Team Liquid (Foil) | London 2018",
                "Sticker | Team Liquid (Holo) | London 2018",
                "Sticker | Team Liquid | Boston 2018",
                "Sticker | Team Liquid | London 2018",
                "Sticker | Team Spirit (Holo) | London 2018",
                "Sticker | Team Spirit | London 2018",
                "Sticker | Terror Rice",
                "Sticker | Toy Tiger",
                "Sticker | Twin Koi",
                "Sticker | Twin Koi (Holo)",
                "Sticker | Tyloo (Foil) | London 2018",
                "Sticker | Tyloo (Holo) | London 2018",
                "Sticker | Tyloo | London 2018",
                "Sticker | Vega Squadron (Holo) | London 2018",
                "Sticker | Vega Squadron | Boston 2018",
                "Sticker | Vega Squadron | London 2018",
                "Sticker | Virtus.Pro (Holo) | London 2018",
                "Sticker | Virtus.Pro | London 2018",
                "Sticker | Vox Eminor | Katowice 2015",
                "Sticker | Water Gun",
                "Sticker | Zombie Hop",
                "Sticker | compLexity Gaming (Foil) | London 2018",
                "Sticker | compLexity Gaming (Holo) | London 2018",
                "Sticker | compLexity Gaming | London 2018",
                "Sticker | device | Katowice 2019",
                "Sticker | mousesports | Boston 2018",
                "Sticker | niko (Foil) | London 2018",
                "Sticker | niko | London 2018",
                "★ Navaja Knife | Boreal Forest (Factory New)",
                "★ Navaja Knife | Damascus Steel (Battle-Scarred)",
                "★ Navaja Knife | Forest DDPAT (Factory New)",
                "★ Navaja Knife | Night Stripe (Factory New)",
                "★ Navaja Knife | Rust Coat (Well-Worn)",
                "★ Navaja Knife | Scorched (Factory New)",
                "★ StatTrak™ Bayonet | Forest DDPAT (Factory New)",
                "★ StatTrak™ Bayonet | Night (Factory New)",
                "★ StatTrak™ Bayonet | Scorched (Factory New)",
                "★ StatTrak™ Huntsman Knife | Boreal Forest (Factory New)",
                "★ StatTrak™ Karambit | Scorched (Factory New)",
                "★ StatTrak™ Navaja Knife | Boreal Forest (Well-Worn)",
                "★ StatTrak™ Navaja Knife | Night Stripe (Battle-Scarred)",
                "★ StatTrak™ Navaja Knife | Night Stripe (Well-Worn)",
                "★ StatTrak™ Navaja Knife | Rust Coat (Well-Worn)",
                "★ StatTrak™ Navaja Knife | Scorched (Well-Worn)",
                "★ StatTrak™ Navaja Knife | Tiger Tooth (Minimal Wear)",
                "★ StatTrak™ Navaja Knife | Ultraviolet (Battle-Scarred)",
                "★ StatTrak™ Shadow Daggers | Scorched (Factory New)",
                "★ StatTrak™ Stiletto Knife | Damascus Steel (Well-Worn)",
                "★ StatTrak™ Stiletto Knife | Forest DDPAT (Battle-Scarred)",
                "★ StatTrak™ Stiletto Knife | Forest DDPAT (Well-Worn)",
                "★ StatTrak™ Stiletto Knife | Rust Coat (Battle-Scarred)",
                "★ StatTrak™ Stiletto Knife | Rust Coat (Well-Worn)",
                "★ StatTrak™ Stiletto Knife | Stained (Factory New)",
                "★ StatTrak™ Stiletto Knife | Ultraviolet (Minimal Wear)",
                "★ StatTrak™ Stiletto Knife | Ultraviolet (Well-Worn)",
                "★ StatTrak™ Talon Knife | Damascus Steel (Minimal Wear)",
                "★ StatTrak™ Talon Knife | Fade (Minimal Wear)",
                "★ StatTrak™ Talon Knife | Ultraviolet (Well-Worn)",
                "★ StatTrak™ Talon Knife | Urban Masked (Well-Worn)",
                "★ StatTrak™ Ursus Knife | Blue Steel (Minimal Wear)",
                "★ StatTrak™ Ursus Knife | Damascus Steel (Minimal Wear)",
                "★ StatTrak™ Ursus Knife | Forest DDPAT (Well-Worn)",
                "★ StatTrak™ Ursus Knife | Ultraviolet (Field-Tested)",
                "★ Stiletto Knife | Forest DDPAT (Factory New)",
                "★ Stiletto Knife | Night Stripe (Factory New)",
                "★ Stiletto Knife | Night Stripe (Field-Tested)",
                "★ Talon Knife | Damascus Steel (Well-Worn)",
                "★ Talon Knife | Rust Coat (Well-Worn)",
                "★ Ursus Knife | Boreal Forest (Factory New)",
                "★ Ursus Knife | Forest DDPAT (Factory New)"
            ]

            if name == "M4A1-S | Icarus Fell (Field-Tested)":
                continue
            elif "M4A4 | Emperor" in name:
                name = name.replace("M4A4 | Emperor", 'M4A4 | The Emperor')
            elif name == "Music Kit | Damjan Mravunac, The Talos Principal":
                name = "Music Kit | Damjan Mravunac, The Talos Principle"
            elif name in missingFromCsgobackpack:
                extract[name] = {
                    "csgobackpack": "null"
                }
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
            elif name == "Sticker | Don&#39t Worry(Foil)":
                name = "Sticker | Don&#39t Worry (Foil)"
            elif name == "Sticker | Don&#39t Worry(Holo)":
                name = "Sticker | Don&#39t Worry (Holo)"
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
                print(name)
        for item in extract:
            try:
                extract[item]['bitskins'] = extract[item]['bitskins']
            except KeyError:
                extract[item] = {
                    "csgobackpack": extract[item]['csgobackpack'],
                    "bitskins": "null"
                }
        print("Pricing info extracted")
        push_to_s3(extract)
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
            name = item.get('name').replace("'", '&#39')
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
                extract[item] = {
                    "csgobackpack": extract[item]['csgobackpack'],
                    "bitskins": extract[item]['bitskins'],
                    "lootfarm": "null"
                }
        print("Pricing information extracted")
        push_to_s3(extract)
        return {
            'statusCode': 200,
            'body': json.dumps('Success!')
        }

    else:
        error = "Could not get items from loot.farm"
        alert_via_sns(error)
        print(error, " status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps(error)
        }

def push_to_s3(content):
    print("Getting date for result path")

    today = date.today()
    year = today.strftime("%Y")
    month = today.strftime("%m")
    day = today.strftime("%d")

    s3 = boto3.resource('s3')

    print("Updating latest.json in s3")
    s3.Object('prices.csgotrader.app', 'latest.json').put(
        Body=(bytes(json.dumps(content, indent=2).encode('UTF-8')))
    )
    print("latest.json updated")
    print(f'Uploading prices to {year}/{month}/{day}/prices.json')
    s3.Object(os.environ['RESULTS_BUCKET'], f'{year}/{month}/{day}/prices.json').put(
        Body=(bytes(json.dumps(content, indent=2).encode('UTF-8')))
    )
    print("Upload complete")

def alert_via_sns(error):
    print("Publishing error to SNS")

    sns = boto3.client('sns')

    response = sns.publish(
        TopicArn=os.environ['SNS_TOPIC_ARN'],
        Message=f'The script could not finish scrapping all prices, error: {error}',
    )

    print(response)


