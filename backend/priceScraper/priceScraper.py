import json
import requests
import boto3
import pyotp
import os
from datetime import date

bitskins_secret = os.environ['BITSKINS_SECRET']
bitskins_token = pyotp.TOTP(bitskins_secret)
bitskins_api_key = os.environ['BITSKINS_API_KEY']
result_s3_bucket = os.environ['RESULTS_BUCKET']
sns_topic = os.environ['SNS_TOPIC_ARN']
stage = os.environ['STAGE']


def lambda_handler(event, context):

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
            name = items.get(key).get('name').replace("&#39", "'")
            price = items.get(key).get('price')

            if price:
                extract[name] = {
                    "csgobackpack": price
                }
            else:
                extract[name] = {
                    "csgobackpack": "null"
                }

        print("Pricing information extracted")
        push_to_s3(extract, "false")

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
            name = item.get('market_hash_name').replace('\xe2\x98\x85', '\u2605').replace("/", '-')
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
                print(name)
        for item in extract:
            try:
                extract[item]['bitskins'] = extract[item]['bitskins']
            except KeyError:
                extract[item]['bitskins'] = "null"
        print("Pricing info extracted")
        push_to_s3(extract, "false")
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
        push_to_s3(extract, "false")

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
        push_to_s3(extract, "false")

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

            missingFromCsgobackpack = [
                "Souvenir AWP | Pit Viper (Battle-Scarred)",
                "Souvenir Five-SeveN | Silver Quartz (Well-Worn)",
                "Souvenir P2000 | Granite Marbleized (Factory New)",
                "★ StatTrak™ Bayonet | Crimson Web (Factory New)",
                "★ StatTrak™ Bowie Knife | Forest DDPAT (Factory New)",
                "★ StatTrak™ Karambit | Forest DDPAT (Factory New)",
                "★ StatTrak™ Karambit | Urban Masked (Factory New)",
                "★ StatTrak™ M9 Bayonet | Boreal Forest (Factory New)",
                "★ StatTrak™ M9 Bayonet | Urban Masked (Factory New)",
                "★ StatTrak™ Ursus Knife | Scorched (Factory New)",
                "★ StatTrak™ Ursus Knife | Forest DDPAT (Factory New)",
                "★ Ursus Knife | Urban Masked (Factory New)",
                "★ StatTrak™ Ursus Knife | Urban Masked (Factory New)",
                "★ StatTrak™ Ursus Knife | Crimson Web (Battle-Scarred)",
                "★ StatTrak™ Ursus Knife | Crimson Web (Factory New)",
                "★ Ursus Knife | Crimson Web (Factory New)",
                "★ StatTrak™ Ursus Knife | Boreal Forest (Factory New)",
                "★ StatTrak™ Stiletto Knife | Case Hardened (Factory New)",
                "★ Navaja Knife | Safari Mesh (Factory New)",
                "★ StatTrak™ Stiletto Knife | Fade (Minimal Wear)",
                "★ Talon Knife | Boreal Forest (Factory New)",
                "★ Ursus Knife | Ultraviolet (Factory New)",
                "★ Ursus Knife | Damascus Steel (Battle-Scarred)",
                "★ StatTrak™ Ursus Knife | Ultraviolet (Battle-Scarred)",
                "★ StatTrak™ Talon Knife | Ultraviolet (Factory New)",
                "★ StatTrak™ Talon Knife | Damascus Steel (Well-Worn)",
                "★ StatTrak™ Talon Knife | Damascus Steel (Battle-Scarred)",
                "★ StatTrak™ Navaja Knife | Marble Fade (Minimal Wear)",
                "★ StatTrak™ Ursus Knife | Damascus Steel (Battle-Scarred)",
                "★ StatTrak™ Ursus Knife | Rust Coat (Well-Worn)",
                "★ StatTrak™ Navaja Knife | Urban Masked (Factory New)",
                "★ StatTrak™ Stiletto Knife | Tiger Tooth (Minimal Wear)",
                "★ StatTrak™ Ursus Knife | Tiger Tooth (Minimal Wear)",
                "★ Talon Knife | Urban Masked (Factory New)",
                "★ StatTrak™ Ursus Knife | Marble Fade (Minimal Wear)",
                "★ StatTrak™ Talon Knife | Tiger Tooth (Minimal Wear)",
                "★ Talon Knife | Ultraviolet (Factory New)"
            ]

            if "M4A4 | Emperor" in name:
                name = name.replace("M4A4 | Emperor", 'M4A4 | The Emperor')
            elif name in missingFromCsgobackpack:
                extract[name] = {
                    "csgobackpack": "null",
                    "bitskins": "null",
                    "lootfarm": "null",
                    "csgotm": "null",
                    # "csmoney": {
                    #     'price': "null",
                    #     'doppler': "null"
                    # }
                }
            elif name == "★ StatTrak™ Navaja Knife | Doppler Phase 1 (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Phase 2 (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Phase 3 (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Phase 4 (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Ruby (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Sapphire (Minimal Wear)" or name == "★ StatTrak™ Navaja Knife | Doppler Black Pearl (Minimal Wear)":
                try:
                    extract["★ StatTrak™ Navaja Knife | Doppler (Minimal Wear)"] = extract[
                        "★ StatTrak™ Navaja Knife | Doppler (Minimal Wear)"]
                except:
                    extract["★ StatTrak™ Navaja Knife | Doppler (Minimal Wear)"] = {
                        "csgobackpack": "null",
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
                        "csgobackpack": "null",
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
                        "csgobackpack": "null",
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
                    print(name)

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
        push_to_s3(extract, "false")
    else:
        error = "Could not get items from cs.money"
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
    for item in extract:
        if "csgobackpack" in extract[item] and "24_hours" in extract[item]["csgobackpack"] and "7_days" in \
                extract[item]["csgobackpack"] and "30_days" in extract[item]["csgobackpack"]:
            daily = float(extract[item]["csgobackpack"]["24_hours"]["average"])
            weekly = float(extract[item]["csgobackpack"]["7_days"]["average"])
            monthly = float(extract[item]["csgobackpack"]["30_days"]["average"])
            if (daily != 0 and weekly != 0 and monthly != 0) and (daily != 0.03 and weekly != 0.03 and monthly != 0.03):
                week_to_day += (daily / weekly)
                month_to_week += (weekly / monthly)
                count += 1
    week_to_day = week_to_day / count
    month_to_week = month_to_week / count
    print("Market trends: WtD: " + str(week_to_day) + " MtW: " + str(month_to_week))

    print("Getting price difference ratio between csgopbackback:bitskins and csgobackpack:csmoney")
    csb_bit = 0
    csb_csm = 0
    count = 0

    for item in extract:
        if "csgobackpack" in extract[item] and "7_days" in extract[item]["csgobackpack"] and "bitskins" in extract[item] and "price" in extract[item]["bitskins"] and "csmoney" in extract[item] and "price" in extract[item]["csmoney"]:
            csb_weekly = float(extract[item]["csgobackpack"]["7_days"]["average"])
            bit = float(extract[item]["bitskins"]["price"])
            csm = float(extract[item]["csmoney"]["price"])
            if (csb_weekly != 0 and bit != 0 and csm != 0) and (csb_weekly != 0.03 and bit != 0.03 and csm != 0.03):
                csb_bit += (csb_weekly / bit)
                csb_csm += (csb_weekly / csm)
                count += 1
    csb_bit = csb_bit / count
    csb_csm = csb_csm / count
    print("Backpack:Bitskins: " + str(csb_bit) + " Backpack:Csmoney:  " + str(csb_csm))

    for item in extract:
        csgobackpack_aggregate = get_csgobackpack_price(item, extract, week_to_day, month_to_week)
        extract[item]["csgotrader"] = {
            "price": "null",
            "doppler": "null"
        }
        if csgobackpack_aggregate != "null":
            extract[item]["csgotrader"]["price"] = float("{0:.2f}".format(csgobackpack_aggregate))
        elif extract[item]["csmoney"]["price"] != "null" and extract[item]["csmoney"]["price"] != 0:
            extract[item]["csgotrader"]["price"] = float("{0:.2f}".format(float(extract[item]["csmoney"]["price"]) * csb_csm * week_to_day))  # case F
        elif "price" in extract[item]["bitskins"] and extract[item]["bitskins"]["price"] != "null":
            extract[item]["csgotrader"]["price"] = float("{0:.2f}".format(float(extract[item]["bitskins"]["price"]) * csb_bit * week_to_day))  # case G
        else:
            extract[item]["csgotrader"]["price"] = "null"  # case H

        if "Doppler" in item:
            extract[item]["csgotrader"]["doppler"] = {}
            for phase in extract[item]["csmoney"]["doppler"]:
                extract[item]["csgotrader"]["doppler"][phase] = float("{0:.2f}".format(float(extract[item]["csmoney"]["doppler"][phase]) * csb_csm))  # case I
        else:
            extract[item]["csgotrader"]["doppler"] = "null"
    push_to_s3(extract, "true")
    return {
        'statusCode': 200,
        'body': json.dumps('Success!')
    }


def push_to_s3(content, latest):
    print("Getting date for result path")

    today = date.today()
    year = today.strftime("%Y")
    month = today.strftime("%m")
    day = today.strftime("%d")

    s3 = boto3.resource('s3')

    if stage == "prod":
        if latest == "true":
            print("Updating latest/prices_v2.json in s3")
            s3.Object(result_s3_bucket, 'latest/prices_v2.json').put(
                Body=(bytes(json.dumps(content).encode('UTF-8')))
            )
            print("latest.json updated")
        print(f'Uploading prices to {year}/{month}/{day}/prices_v2.json')
        s3.Object(result_s3_bucket, f'{year}/{month}/{day}/prices_v2.json').put(
            Body=(bytes(json.dumps(content).encode('UTF-8')))
        )
        print("Upload complete")
    elif stage == "dev":
        print("Updating test/prices.json in s3")
        s3.Object(result_s3_bucket, 'test/prices.json').put(
            Body=(bytes(json.dumps(content, indent=2).encode('UTF-8')))
        )


def alert_via_sns(error):
    print("Publishing error to SNS")

    sns = boto3.client('sns')

    response = sns.publish(
        TopicArn=sns_topic,
        Message=f'The script could not finish scrapping all prices, error: {error}',
    )

    print(response)


def get_csgobackpack_price(item, extract, daily_trend, weekly_trend):
    if "csgobackpack" in extract[item]:
        if "24_hours" in extract[item]["csgobackpack"] and "sold" in extract[item]["csgobackpack"]["24_hours"] and \
                extract[item]["csgobackpack"]["24_hours"]["sold"] != "" and float(
                extract[item]["csgobackpack"]["24_hours"]["sold"]) >= 5.0:
            if abs(1 - float(extract[item]["csgobackpack"]["24_hours"]["average"]) / float(
                    extract[item]["csgobackpack"]["7_days"]["average"])) <= 0.1:
                return extract[item]["csgobackpack"]["24_hours"]["average"]  # case A
            elif abs(1 - float(extract[item]["csgobackpack"]["24_hours"]["median"]) / float(
                    extract[item]["csgobackpack"]["7_days"]["average"])) <= 0.1:
                return extract[item]["csgobackpack"]["24_hours"]["median"]  # case B
            else:
                return float(extract[item]["csgobackpack"]["7_days"]["average"]) * daily_trend  # case C
        elif "7_days" in extract[item]["csgobackpack"]:
            if float(extract[item]["csgobackpack"]["30_days"]["average"]) != 0.0 and abs(
                    1 - float(extract[item]["csgobackpack"]["7_days"]["average"]) / float(
                            extract[item]["csgobackpack"]["30_days"]["average"])) <= 0.1 and float(
                    extract[item]["csgobackpack"]["7_days"]["sold"]) >= 5.0:
                return float(extract[item]["csgobackpack"]["7_days"]["average"]) * daily_trend  # case D
            else:
                return float(extract[item]["csgobackpack"]["30_days"]["average"]) * weekly_trend * daily_trend  # case E
        elif "30_days" in extract[item]["csgobackpack"]:
            return float(extract[item]["csgobackpack"]["30_days"]["average"]) * weekly_trend * daily_trend  # case E
        else:
            return "null"
    else:
        return "null"

