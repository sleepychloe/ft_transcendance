from django.db import models

# Create your models here.
class User42Info(models.Model):
	Username = models.CharField(primary_key=True)
	Userid = models.CharField()
	Useravatar = models.CharField()

	class Meta:
		db_table = 'user_42_info'