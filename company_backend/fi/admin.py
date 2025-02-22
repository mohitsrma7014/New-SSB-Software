
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Fi


@admin.register(Fi)
class FiAdmin(ImportExportModelAdmin):
    list_display = ('date', 'component',)
    search_fields = ('component', 'date')
    pass