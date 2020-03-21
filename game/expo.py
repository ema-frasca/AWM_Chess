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
    post(url, headers=headers, data=json.dumps(data))
