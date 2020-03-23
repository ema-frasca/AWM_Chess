"""AWM_Chess URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from . import views

# django auth: https://docs.djangoproject.com/en/3.0/topics/auth/default/
# it manage login, lost password

urlpatterns = [
    path('account/', include('django.contrib.auth.urls')),
    path('account/create', views.UserCreateView.as_view(), name='signup'),
    path('account/create/done', views.UserCreateDoneView.as_view(), name='signup_done'),
    path('oauth/', include('social_django.urls', namespace='social')),
    path('', include('game.urls')),
]
