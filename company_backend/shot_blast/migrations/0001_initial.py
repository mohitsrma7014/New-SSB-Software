# Generated by Django 5.1.4 on 2024-12-31 05:54

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Shotblast',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('batch_number', models.CharField(max_length=50)),
                ('date', models.DateField()),
                ('shift', models.CharField(max_length=100)),
                ('component', models.CharField(max_length=100)),
                ('machine', models.CharField(max_length=100)),
                ('weight', models.DecimalField(decimal_places=3, max_digits=10)),
                ('no_of_pic', models.IntegerField()),
                ('operator', models.CharField(max_length=100)),
                ('verified_by', models.CharField(max_length=100)),
                ('target', models.IntegerField()),
                ('total_produced', models.IntegerField()),
                ('remaining', models.IntegerField()),
                ('heat_no', models.CharField(max_length=50)),
            ],
        ),
    ]
