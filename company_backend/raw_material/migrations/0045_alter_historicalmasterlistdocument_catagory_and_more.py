# Generated by Django 5.1.4 on 2025-04-16 10:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('raw_material', '0044_historicalmasterlistdocument_catagory_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='historicalmasterlistdocument',
            name='catagory',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='masterlistdocument',
            name='catagory',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
