import json
import requests
import boto3
import os
import time
from datetime import date

result_s3_bucket = os.environ['RESULTS_BUCKET']
sns_topic = os.environ['SNS_TOPIC_ARN']
cloudfront_dist_id = os.environ['CLOUDFRONT_DIST_ID']
stage = os.environ['STAGE']


def lambda_handler(event, context):
    print("Requesting exchange rates from exchangeratesapi.io")
    try:
        response = requests.get("https://api.exchangeratesapi.io/latest?base=USD")
    except Exception as e:
            print(e)
            error = "Error during request"
            alert_via_sns(f'{error}: {e}')
            return {
                'statusCode': 500,
                'body': error
            }
    print("Response from exchangeratesapi.io")
    try:
        rates = response.json()['rates']
    except Exception as e:
        print(e)
        error = "Error parsing rates from the request response"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }
    rates["KEY"] = 0.4  # 1/2.5

    print("Requesting cryptocurrency exchange rates from coincap.io")
    try:
        response = requests.get("https://api.coincap.io/v2/assets?ids=bitcoin,ethereum")
    except Exception as e:
        print(e)
        error = "Error during request"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }
    print("Response from coincap.io")
    try:
        cryptos = response.json()['data']
    except Exception as e:
        print(e)
        error = "Error parsing crypto rates from the request response"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }
    for crypto in cryptos:
        symbol = crypto.get('symbol')
        exchange_rate = crypto.get('priceUsd')
        rates[symbol] = '{:.20f}'.format(1/float(exchange_rate))

    btc_price = float(rates.get('BTC'))
    micro_btc_price = btc_price*1000000
    rates["MBC"] = micro_btc_price
    eth_price = float(rates.get('ETH'))
    finney_eth = eth_price*1000
    rates["FET"] = finney_eth
    push_to_s3(rates)
    cloudfront_invalidate()
    return {
        'statusCode': 200,
        'body': "Success"
    }


def push_to_s3(content):
    print("Getting date for result path")

    today = date.today()
    year = today.strftime("%Y")
    month = today.strftime("%m")
    day = today.strftime("%d")

    s3 = boto3.resource('s3')

    if stage == "prod":
        print("Updating latest/exchange_rates.json in s3")
        s3.Object(result_s3_bucket, 'latest/exchange_rates.json').put(
            Body=(bytes(json.dumps(content).encode('UTF-8')))
        )
        print("exchange_rates.json updated")
        print(f'Uploading prices to {year}/{month}/{day}/exchange_rates.json')
        s3.Object(result_s3_bucket, f'{year}/{month}/{day}/exchange_rates.json').put(
            Body=(bytes(json.dumps(content).encode('UTF-8')))
        )
        print("Upload complete")
    elif stage == "dev":
        print("Updating test/exchange_rates.json in s3")
        s3.Object(result_s3_bucket, 'test/exchange_rates.json').put(
            Body=(bytes(json.dumps(content, indent=2).encode('UTF-8')))
        )
        print("exchange_rates.json updated")


def alert_via_sns(error):
    print("Publishing error to SNS")

    sns = boto3.client('sns')

    response = sns.publish(
        TopicArn=sns_topic,
        Message=f'Failed to update exchange rates, error: {error}',
    )


def cloudfront_invalidate():
    cloudfront = boto3.client('cloudfront')
    if stage == "prod":
        print("Invalidating the latest prices and exchange rates")
        response = cloudfront.create_invalidation(
            DistributionId=cloudfront_dist_id,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': [
                        '/latest/*',
                    ]
                },
                'CallerReference': str(time.time())
            }
        )
    else:
        print("Invalidating the test prices and exchange rates")
        response = cloudfront.create_invalidation(
            DistributionId=cloudfront_dist_id,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': [
                        '/test/*',
                    ]
                },
                'CallerReference': str(time.time())
            }
        )
    print(response)