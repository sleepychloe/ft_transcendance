from django.urls import path
from . import views

app_name = 'game'

urlpatterns = [
    path('', views.index, name='index'),
    path('local_pvp/', views.local_pvp, name='local_pvp'),
    path('local_pvp/ml_save_data/', views.ml_save_data, name="ml_save_data"),
]
