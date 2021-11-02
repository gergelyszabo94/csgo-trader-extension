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
fixerio_api_key = os.environ['FIXERIO_API_KEY']
coinlayer_api_key = os.environ['COINLAYER_API_KEY']

symbols = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'AUD', 'HKD', 'ISK', 'PHP', 'DKK', 'HUF', 'CZK', 'RON', 'SEK',
           'IDR', 'INR', 'BRL', 'RUB', 'HRK', 'THB', 'CHF', 'MYR', 'BGN', 'TRY', 'NOK', 'NZD', 'ZAR', 'MXN', 'SGD',
           'ILS', 'KRW', 'PLN', 'AED', 'ARS', 'CLP', 'COP', 'CRC', 'KWD', 'KZT', 'PEN', 'QAR', 'SAR', 'TWD', 'UAH',
           'UYU', 'VND', 'GEL']


def lambda_handler(event, context):
    print("Requesting exchange rates from fixer.io")
    try:
        # http is not a mistake, https is not supported in the free plan
        response = requests.get("http://data.fixer.io/api/latest?access_key=" + fixerio_api_key + "&symbols=" + ','.join(str(e) for e in symbols))
    except Exception as e:
            print(e)
            error = "Error during request"
            alert_via_sns(f'{error}: {e}')
            return {
                'statusCode': 500,
                'body': error
            }
    print("Response from fixer.io")
    try:
        response_json = response.json()
    except Exception as e:
        print(e)
        error = "Error parsing json from the request response"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }

    if response_json.get("success"):
        rates = response_json['rates']
    else:
        error = response_json.get("error")
        print(error)
        alert_via_sns(error)
        return {
            'statusCode': 500,
            'body': error
        }

    # only EUR is supported as a base currency in the fixer.io free tier so everything has to be converted to USD
    usd_rate = rates.get("USD")
    for rate in rates:
        rates[rate] = rates.get(rate) / usd_rate

    rates["KEY"] = 0.4  # 1/2.5

    print("Requesting cryptocurrency exchange rates from coincap.io")
    try:
        response = requests.get("http://api.coinlayer.com/api/live?access_key=" + coinlayer_api_key)
    except Exception as e:
        print(e)
        error = "Error during request"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }
    print("Response from coinlayer.com")
    try:
        cryptos = response.json()['rates']
    except Exception as e:
        print(e)
        error = "Error parsing crypto rates from the request response"
        alert_via_sns(f'{error}: {e}')
        return {
            'statusCode': 500,
            'body': error
        }
    rates['BTC'] = '{:.20f}'.format(1/float(cryptos['BTC']))
    rates['ETH'] = '{:.20f}'.format(1/float(cryptos['ETH']))

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