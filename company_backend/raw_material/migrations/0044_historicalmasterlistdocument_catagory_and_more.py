# Generated by Django 5.1.4 on 2025-04-16 07:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('raw_material', '0043_historicalmasterlist_forging_line_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicalmasterlistdocument',
            name='catagory',
            field=models.CharField(default=0, max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='masterlistdocument',
            name='catagory',
            field=models.CharField(default=0, max_length=50),
            preserve_default=False,
        ),
    ]
