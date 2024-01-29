from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('ml_save_data/', views.ml_save_data, name="ml_save_data"),
]

