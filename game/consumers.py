from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync
from game.models import Match, Lobby, InMatch, EndedMatch, QuickMatch
import chess, chess.pgn
from django.utils.timezone import now 


class MainConsumer(JsonWebsocketConsumer):

    def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            return
        self.accept()
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
        ]
        self.games = {}
        self.load_games()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(str(self.user.id), self.channel_name)

    def receive_json(self, content):        
        for r in self.requests:
            if content["type"] == r["type"]:
                r["f"](content)
        
    def load_games(self):
        from io import StringIO
        matches = InMatch.user_matches(self.user)
        for match in matches:
            self.games[match.pk] = chess.pgn.read_game(StringIO(match.pgn), Visitor= chess.pgn.BoardBuilder)

    def message_opponent(self, match, msg):
        opponent = match.versus(self.user)
        async_to_sync(self.channel_layer.group_send)(str(opponent.id), msg)

    def message_myself(self, msg):
        async_to_sync(self.channel_layer.group_send)(str(self.user.id), msg)

    def get_notifications(self, msg):
        matches = [match.pk for match in InMatch.user_turn_matches(self.user)]
        content = {
            "type" : "notifications",
            "number" : matches.count(),
            "games-id" : matches,
        }
        self.send_json(content)

    def notify(self, msg):
        self.send_json(msg)

    def match_notify(self, match):
        msg = {"type": "notify", "id": match.pk}
        self.message_myself(msg)
        self.message_opponent(match, msg)

    def home_page(self, msg=None):
        content = {
            "type" : "home-page",
            "list" : [match.to_home_dict(self.user) for match in InMatch.user_matches(self.user)],
            "username" : self.user.username,
            "history" : [match.to_home_dict(self.user) for match in EndedMatch.user_matches(self.user)],
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
    
    def create_board(self, msg):
        self.games[msg["id"]] = chess.Board()

    def start_game(self, msg):
        lobby = Lobby.get_or_none(msg["id"])
        if not lobby:
            return None
        match = lobby.join_match(self.user)
        if match:
            self.message_opponent(match, {"type": "get.my.lobby", "quick": match.quick})
            self.create_board(msg)
            self.message_opponent(match, {"type": "create.board", "id": match.pk})
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
            return None
            
        content["match"] = match.to_dict()

        if isinstance(match, EndedMatch):
            content["board"] = match.last_fen
            content["result"] = match.user_result(self.user)
        else:
            content["board"] = self.games[match.pk].board_fen()
            if match.user_has_turn(self.user):
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
        print(self.user.username + " " + msg["move"] + " " + self.games[msg["id"]].fen() + "\n\n")
        self.games[msg["id"]].push_uci(msg["move"])

    def board_delete(self, msg):
        self.games.pop(msg["id"])

    def game_move(self, msg):
        match = InMatch.get_or_none(msg["id"])
        if not match:
            return
        if not match.user_has_turn(self.user):
            return
        if msg["move"] not in [move.uci() for move in self.games[match.pk].legal_moves]:
            return
        
        # time check

        msg["type"] = "board.push"
        self.message_myself(msg)
        self.message_opponent(match, msg)

        match.white_turn = not match.white_turn
        match.last_move = now()
        match.pgn = chess.pgn.Game.from_board(self.games[match.pk]).accept(chess.pgn.StringExporter(headers=False, variations=False, comments=False))
        match.save()

        if self.games[match.pk].is_game_over():
            self.game_end(match)
            return

        self.match_notify(match)
    
    # check claim or resign function

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
        self.board_delete(msg)
        self.message_opponent(match, msg)

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

        self.match_notify(match)

    # idea notifiche: attributo notification in match, chiamato ad ogni volta che c'è un cambiamento (game-page)
    # list-moves max height (half the board) e scrollable