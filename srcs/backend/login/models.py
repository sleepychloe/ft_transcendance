from django.db import models

class User42Info(models.Model):
	Username = models.CharField(primary_key=True)
	Userid = models.CharField()
	avatar = models.ImageField()

	class Meta:
		db_table = 'user_42_info'