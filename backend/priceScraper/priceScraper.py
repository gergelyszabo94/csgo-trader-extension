import json
import requests
import boto3
from datetime import date


def lambda_handler(event, context):
    s3 = boto3.resource('s3')
    print("Requesting prices from csgobackpack.net")
    response = requests.get("http://csgobackpack.net/api/GetItemsList/v2/")
    print("Received response from csgobackpack.net")
    responseJSON = response.json()

    if response.status_code == 200 and responseJSON['success']:
        print("Valid response from csgobackpack.net")
        items = responseJSON['items_list']
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
        print("Updating latest.json in s3")
        s3.Object('prices.csgotrader.app', 'latest.json').put(
            Body=(bytes(json.dumps(extract, indent=2).encode('UTF-8')))
        )
        print("latest.json updated")

        print("Getting date")
        today = date.today()
        year = today.strftime("%Y")
        month = today.strftime("%m")
        day = today.strftime("%d")
        print(f'Uploading prices to {year}/{month}/{day}/prices.json')
        s3.Object('prices.csgotrader.app', f'{year}/{month}/{day}/prices.json').put(
            Body=(bytes(json.dumps(extract, indent=2).encode('UTF-8')))
        )
        print("Upload complete")

        return{
            'statusCode': 200,
            'body': json.dumps('Success!')
        }

    else:
        print("Request failed with status code: ", response.status_code)
        return {
            'statusCode': response.status_code,
            'body': json.dumps("Request to csgobackpack.net failed!")
        }