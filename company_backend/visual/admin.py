
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Visual


@admin.register(Visual)
class VisualAdmin(ImportExportModelAdmin):
    list_display = ('date', 'component',)
    search_fields = ('component', 'date')
    pass