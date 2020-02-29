from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync
from game.models import Match, Lobby


class MainConsumer(JsonWebsocketConsumer):

    def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            return
        self.accept()
        async_to_sync(self.channel_layer.group_add)(str(self.user.id), self.channel_name)
        self.requests = [
            {"type": "account-page", "f": self.account_page},
            {"type": "account-edit", "f": self.account_edit},
            {"type": "account-psw", "f": self.account_psw_change},
            {"type": "matches-left", "f": self.matches_number_left},
            {"type": "matches-lobbies", "f": self.get_lobbies},
            {"type": "matches-mylobby", "f": self.get_my_lobby},
            {"type": "matches-create", "f": self.create_lobby},
            {"type": "matches-delete", "f": self.delete_lobby},
        ]

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(str(self.user.id), self.channel_name)

    def receive_json(self, content):        
        for r in self.requests:
            if content["type"] == r["type"]:
                r["f"](content)

    def account_page(self, msg=None):
        content = {
            "type": "account-page",
            "username": self.user.username,
            "email": self.user.email,
            "rank": self.user.profile.rank,
            "category": self.user.profile.category(),
            "google": not self.user.has_usable_password(),
        }
        self.send_json(content)
        
    def account_edit(self, msg):
        from django.contrib.auth.models import User
        content = {"type": msg["type"], "field": msg["field"]}
        if msg["value"] == "":
            self.send_json(content)
            return
        if msg["field"] == "email":
            from django.core.validators import validate_email, ValidationError
            try:
                validate_email(msg["value"])
            except ValidationError as val_err:
                content["error"] = str(val_err.message)
            else:
                if msg["value"] != self.user.email:
                    if User.objects.filter(email=msg["value"]).count():
                        content["error"] = "Email already used"
                    else:
                        self.user.email = msg["value"]
                        self.user.save()
                        self.account_page()
            
        elif msg["field"] == "username":
            if msg["value"] != self.user.username:
                if User.objects.filter(username=msg["value"]).count():
                    content["error"] = "Username already used"
                else:
                    self.user.username = msg["value"]
                    self.user.save()
                    self.account_page()

        self.send_json(content)

    def account_psw_change(self, msg):
        from django.contrib.auth.password_validation import validate_password, ValidationError
        content = {"type": msg["type"]}
        if not self.user.check_password(msg["old"]):
            content["error"] = "Your old password was entered incorrectly"
        elif msg["new1"] != msg["new2"]:
            content["error"] = "The two password fields didn’t match"
        else:
            try:
                validate_password(msg["new1"], self.user)
            except ValidationError as val_err:
                content["error"] = str(val_err.messages[0])
            else:
                self.user.set_password(msg["new1"])
                self.user.save()
            
        self.send_json(content)

    def matches_number_left(self, msg):
        content = msg
        content["type"] = "matches-left"
        content["number"] = self.user.profile.left_matches(msg["quick"])
        
        self.send_json(content)
    
    def get_lobbies(self, msg):
        content = msg
        lobbies = Lobby.user_matches(self.user, False).filter(quick=msg["quick"]).order_by('?')[:5]
        content["lobbies"] = [lobby.to_dict() for lobby in lobbies]
        
        self.send_json(content)

    def get_my_lobby(self, msg):
        content = msg
        content["type"] = "matches-mylobby"
        lobby = Lobby.user_matches(self.user).filter(quick=msg["quick"]).first()
        if lobby:
            content["lobby"] = lobby.to_dict()
            content["options"] = False
        else:
            from game.models import get_options
            content["lobby"] = False
            content["options"] = get_options(msg["quick"])
        
        self.send_json(content)
        self.matches_number_left(msg)

    def create_lobby(self, msg):
        lobby = Lobby()
        lobby.initialize(self.user, msg["quick"], msg["color"], msg["time"])

        self.get_my_lobby(msg)

    def delete_lobby(self, msg):
        lobby = Lobby.get_or_none(msg["id"])
        if not lobby: 
            return None
        if lobby.has_user(self.user):
            lobby.delete()

        self.get_my_lobby(msg)

    def start_game(self, msg):
        lobby = Lobby.get_or_none(msg["id"])
        if not lobby:
            return None
        vs_user = lobby.versus()
        match = lobby.join_match(self.user)
        # messaggio ad altro utente per aggiornare mylobby
        return match
