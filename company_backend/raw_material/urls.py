# urls.py
from django.urls import path
from . import views
from .views import *

order_list = OrderViewSet.as_view({'get': 'list', 'post': 'create'})
order_detail = OrderViewSet.as_view({'get': 'retrieve'})
update_actual_delivery = OrderViewSet.as_view({'patch': 'update_actual_delivery'})

urlpatterns = [
    path('raw_material/create/', views.create_raw_material, name='raw-material-create-api'),
    path('api/raw-materials/', RawMaterialListCreateView.as_view(), name='raw-material-list-create'),
    path('components/', views.component_suggestion, name='component_type_suggestions'),
    path('block_mt_id_suggestion/', views.autocomplete5, name='block_mt_id_suggestion'),
    path('autocompleteforging/', views.autocompleteforging, name='autocompleteforging'),
    path('locations_suggestions/', views.type_of_material_suggestions, name='type_of_material_suggestions'),
    path('suppliers_suggestions/', views.supplier_suggestions, name='supplier_suggestions'),
    path('customers_suggestions/', views.customer_suggestions, name='customer_suggestions'),
    path('grades_suggestions/', views.grade_suggestions, name='grade_suggestions'),
    path('type_of_materials_suggestions/', views.material_type_suggestions, name='material_type_suggestions'),
    path('api/balance-after-hold/', BalanceAfterHold.as_view(), name='balance_after_hold'),
    path('create-blockmt/', views.create_blockmt, name='create-blockmt'),
    path('get-part-details/', views.get_part_details, name='get_part_details'),
    path('get_operation_target/', views.get_operation_target, name='get_operation_target'),
    path('get-part-details1/', views.get_part_details1, name='get_part_details1'),
    path('get_part_detailsforging/', views.get_part_detailsforging, name='get_part_detailsforging'),
    path('get_part_details3/', views.get_part_details3, name='get_part_details3'),
    path('api/schedule/', ScheduleAPIView.as_view(), name='schedule-api'),
    path('api/dispatches/', DispatchListView.as_view(), name='dispatch-list'),
    path('api/rawmaterials/', RawMaterialListView.as_view(), name='rawmaterial-list'),
    path('api/rawmaterials/<int:pk>/', RawMaterialDetailView.as_view(), name='rawmaterial-detail'),
    path('api/generate-batch/', GenerateBatchTrackingNumberAPIView.as_view(), name='generate_batch'),
    path('suppliers/', SupplierViewSet.as_view({'get': 'list', 'post': 'create', 'put': 'update', 'delete': 'destroy'}), name='SupplierViewSet'),
    path('grades/', GradeViewSet.as_view({'get': 'list', 'post': 'create', 'put': 'update', 'delete': 'destroy'}), name='GradeViewSet'),
    path('customers/', CustomerViewSet.as_view({'get': 'list', 'post': 'create', 'put': 'update', 'delete': 'destroy'}), name='CustomerViewSet'),
    path('types_of_material/', TypeOfMaterialViewSet.as_view({'get': 'list', 'post': 'create', 'put': 'update', 'delete': 'destroy'}), name='TypeOfMaterialViewSet'),
    path('material_types/', MaterialTypeViewSet.as_view({'get': 'list', 'post': 'create', 'put': 'update', 'delete': 'destroy'}), name='MaterialTypeViewSet'),
    path('api/batch-tracking/', BatchTrackingListView.as_view(), name='batch-tracking-list'),
    path('api/blockmt/', BlockmtAPI.as_view(), name='blockmt-api'),
    path('api/blockmt1/', BlockmtAPI1.as_view(), name='blockmt-api1'),
    path('ScheduleViewSet/', ScheduleViewSet.as_view({'get': 'list', 'post': 'create', 'put': 'update', 'delete': 'destroy'}), name='ScheduleViewSet'),
    path('api/traceability-card/', TraceabilityCardView.as_view(), name='traceability-card-api'),
    path('api/traceability-card2/', TraceabilityCardView2.as_view(), name='traceability-card-api2'),
    path('api/dispatch/', DispatchListCreateAPIView.as_view(), name='dispatch-list-create'),

    path('MasterListViewSet/', MasterListViewSet.as_view({'get': 'list', 'post': 'create'}), name='MasterListViewSet'),
    path('MasterListViewSet/<int:pk>/', MasterListViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='MasterListViewSet-Set'),
    path('calculate-dispatch-tonnage/', views.calculate_dispatch_tonnage, name='calculate_dispatch_tonnage'),
    path('BatchTrackingView/', BatchTrackingView.as_view(), name='BatchTrackingView'),
    path('api/forging-quality-report/', ForgingQualityReportAPIView.as_view(), name='forging-quality-report'),
    path('api/FinancialYearTrendsAPIView/', FinancialYearTrendsAPIView.as_view(), name='FinancialYearTrendsAPIView'),
    path('api/orders/', order_list, name='orders-list'),
    path('api/orders/<int:pk>/', order_detail, name='order-detail'),
    path('api/orders/<int:pk>/update-delivery/', update_actual_delivery, name='update-actual-delivery'),

     path('masterlist/<int:pk>/history/', MasterlistHistoryView.as_view(), name='masterlist-history'),
]
