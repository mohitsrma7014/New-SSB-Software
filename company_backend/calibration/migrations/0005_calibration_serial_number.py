# Generated by Django 5.1.4 on 2025-02-21 05:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calibration', '0004_alter_id_receiving_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='calibration',
            name='serial_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
