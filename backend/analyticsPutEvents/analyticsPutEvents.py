import json
import boto3
from botocore.exceptions import ClientError
import os
import decimal


def lambda_handler(event, context):
    if 'events' in event and 'preferences' in event and 'clientID' in event and 'userAgent' in event and 'browserLanguage' in event:
        dynamodb = boto3.resource('dynamodb', region_name='eu-west-2')
        events_table = dynamodb.Table(os.environ['EVENTS_TABLE'])
        pageviews_table = dynamodb.Table(os.environ['PAGVEVIEWS_TABLE'])

        events = event['events']['events']
        pageviews = event['events']['pageviews']

        go_through_events('events', events, events_table, pageviews_table)
        go_through_events('pageviews', pageviews, events_table, pageviews_table)

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


def update_db(date, type, upd_exp, exp_attr_nam, exp_attr_val, events_table, pageviews_table):
    table = events_table if type == 'events' else pageviews_table
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
    print(json.dumps(response, indent=4, cls=DecimalEncoder))


def go_through_events(type, events, events_table, pageviews_table):
    if events:  # if not empty
        for date in events:
            print(date)
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
                update_db(date, type, update_expression, exp_attr_nam, exp_attr_val, events_table, pageviews_table)