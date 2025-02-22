from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Forging


@admin.register(Forging)
class ForgingAdmin(ImportExportModelAdmin):
    list_display = ('date', 'component',)
    search_fields = ('component', 'customer')
    pass