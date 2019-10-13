import json


def lambda_handler(event, context):
    print(event)

    if 'user' in event and 'events' in event and 'preferences' in event:
        return {
            'statusCode': 200,
            'body': {'success': 'true'}
        }
    else:
        return {
            'statusCode': 200,
            'body': {'success': 'false'}
        }