# Generated by Django 3.0.3 on 2020-03-01 10:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0008_auto_20200221_1159'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='pgn',
            field=models.CharField(default='*', max_length=2000),
        ),
    ]
