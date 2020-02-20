from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView

# Create your views here.


class HomeView(LoginRequiredMixin, TemplateView):
    template_name = 'game/base_menu.html'
