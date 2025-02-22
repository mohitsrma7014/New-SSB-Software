from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import pre_mc


@admin.register(pre_mc)
class Pre_mcAdmin(ImportExportModelAdmin):
    list_display = ('date', 'component',)
    search_fields = ('component', 'date')
    pass