# Generated by Django 5.1.4 on 2025-03-31 11:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('raw_material', '0034_alter_order_options_heatnumber'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='force_closed',
            field=models.BooleanField(default=False),
        ),
    ]
