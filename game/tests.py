from django.test import TestCase
from .models import Profile, Match, Lobby, InMatch, QuickMatch, EndedMatch 
from datetime import timedelta

# Create your tests here.

class MatchTransferTest(TestCase):

    def test_lobby_transfer_slow(self):
        ctime = timedelta(hours=12)
        lobby = Lobby.objects.create(quick=False, chosen_time=ctime)
        pk = lobby.pk
        slow = lobby.start()
        self.assertEqual(slow.pk, pk)
        self.assertIsInstance(slow, InMatch)
        with self.assertRaises(Lobby.DoesNotExist):
            Lobby.objects.get(pk=pk)
        self.assertEqual(slow, InMatch.objects.get(pk=pk))
        self.assertEqual(slow.chosen_time, ctime)

    def test_lobby_transfer_quick(self):
        ctime = timedelta(minutes=15)
        lobby = Lobby.objects.create(quick=True, chosen_time=ctime)
        pk = lobby.pk
        quick = lobby.start()
        self.assertEqual(quick.pk, pk)
        self.assertIsInstance(quick, QuickMatch)
        with self.assertRaises(Lobby.DoesNotExist):
            Lobby.objects.get(pk=pk)
        self.assertEqual(quick, QuickMatch.objects.get(pk=pk))
        self.assertEqual(quick.chosen_time, ctime)

    def test_slow_transfer_end(self):
        ctime = timedelta(hours=12)
        slow = InMatch.objects.create(quick=False, chosen_time=ctime)
        pk = slow.pk
        ended = slow.end()
        self.assertEqual(ended.pk, pk)
        self.assertIsInstance(ended, EndedMatch)
        with self.assertRaises(InMatch.DoesNotExist):
            InMatch.objects.get(pk=pk)
        self.assertEqual(ended, EndedMatch.objects.get(pk=pk))
        self.assertEqual(ended.chosen_time, ctime)

    def test_quick_transfer_end(self):
        ctime = timedelta(minutes=15)
        quick = QuickMatch.objects.create(quick=False, chosen_time=ctime)
        pk = quick.pk
        ended = quick.end()
        self.assertEqual(ended.pk, pk)
        self.assertIsInstance(ended, EndedMatch)
        with self.assertRaises(InMatch.DoesNotExist):
            InMatch.objects.get(pk=pk)
        with self.assertRaises(QuickMatch.DoesNotExist):
            QuickMatch.objects.get(pk=pk)
        self.assertEqual(ended, EndedMatch.objects.get(pk=pk))
        self.assertEqual(ended.chosen_time, ctime)

        