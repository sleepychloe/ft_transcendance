from django.db import models

class MultiRoomInfo(models.Model):

        id = models.BigAutoField(primary_key=True)
        Roomid = models.CharField()
        RoomName = models.CharField()
        GameStatus = models.BooleanField(default=False)
        QuantityPlayer = models.PositiveSmallIntegerField()
        CreatedTime = models.DateTimeField(auto_now_add=True)
        QuantityPlayerReady = models.PositiveSmallIntegerField()
        client1 = models.JSONField(null=True)
        client2 = models.JSONField(null=True)
        client3 = models.JSONField(null=True)
        client4 = models.JSONField(null=True)

        paddle1 = models.JSONField(null=True)
        paddle2 = models.JSONField(null=True)
        paddle3 = models.JSONField(null=True)
        paddle4 = models.JSONField(null=True)

        class Meta:
                db_table = 'room_info'
