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
    print("Invalidating the latest prices and exchange rates")
    cloudfront = boto3.client('cloudfront')
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
    print(response)