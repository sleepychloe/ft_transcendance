from django.urls import path, include

app_name = 'api'

urlpatterns = [
    path('game/', include('game.urls')),
]

