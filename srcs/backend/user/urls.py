from django.urls import path
from .views import *

urlpatterns = [
	path('avatar/', UserAvatarGetView.as_view()),
	path('intraid/', UserIntraIdGetView.as_view()),
]