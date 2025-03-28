from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import dispatch,RawMaterial,Blockmt,BatchTracking,Schedule,Supplier,Grade,Customer,TypeOfMaterial,MaterialType,rmreciveinbatch,Masterlist,Order,MaterialComplaint

@admin.register(RawMaterial)
class RawMaterialAdmin(ImportExportModelAdmin):
    list_display = ('date', 'heatno',)
    search_fields = ('heatno', 'supplier')
    pass

@admin.register(dispatch)
class dispatchAdmin(ImportExportModelAdmin):
    list_display = ('component', 'invoiceno',)
    search_fields = ('component', 'invoiceno')
    pass

@admin.register(Schedule)
class ScheduleAdmin(ImportExportModelAdmin):
    list_display = ('component', 'customer',)
    search_fields = ('component', 'customer')
    pass


@admin.register(Blockmt)
class BlockmtAdmin(ImportExportModelAdmin):
    list_display = ('block_mt_id', 'component',)
    search_fields = ('block_mt_id', 'component')
    pass

@admin.register(BatchTracking)
class BatchTrackingAdmin(ImportExportModelAdmin):
    list_display = ('block_mt_id', 'batch_number',)
    search_fields = ('block_mt_id', 'batch_number')
    pass

@admin.register(Masterlist)
class MasterlistAdmin(ImportExportModelAdmin):
    list_display = ('component', 'customer',)
    search_fields = ('component', 'customer')
    pass

@admin.register(rmreciveinbatch)
class RmreciveinbatchAdmin(ImportExportModelAdmin):
    list_display = ('block_mt_id', )
    search_fields = ('block_mt_id', )
    pass
@admin.register(MaterialType)
class MaterialTypeAdmin(ImportExportModelAdmin):
    list_display = ('name', )
    search_fields = ('name', )
    pass
@admin.register(TypeOfMaterial)
class TypeOfMaterialAdmin(ImportExportModelAdmin):
    list_display = ('name', )
    search_fields = ('name', )
    pass
@admin.register(Customer)
class CustomerAdmin(ImportExportModelAdmin):
    list_display = ('name', )
    search_fields = ('name', )
    pass
@admin.register(Grade)
class GradeAdmin(ImportExportModelAdmin):
    list_display = ('name', )
    search_fields = ('name', )
    pass
@admin.register(Supplier)
class SupplierAdmin(ImportExportModelAdmin):
    list_display = ('name', )
    search_fields = ('name', )
    pass

@admin.register(Order)
class OrderAdmin(ImportExportModelAdmin):
    list_display = ('supplier','rm_grade' )
    search_fields = ('supplier', 'rm_grade')
    pass

@admin.register(MaterialComplaint)
class MaterialComplaintAdmin(ImportExportModelAdmin):
    list_display = ('supplier','grade' )
    search_fields = ('heat', 'grade')
    pass