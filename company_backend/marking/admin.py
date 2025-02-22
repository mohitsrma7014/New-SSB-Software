
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import marking


@admin.register(marking)
class MarkingAdmin(ImportExportModelAdmin):
    list_display = ('date', 'component',)
    search_fields = ('component', 'date')
    pass