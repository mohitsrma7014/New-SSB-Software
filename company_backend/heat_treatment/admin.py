from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import HeatTreatment


@admin.register(HeatTreatment)
class HeatTreatmentAdmin(ImportExportModelAdmin):
    list_display = ('date', 'component',)
    search_fields = ('component', 'date')
    pass