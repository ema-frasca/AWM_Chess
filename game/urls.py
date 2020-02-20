from django.urls import path

from . import views

urlpatterns = [
    # Form-based interface: server-side only
    #path('', views.room_form, name="room_form"),
    #path('<int:room_id>/', views.node_form, name="node_form"),
    #path('<int:room_id>/<int:node_id>/<slug:capability>', views.capability_form, name="capability_form"),
    path('home/', views.HomeView.as_view(), name='home'),
]
