from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta

# https://docs.djangoproject.com/en/3.0/topics/db/models/


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

match_times = {
    "slow": [12, 18, 24],
    "quick": [15, 30, 45, 60],
}

def get_deltatime(quick, time_value):
    if (quick and time_value in match_times["quick"]):
        return timedelta(minutes=time_value)
    elif (not quick and time_value in match_times["slow"]):
        return timedelta(hours=time_value)
    return None

colors = ["random", "white", "black"]

def get_options(quick):
    options = {"colors": colors}
    options["times"] = (match_times["quick"] if quick else match_times["slow"])
    options["unit"] = ("minutes" if quick else "hours")
    return options

match_caps = {"slow": 3, "quick": 1}

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,)
    # starting rank at 1200, treshold of novices
    rank = models.IntegerField(default=1200)

    def category(self):
        for limit, cat in rank_dict:
            if self.rank <= limit:
                return cat
        return "Unclassified"
    
    def get_notifications(self):
        return 2
    
    def left_matches(self, quick):
        n = Match.user_matches(self.user).exclude(endedmatch__isnull=False).filter(quick=quick).count()
        left = match_caps[("quick" if quick else "slow")] - n
        return left

@receiver(post_save, sender=User)
def update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()


class Match(models.Model):
    white = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="is_white", 
        blank=True, null=True
    )
    black = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="is_black", 
        blank=True, null=True
    )
    quick = models.BooleanField()
    chosen_time = models.DurationField()
    pgn = models.CharField(max_length=2000, blank=True)

    def transfer(self, new):
        self.delete(keep_parents=True)
        new.__dict__.update(new.match_ptr.__dict__)
        new.save()
        return new

    def has_user(self, user):
        if user == self.white or user == self.black:
            return True
        return False

    def versus(self, user=None):
        if not user:
            return (self.white if self.white else self.black)
        if user == self.white:
            return self.black
        if user == self.black:
            return self.white
        return None

    @classmethod
    def user_matches(cls, user, player=True):
        if player:
            return cls.objects.filter(models.Q(white=user) | models.Q(black=user))
        else:
            return cls.objects.exclude(models.Q(white=user) | models.Q(black=user))
        
    @classmethod
    def get_or_none(cls, id):
        match = None
        try:
            match = cls.objects.get(pk=id)
        except cls.DoesNotExist:
            pass

        return match

class Lobby(Match):
    random_color = models.BooleanField(default=False)

    def join_match(self, user):
        # Check if user can join
        if self.has_user(user) or user.profile.left_matches(user, self.quick) == 0 :
            return None

        # Join the user
        if self.random_color:
            from random import randint
            if randint(0, 1):
                self.black = self.white
        if self.white:
            self.black = user
        else:
            self.white = user
        self.save()

        return self.start()

    def start(self):
        new = InMatch(match_ptr=self.match_ptr)
        new = self.transfer(new)
        if self.quick:
            new = QuickMatch(inmatch_ptr=new)
            new.__dict__.update(new.inmatch_ptr.__dict__)
            new.save()
        return new
    
    def to_dict(self):
        lobby_dict = {
            "id" : self.pk,
            "random" : self.random_color,
            "quick" : self.quick,
            "time" : int(self.chosen_time.total_seconds() / 60),
        }
        if self.white:
            lobby_dict["white"] = self.white.username
            lobby_dict["category"] = self.white.profile.category()
        else:
            lobby_dict["black"] = self.black.username
            lobby_dict["category"] = self.black.profile.category()

        return lobby_dict
    
    def initialize(self, user, quick, color, time):
        self.quick = quick
        td = get_deltatime(quick, time)
        if not td or color not in colors: 
            return None
        self.chosen_time = td

        if color == "random":
            self.random_color = True
        if color == "black": 
            self.black = user 
        else: 
            self.white = user
        
        self.save()
        return self

class EndedMatch(Match):
    result = models.CharField(max_length=3, default="*")

# SlowMatch
class InMatch(Match):
    white_turn = models.BooleanField(default=True)
    last_move = models.DateTimeField(default=now)

    def end(self):
        new = EndedMatch(match_ptr=self.match_ptr)
        return self.transfer(new)

    def user_has_turn(self, user):
        if self.white_turn:
            return user == self.white
        else:
            return user == self.black

class QuickMatch(InMatch):
    # counters initialized at 0 seconds
    white_time = models.DurationField(default=timedelta())
    black_time = models.DurationField(default=timedelta())

    def transfer(self, new):
        self.inmatch_ptr.delete(keep_parents=True)
        return super().transfer(new)
    
