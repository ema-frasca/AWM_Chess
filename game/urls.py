from django.urls import path, re_path

from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('quick', views.HomeView.as_view(), name='quick'),
    path('slow', views.HomeView.as_view(), name='slow'),
    path('user', views.HomeView.as_view(), name='user'),
]
