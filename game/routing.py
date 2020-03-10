from django.urls import path
from .consumers import MainConsumer, MobileConsumer

websocket_urlpatterns = [
    path('ws', MainConsumer),
    path('mobile-ws', MobileConsumer),
]
