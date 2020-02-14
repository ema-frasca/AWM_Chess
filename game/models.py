from django.db import models
from django.conf import settings
from django.utils.timezone import now
from datetime import timedelta

# Create your models here.


class RankUser(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    # starting rank at 1200, treshold of novices
    rank = models.IntegerField(default=1200)


class Match(models.Model):
    black = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="is_black", 
        blank=True, null=True
    )
    white = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="is_white", 
        blank=True, null=True
    )
    quick = models.BooleanField()
    chosen_time = models.DurationField()
    pgn = models.CharField(max_length=2000, blank=True)

class Lobby(Match):
    random_color = models.BooleanField(default=False)

class EndedMatch(Match):
    result = models.CharField(max_length=3)

# SlowMatch
class InMatch(Match):
    white_turn = models.BooleanField(default=True)
    last_move = models.DateTimeField(default=now)

class QuickMatch(InMatch):
    # counters initialized at 0 seconds
    white_time = models.DurationField(default=timedelta())
    black_time = models.DurationField(default=timedelta())