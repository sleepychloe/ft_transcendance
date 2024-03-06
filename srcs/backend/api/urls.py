from django.urls import path, include
from .views import *
app_name = 'api'

urlpatterns = [
    # path('user/', include('user.urls')),
    path('game/', include('game.urls')),
    # path('login/', include('login.urls'))
]

