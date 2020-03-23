from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView


# For testing React use template base_menu_testing.html and run the react app inside 'frontend' folder
# After testing build the react app, move the js built files inside 'static/js/' and 
#               update the base_menu_html tamplate with new js file names

class HomeView(LoginRequiredMixin, TemplateView):
    template_name = 'game/base_menu.html'
