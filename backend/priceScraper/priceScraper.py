import json
import requests
import boto3


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
        print("Putting result to s3")
        s3.Object('prices.csgotrader.app', 'latest.json').put(
            Body=(bytes(json.dumps(extract, indent=2).encode('UTF-8')))
        )
        print("Results on s3")
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