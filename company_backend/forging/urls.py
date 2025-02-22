# urls.py

from django.urls import path
from . import views
from .views import ProductionReport, ProductionByMonth,SuggestionView,ForgingViewSet,BulkAddForgingAPIView,get_target_details1,MonthlyProductionView,ProductionTrendAPI,RejectionTrendAPI,RejectionData,inventory_status

urlpatterns = [
    path('api/production-report/', ProductionReport.as_view(), name='production-report'),
    path('api/production-by-month/', ProductionByMonth.as_view(), name='production-by-month'),
    path('api/suggestions/', SuggestionView.as_view(), name='suggestions'),
    path('ForgingViewSet/', ForgingViewSet.as_view({'get': 'list', 'post': 'create'}), name='ForgingViewSet'),
    path('ForgingViewSet/<int:pk>/', ForgingViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='forging-detail'),
    # Add additional endpoints for Year, Week, Customer, Component, and Line Reports
    path('api/forging/bulk-add/', BulkAddForgingAPIView.as_view(), name='bulk_add_forging'),
    path('get-target-details/', get_target_details1, name='get_target_details'),

    path('autocompleteht/', views.autocompleteheat, name='autocompleteht'),
    path('get_part_detailsheat/', views.get_part_detailsheat, name='get_part_detailsheat'),
   path('api/monthly-production/', MonthlyProductionView.as_view(), name='monthly-production'),
   path('api/production-trend/', ProductionTrendAPI.as_view(), name='production-trend'),
   path('api/rejection-trend/', RejectionTrendAPI.as_view(), name='rejection-trend'),
   path('api/rejection-data/', RejectionData.as_view(), name='rejection-data'),
   path('api/inventory_status/<str:component_name>/', inventory_status, name='inventory_status'),
   path('api/inventory_status/', inventory_status, name='inventory_status1'),
]
