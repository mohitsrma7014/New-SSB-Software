# Generated by Django 5.1.4 on 2025-03-31 09:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('raw_material', '0033_order_completion_date'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='order',
            options={'ordering': ['-po_date'], 'verbose_name': 'Purchase Order', 'verbose_name_plural': 'Purchase Orders'},
        ),
        migrations.CreateModel(
            name='HeatNumber',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('heat_no', models.CharField(max_length=100)),
                ('received_qty', models.IntegerField()),
                ('received_date', models.DateField()),
                ('actual_delivery_date', models.DateField(blank=True, null=True)),
                ('verified_by', models.CharField(blank=True, max_length=100, null=True)),
                ('delay_days', models.IntegerField(blank=True, editable=False, null=True)),
                ('delay_reason', models.CharField(blank=True, max_length=200, null=True)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='heat_numbers', to='raw_material.order')),
            ],
            options={
                'verbose_name': 'Heat Number Delivery',
                'verbose_name_plural': 'Heat Number Deliveries',
                'ordering': ['-received_date'],
            },
        ),
    ]
