# Generated by Django 3.0.3 on 2020-02-14 16:30

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_auto_20200214_1728'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inmatch',
            name='last_move',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
