import json
import requests

response = requests.get("http://csgobackpack.net/api/GetItemsList/v2/")
responseJSON = response.json()

if response.status_code == 200 and responseJSON['success']:
    items = responseJSON['items_list']
    extract = {}
    for key, value in items.items():
        name = items.get(key).get('name')
        price = items.get(key).get('price')

        if price:
            extract[name] = {}
            extract[name]['csgobackpack'] = price
        else:
            extract[name] = {}
            extract[name]['csgobackpack'] = "null"

    print(extract)
else:
    print("Request failed with status code: ", response.status_code)


def lambda_handler(event, context):

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }