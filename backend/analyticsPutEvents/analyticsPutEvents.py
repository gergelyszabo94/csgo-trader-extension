import json
import boto3
from botocore.exceptions import ClientError
import os
import decimal
from datetime import date


def lambda_handler(event, context):
    body = event['body-json']
    staging_variables = event['stage-variables']
    stage = staging_variables['DEPLOYMENT_STAGE']

    if 'events' in body and 'preferences' in body and 'clientID' in body and 'browserLanguage' in body:
        dynamodb = boto3.resource('dynamodb', region_name='eu-west-2')
        tables = {
            'events': dynamodb.Table(staging_variables['EVENTS_TABLE']),
            'pageviews': dynamodb.Table(staging_variables['PAGEVIEWS_TABLE']),
            'preferences': dynamodb.Table(staging_variables['PREFERENCES_TABLE'])
        }

        print('Updating the events table')
        go_through_events('events', body['events']['events'], tables)
        print('Events table updated')

        print('Updating the pageviews table')
        go_through_events('pageviews', body['events']['pageviews'], tables)
        print('Pageviews table updated')

        today = date.today()
        year = today.strftime("%Y")
        month = today.strftime("%m")
        day = today.strftime("%d")
        lambda_date_iso = f'{year}-{month}-{day}'
        print('Updating preferences table')

        version = '<=1.19.2'
        try:
            version = body['client_version']
        except:
            print('No version info from client')

        os = 'unknown'
        try:
            os = body['os']
        except:
            print('No OS info from client')


        tables['preferences'].put_item(
            Item={
                'date': lambda_date_iso,
                'clientID': body['clientID'],
                'extension_version': version,
                'country': event['params']['header']['CloudFront-Viewer-Country'],
                'browser': 'chrome' if 'chrome-extension' in event['params']['header']['origin'] else 'firefox',
                'browser_language': body['browserLanguage'],
                'preferences': body['preferences'],
                'os': os
            }
        )

        print('Preferences table updated')

        return {
            'statusCode': 200,
            'body': {'success': 'true'}
        }
    else:
        return {
            'statusCode': 200,
            'body': {'success': 'false'}
        }


# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


def update_db(date, type, upd_exp, exp_attr_nam, exp_attr_val, tables):
    table = tables[type]
    try:
        response = table.update_item(
            Key={'date': date},
            UpdateExpression=upd_exp,
            ExpressionAttributeNames=exp_attr_nam,
            ExpressionAttributeValues=exp_attr_val,
            ReturnValues="UPDATED_NEW"
        )
    except ClientError as e:
        if e.response['Error']['Code'] == 'ValidationException':
            print(e.response)
        else:
            raise


def go_through_events(type, events, tables):
    if events:  # if not empty
        for date in events:
            update_expression = 'SET '
            exp_attr_val = {
                ':start': 0,
            }
            exp_attr_nam = {}
            i = 0

            if events[date]:  # if not empty
                for event in events[date]:
                    i += 1
                    update_expression += f'#AttrName{i} = if_not_exists(#AttrName{i}, :start) + :{event}_inc, '
                    exp_attr_nam[f'#AttrName{i}'] = event
                    exp_attr_val[f':{event}_inc'] = decimal.Decimal(events[date][event])
                update_expression = update_expression[:-2]  # removes the last 2 chars ", "
                update_db(date, type, update_expression, exp_attr_nam, exp_attr_val, tables)