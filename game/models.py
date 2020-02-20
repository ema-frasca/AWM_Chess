from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta

rank_dict = [
    (1200, "Novice"),
    (1400, "Class D"),
    (1600, "Class C"),
    (1800, "Class B"),
    (2000, "Class A"),
    (2200, "Expert"),
    (2300, "Candidate Master"),
    (2400, "Master"),
    (2500, "International Master"),
    (5000, "Grand Master"),
]

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,)
    # starting rank at 1200, treshold of novices
    rank = models.IntegerField(default=1200)

    def category(self):
        for limit, cat in rank_dict:
            if self.rank <= limit:
                return cat
        return "Unclassified"

@receiver(post_save, sender=User)
def update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()


class Match(models.Model):
    black = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="is_black", 
        blank=True, null=True
    )
    white = models.ForeignKey(
        User, 
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

# to convert: https://stackoverflow.com/questions/21063078/convert-a-subclass-model-instance-to-another-subclass-model-instance-in-django 