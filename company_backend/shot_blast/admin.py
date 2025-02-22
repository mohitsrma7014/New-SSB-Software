from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Shotblast


@admin.register(Shotblast)
class ShotblastAdmin(ImportExportModelAdmin):
    list_display = ('date', 'component',)
    search_fields = ('component', 'date')
    pass