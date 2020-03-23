from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync
from game.models import Match, Lobby, InMatch, EndedMatch, QuickMatch
import chess, chess.pgn
from django.utils.timezone import now
import jwt


# Main consumer, used for web client
class MainConsumer(JsonWebsocketConsumer):

    def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            return
        self.accept()
        self.initialize()

    def initialize(self):
        async_to_sync(self.channel_layer.group_add)(str(self.user.id), self.channel_name)
        self.requests = [
            {"type": "notifications", "f": self.get_notifications},
            {"type": "home-page", "f": self.home_page},
            {"type": "account-page", "f": self.account_page},
            {"type": "account-edit", "f": self.account_edit},
            {"type": "account-psw", "f": self.account_psw_change},
            {"type": "matches-left", "f": self.matches_number_left},
            {"type": "matches-lobbies", "f": self.get_lobbies},
            {"type": "matches-mylobby", "f": self.get_my_lobby},
            {"type": "matches-create", "f": self.create_lobby},
            {"type": "matches-delete", "f": self.delete_lobby},
            {"type": "game-page", "f": self.game_page},
            {"type": "game-move", "f": self.game_move},     
            {"type": "game-resign", "f": self.game_resign},      
            {"type": "game-claim", "f": self.game_claim},  
            {"type": "times-check", "f": self.times_check},               
        ]
        self.games = {}
        self.load_games()
        self.times_check()
        self.notify({"type": "notify"})

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(str(self.user.id), self.channel_name)

    def receive_json(self, content):        
        for r in self.requests:
            if content["type"] == r["type"]:
                r["f"](content)
        
    # recreate the chess.Board() of the ongoing games
    def load_games(self):
        from io import StringIO
        matches = InMatch.user_matches(self.user)
        for match in matches:
            self.games[match.pk] = chess.pgn.read_game(StringIO(match.pgn), Visitor= chess.pgn.BoardBuilder)

    def message_opponent(self, match, msg):
        opponent = match.versus(self.user)
        msg["sender"] = self.channel_name   
        async_to_sync(self.channel_layer.group_send)(str(opponent.id), msg)

    # push notification to mobile
    def expo_notify(self, match, msg_type):
        opponent = match.versus(self.user)
        opponent.profile.expo_notify(msg_type, match.pk)

    # used to update all my connected clients when I do something
    def message_myself(self, msg):
        msg["sender"] = self.channel_name   
        async_to_sync(self.channel_layer.group_send)(str(self.user.id), msg)

    def get_notifications(self, msg):
        matches = [match.pk for match in InMatch.user_turn_matches(self.user)]
        content = {
            "type" : "notifications",
            "number" : len(matches),
            "games-id" : matches,
        }
        self.send_json(content)

    def notify(self, msg):
        self.send_json(msg)

    def match_notify(self, match, msg_type):
        msg = {"type": "notify", "id": match.pk}
        self.message_myself(msg)
        self.message_opponent(match, msg)
        self.expo_notify(match, msg_type)

    def home_page(self, msg=None):
        if not self.times_check():
            return
        content = {
            "type" : "home-page",
            "list" : [match.to_home_dict(self.user) for match in InMatch.user_matches(self.user)],
            "username" : self.user.username,
            "history" : [match.to_home_dict(self.user) for match in EndedMatch.user_matches(self.user).order_by("-end_date")[:5]],
        }
        self.send_json(content)

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
        quick = QuickMatch.user_matches(self.user).first()
        content["redirect"] = (quick.pk if quick else None)
        
        self.send_json(content)
    
    # return 5 random lobbies
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
    
    def create_board(self, msg):
        if msg["sender"] != self.channel_name:
            self.games[msg["id"]] = chess.Board()

    def start_game(self, msg):
        lobby = Lobby.get_or_none(msg["id"])
        if not lobby:
            return None
        match = lobby.join_match(self.user)
        if match:
            self.message_opponent(match, {"type": "get.my.lobby", "quick": match.quick})
            msg = {"type": "create.board", "id": match.pk}
            self.message_myself(msg)
            self.games[msg["id"]] = chess.Board()
            self.message_opponent(match, msg)
            self.match_notify(match, 'start')
        
        return match

    def game_page(self, msg):
        content = msg
        content["type"] = "game-page"
        match = InMatch.get_or_none(msg["id"])
        if not match:
            match = EndedMatch.get_or_none(msg["id"])
            if not match:
                match = self.start_game(msg)
                if not match:
                    content["error"] = "The selected game doesn't exist anymore"
                    self.send_json(content)
                return
        elif match.quick:
            match = QuickMatch.objects.get(pk=match.pk)

        if not match.has_user(self.user):
            return
            
        content["match"] = match.to_dict()

        if isinstance(match, EndedMatch):
            content["board"] = match.last_fen
            content["result"] = match.user_result(self.user)
        else:
            if not self.times_check({"match": match}):
                return
            content["board"] = self.games[match.pk].board_fen()
            if match.user_has_turn(self.user):
                # example: moves = {'e2': {'e4':[], 'e5': []} 'f7': {'f8': ['q', 'r']}} 
                moves = {move.uci()[:2]: {} for move in self.games[match.pk].legal_moves}
                for move in self.games[match.pk].legal_moves:
                    if move.uci()[2:4] not in moves[move.uci()[:2]]:
                        moves[move.uci()[:2]][move.uci()[2:4]] = []
                    if len(move.uci()) > 4:
                        moves[move.uci()[:2]][move.uci()[2:4]].append(move.uci()[4])
                content["moves"] =  moves
                content["claim"] = self.games[match.pk].can_claim_draw()
            else:
                content["moves"] = []
                content["claim"] = False

        self.send_json(content)

    def board_push(self, msg):
        if msg["sender"] != self.channel_name:
            self.games[msg["id"]].push_uci(msg["move"])

    def board_delete(self, msg):
        self.games.pop(msg["id"])

    def times_check(self, msg={}):
        matches = ([msg["match"]] if "match" in msg else InMatch.user_matches(self.user))
        flag = True
        for match in matches:
            times = match.get_times()
            if times["white"] <= 0 or times["black"] <= 0:
                self.game_end(match, time=True)
                flag = False
        return flag
        
    # check if a move is valid in a given match
    def game_check(self, id, move):
        match = InMatch.get_or_none(id)
        # check match exists
        if not match:
            return None
        if match.quick:
            match = match.quickmatch
        # check match time is not exceeded limits
        if not self.times_check({"match": match}):
            return None
        # if resign check the user is inside the match
        if move == "resign":
            return (match if match.has_user(self.user) else None)
        # otherwise check if user is in his turn
        if not match.user_has_turn(self.user):
            return None
        # if draw claim check if user can do it 
        if move == "claim":
            return (match if self.games[match.pk].can_claim_draw() else None)

        # check if move is valid
        return (match if move in [move.uci() for move in self.games[match.pk].legal_moves] else None)

    def game_move(self, msg):
        match = self.game_check(msg["id"], msg["move"])
        if not match:
            return

        # update Board
        msg["type"] = "board.push"
        self.message_opponent(match, msg)
        self.message_myself(msg)
        self.games[msg["id"]].push_uci(msg["move"])
        
        # update db model
        if match.quick:
            if match.white_turn:
                match.white_time += now() - match.last_move
            else:
                match.black_time += now() - match.last_move
        match.white_turn = not match.white_turn
        match.last_move = now()
        match.pgn = chess.pgn.Game.from_board(self.games[match.pk]).accept(chess.pgn.StringExporter(headers=False, variations=False, comments=False))
        match.save()

        if self.games[match.pk].is_game_over():
            self.game_end(match)
            return

        self.match_notify(match, 'move')
    
    def game_resign(self, msg):
        match = self.game_check(msg["id"], "resign")
        if not match:
            return
        match.pgn += " resign"
        match.save()

        self.game_end(match, resign=True)


    def game_claim(self, msg):
        match = self.game_check(msg["id"], "claim")
        if not match:
            return
        match.pgn += " draw claim"
        match.save()
        
        self.game_end(match, claim=True)

    def game_end(self, match, time=False, resign=False, claim=False):
        reason = ""
        result = "Draw"
        if time:
            reason = "time limit reached"
            result = ("Black" if match.white_turn else "White")
        elif resign:
            reason = "resign"
            result = ("Black" if self.user == match.white else "White")
        elif claim:
            if self.games[match.pk].can_claim_fifty_moves():
                reason = "fifty moves claim"
            elif self.games[match.pk].can_claim_threefold_repetition():
                reason = "threefold repetition claim"
        else:
            if self.games[match.pk].is_checkmate():
                reason = "checkmate"
                result = ("Black" if match.white_turn else "White")
            elif self.games[match.pk].is_stalemate():
                reason = "stalemate"
            elif self.games[match.pk].is_insufficient_material():
                reason = "insufficient pieces to checkmate"
            elif self.games[match.pk].is_seventyfive_moves():
                reason = "seventyfive moves"
            elif self.games[match.pk].is_fivefold_repetition():
                reason = "fivefold repetition"
            
        match = match.end()
        match.last_fen = self.games[match.pk].board_fen()
        match.end_reason = reason
        match.result = result
        match.save()
        
        msg = {"type": "board.delete", "id": match.pk}
        self.message_myself(msg)
        self.message_opponent(match, msg)

        # update ranks
        distance = match.white.profile.rank - match.black.profile.rank
        if result == "White":
            match.white.profile.update_rank(-distance, win=1)
            match.black.profile.update_rank(distance, loss=1)
        elif result == "Black":
            match.black.profile.update_rank(distance, win=1)
            match.white.profile.update_rank(-distance, loss=1)
        else:
            match.black.profile.update_rank(distance)
            match.white.profile.update_rank(-distance)

        self.match_notify(match, 'end')

