# Generated by Django 5.1.4 on 2025-04-15 11:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('raw_material', '0040_alter_order_manual_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='note',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
