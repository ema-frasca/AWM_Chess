''' 
    This file manage the api to use Expo push notification
    It is a simple HTTPS POST request with these fields:
        - title : title of the notification, next to the name of the application (we don't use it)
        - body  : text of the notification
        - data  : json data to be delivered to the application if the notification is selected
'''

from requests import post, exceptions
import json


url = 'https://exp.host/--/api/v2/push/send'

headers= {
    'host' : 'exp.host',
    'accept': 'application/json',
    'accept-encoding': 'gzip, deflate',
    'content-type': 'application/json',
}

def send_push_notification(to, body, data, title=''):
    data = {
        'to': to,
        'title': title,
        'body': body,
        'data': data,
    }
    try:
        post(url, headers=headers, data=json.dumps(data))
    except exceptions.RequestException as err:
        print(err)
    