# mobile consumer, inherits everything from MainConsumer
class MobileConsumer(MainConsumer):
    def connect(self):
        self.accept()
        self.user_requests = [
            {"type": "login-token", "f": self.login_token},
            {"type": "login-auth", "f": self.login_auth},
            {"type": "login-social", "f": self.login_social},
            {"type": "login-signup", "f": self.login_signup},
        ]
        self.user = None

    def receive_json(self, content):
        if self.user:
            return super().receive_json(content)
        else:
            for r in self.user_requests:
                if content["type"] == r["type"]:
                    r["f"](content)
        

    def disconnect(self, close_code):
        if self.user:
            super().disconnect(close_code)

    # login through jwt token
    def login_token(self, msg):
        from django.conf.global_settings import SECRET_KEY
        from django.contrib.auth.models import User
        # str encode to binary:
        token = msg["token"].encode()
        user_obj = jwt.decode(token, SECRET_KEY)
        try:
            user = User.objects.get(pk=user_obj["pk"])
        except User.DoesNotExist:
            self.send_json({"type": "login-token", "error": "Invalid token"})
            return
        self.login_user(user)

    def generate_token(self, user):
        from django.conf.global_settings import SECRET_KEY
        token = jwt.encode({"pk": user.pk}, SECRET_KEY)
        # str decote from binary:
        self.send_json({"type": "login-token", "token": token.decode()})

    def login_auth(self, msg):
        from django.contrib.auth import authenticate
        user = authenticate(username=msg["username"], password=msg["password"])
        if not user:
            self.send_json({"type": "login-auth", "error": "Incorrect user and password"})
            return
        self.login_user(user)

    def login_social(self, msg):
        from social_core.backends.google import GoogleOAuth2
        backend = GoogleOAuth2()
        # do_auth can also sign up the user in the system
        user = backend.do_auth(access_token=msg['token'])
        self.login_user(user)

    def login_user(self, user):
        self.user = user
        self.initialize()
        # add new possible request
        self.requests.append({"type": "logout", "f": self.logout})
        self.requests.append({"type": "login-token", "f": self.login_token})
        self.requests.append({"type": "expo-token", "f": self.set_expo_token})
        self.generate_token(user)

    def login_signup(self, msg):
        from django.contrib.auth.models import User
        from django.contrib.auth.password_validation import validate_password, ValidationError
        content = {"type": "login-signup"}

        if msg["username"] == "":
            content["error"] = "Username field empty"
        elif User.objects.filter(username=msg["username"]).count():
            content["error"] = "Username already used"
        elif msg["password1"] != msg["password2"]:
            content["error"] = "The two password fields didn’t match"
        else:
            user = User(username=msg['username'])
            try:
                validate_password(msg["password1"], user)
            except ValidationError as val_err:
                content["error"] = str(val_err.messages[0])
            else:
                user.set_password(msg["password1"])
                user.save()
                self.login_user(user)
                return

        self.send_json(content)

    def logout(self, msg=None):
        async_to_sync(self.channel_layer.group_discard)(str(self.user.id), self.channel_name)
        self.user.profile.expo_token = ""
        self.user.save()
        self.user = None

    def set_expo_token(self, msg):
        self.user.profile.expo_token = msg["token"]
        self.user.save()
        
