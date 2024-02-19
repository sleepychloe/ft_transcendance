from django.db import models

class MultiRoomInfo(models.Model):

        Roomid = models.CharField()
        RoomName = models.CharField()
        QuantityPlayer = models.PositiveSmallIntegerField()
        CreatedTime = models.DateTimeField(auto_now_add=True)
        client1 = models.CharField()
        client2 = models.CharField()
        client3 = models.CharField()
        client4 = models.CharField()

        class Meta:
                db_table = 'Room_info'

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