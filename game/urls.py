from django.urls import path, re_path

from . import views

# these paths let the react client to work even when the user refresh the page

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('quick', views.HomeView.as_view(), name='quick'),
    path('slow', views.HomeView.as_view(), name='slow'),
    path('user', views.HomeView.as_view(), name='user'),
    path('game/<int:id>', views.HomeView.as_view(), name='game'),
]
