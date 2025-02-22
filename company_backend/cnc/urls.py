# urls.py

from django.urls import path
from .views import ProductionReport,SuggestionView,MachiningViewSet,BulkAddCncAPIView,get_target_details7,get_part_detailscnc,CncplanningViewSet,CncCycleTimeView
from . import views
from .views import ComplaintListCreateView, ComplaintDetailView, ComplaintHistoryView

urlpatterns = [
    path('api/production-report/', ProductionReport.as_view(), name='production-report'),
    path('api/suggestions/', SuggestionView.as_view(), name='suggestions'),
    # Add additional endpoints for Year, Week, Customer, Component, and Line Reports
    path('MachiningViewSet/', MachiningViewSet.as_view({'get': 'list', 'post': 'create'}), name='MachiningViewSet'),
    path('MachiningViewSet/<int:pk>/', MachiningViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='MachiningViewSet-detail'),
    path('api/cnc/bulk-add/', BulkAddCncAPIView.as_view(), name='BulkAddCncAPIView'),
    path('get-target-details7/', get_target_details7, name='get_target_details7'),
    path('autocompletecnc/', views.autocompletecnc, name='autocompletecnc'),
    path('get_part_detailscnc/', views.get_part_detailscnc, name='get_part_detailscnc'),
    path('cncplanning/', CncplanningViewSet.as_view({'get': 'list', 'post': 'create'}), name='cncplanning-list-create'),
    path('cncplanning/<int:pk>/', CncplanningViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='cncplanning-detail'),
    path('api/get-available-cnc-lines/', views.get_available_cnc_lines),
    path('api/cnc-cycle-time/', CncCycleTimeView.as_view(), name='cnc-cycle-time'),
    path('api/complaints/', ComplaintListCreateView.as_view(), name='complaint-list-create'),
    path('api/complaints/<int:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('api/complaints/<int:id>/history/', ComplaintHistoryView.as_view(), name='complaint-history'),
]

