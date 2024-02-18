from django.urls import path, include
from .views import *
app_name = 'api'

urlpatterns = [
    path('game/', include('game.urls')),
]

