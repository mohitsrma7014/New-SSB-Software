# Generated by Django 5.1.4 on 2025-02-12 12:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cnc', '0008_rename_cell_cycle_time_cnc_line_master_machine_cycle_time_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='cnc_line_master',
            name='runningstatus',
            field=models.CharField(default=0, max_length=255),
            preserve_default=False,
        ),
    ]
