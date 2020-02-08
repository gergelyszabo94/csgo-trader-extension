import json
import os
import boto3
from datetime import datetime

bucket = os.environ['BUCKET']
region = os.environ['REGION']
object_key = os.environ['PRICES_OBJECT_KEY']
prod = os.environ['PROD']


s3 = boto3.client('s3', region_name=region)
lbd = boto3.client('lambda', region_name=region)


def lambda_handler(event, context):
    result = s3.head_object(Bucket=bucket, Key=object_key)
    last_modified = result['ResponseMetadata']['HTTPHeaders']['last-modified']
    last_modified = datetime.strptime(last_modified, '%a, %d %b %Y %H:%M:%S %Z')
    days_since_last_update = (datetime.now() - last_modified).days

    if days_since_last_update >= 1:  # if updated over a day ago
        print('Prices have not been updated for over a day, calling priceScrapper')
        response = lbd.invoke(
            FunctionName='priceScraper:' + prod,
            InvocationType='Event',
            Payload=json.dumps({}).encode('utf-8')
        )
    else:
        print('No need to retry, let\'s see in an hour...')