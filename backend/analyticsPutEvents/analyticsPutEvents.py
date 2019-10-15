import json
import boto3
import os
from datetime import date

result_s3_bucket = os.environ['RESULTS_BUCKET']


def lambda_handler(event, context):
    if 'user' in event and 'events' in event and 'preferences' in event and 'clientID' in event:
        push_to_s3(event)
        return {
            'statusCode': 200,
            'body': {'success': 'true'}
        }
    else:
        return {
            'statusCode': 200,
            'body': {'success': 'false'}
        }


def push_to_s3(content):
    user = content.get('user') if content.get('user') != '' else 'no_user'
    clientid = content.get('clientID')

    today = date.today()
    year = today.strftime("%Y")
    month = today.strftime("%m")
    day = today.strftime("%d")

    s3 = boto3.resource('s3')

    print(f'Uploading extension/{user}/{clientid}/{year}/{month}/{day}/events.json')
    s3.Object(result_s3_bucket, f'extension/{user}/{clientid}/{year}/{month}/{day}/events.json').put(
        Body=(bytes(json.dumps(content.get('events')).encode('UTF-8')))
    )

    clientinfo = {
        'user': user,
        'userAgent': content.get('userAgent'),
        'browserLanguage': content.get('browserLanguage'),
        'clientID': clientid,
        'preferences': content.get('preferences')
    }

    print(f'Uploading extension/{user}/{clientid}{year}/{month}/{day}/clientInfo.json')
    s3.Object(result_s3_bucket, f'extension/{user}/{clientid}/{year}/{month}/{day}/clientInfo.json').put(
        Body=(bytes(json.dumps(clientinfo).encode('UTF-8')))
    )