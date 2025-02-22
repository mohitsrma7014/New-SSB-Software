
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import machining,Cncplanning,Cnc_line_master,LineHistory


@admin.register(machining)
class MachiningAdmin(ImportExportModelAdmin):
    list_display = ('date', 'component',)
    search_fields = ('component', 'date')
    pass


@admin.register(Cncplanning)
class CncPlanningAdmin(ImportExportModelAdmin):
    list_display = ('create_date', 'component',)
    search_fields = ('component', 'Cnc_uid')
    pass

@admin.register(Cnc_line_master)
class CncListAdmin(ImportExportModelAdmin):
    list_display = ('line', 'cell',)
    search_fields = ('line', 'cell')
    pass

@admin.register(LineHistory)
class LineHistoryAdmin(ImportExportModelAdmin):
    list_display = ('complaint', 'changed_by',)
    search_fields = ('complaint', 'changed_by')
    pass

