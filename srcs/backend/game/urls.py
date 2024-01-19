from django.urls import path
from .views import index

urlpatterns = [
    path('', index, name='index'),
    # Additional URL patterns for your game's backend logic
]