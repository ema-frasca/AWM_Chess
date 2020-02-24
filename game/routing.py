from django.urls import path
from .consumers import MainConsumer

websocket_urlpatterns = [
    path('ws', MainConsumer),
]
