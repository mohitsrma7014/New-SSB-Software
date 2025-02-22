from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Complaint,ComplaintHistory


@admin.register(Complaint)
class ComplaintAdmin(ImportExportModelAdmin):
    list_display = ('STATUS_CHOICES', 'customer_name',)
    search_fields = ('STATUS_CHOICES', 'customer_name')
    pass

@admin.register(ComplaintHistory)
class ComplaintHistoryAdmin(ImportExportModelAdmin):
    list_display = ('complaint', 'changed_by',)
    search_fields = ('complaint', 'changed_by')
    pass