from django.db import models

class MultiRoomInfo(models.Model):

        RoomName = models.CharField()
        QuantityPlayer = models.PositiveSmallIntegerField()
        Created_time = models.DateTimeField(auto_now_add=True)

        class Meta:
                db_table = 'room_info'

# Create your models here.

# class MultiGame2player(models.Model):

# 	player1 = models.CharField()
# 	player2 = models.CharField()

# class MultiGame3player(models.Model):

# 	player1 = models.CharField()
# 	player2 = models.CharField()
# 	player3 = models.CharField()

# class MultiGame4player(models.Model):

# 	player1 = models.CharField()
# 	player2 = models.CharField()
# 	player3 = models.CharField()
# 	player4 = models.CharField()

# class MultiGame5player(models.Model):

# 	player1 = models.CharField()
# 	player2 = models.CharField()
# 	player3 = models.CharField()
# 	player4 = models.CharField()
# 	player5 = models.CharField()

# class MultiGame6player(models.Model):

# 	player1 = models.CharField()
# 	player2 = models.CharField()
# 	player3 = models.CharField()
# 	player4 = models.CharField()
# 	player5 = models.CharField()
# 	player6 = models.CharField()