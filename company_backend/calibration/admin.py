from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import CALIBRATION,CALIBRATIONHistory,ID


@admin.register(CALIBRATION)
class CALIBRATIONAdmin(ImportExportModelAdmin):
    list_display = ('uid', 'name_of_instrument',)
    search_fields = ('uid', 'name_of_instrument')
    pass

@admin.register(CALIBRATIONHistory)
class ComplaintHistoryAdmin(ImportExportModelAdmin):
    list_display = ('complaint', 'changed_by',)
    search_fields = ('complaint', 'changed_by')
    pass

@admin.register(ID)
class IdAdmin(ImportExportModelAdmin):
    list_display = ('category', 'receiving_status',)
    search_fields = ('category', 'receiving_status')
    pass