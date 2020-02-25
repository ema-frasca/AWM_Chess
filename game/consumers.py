from channels.generic.websocket import JsonWebsocketConsumer


class MainConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive_json(self, content):
        reply = {"text": "Server reply"}
        self.send_json(reply)