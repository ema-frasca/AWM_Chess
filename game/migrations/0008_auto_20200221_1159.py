# Generated by Django 3.0.3 on 2020-02-21 10:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0007_auto_20200219_1606'),
    ]

    operations = [
        migrations.AlterField(
            model_name='endedmatch',
            name='result',
            field=models.CharField(default='*', max_length=3),
        ),
    ]
