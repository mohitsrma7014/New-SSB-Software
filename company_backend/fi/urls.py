# urls.py

from django.urls import path
from .views import ProductionReport,SuggestionView,FiViewSet,BulkAddFiAPIView,get_target_details6

urlpatterns = [
    path('api/production-report/', ProductionReport.as_view(), name='production-report'),
    path('api/suggestions/', SuggestionView.as_view(), name='suggestions'),
    # Add additional endpoints for Year, Week, Customer, Component, and Line Reports
    path('FiViewSet/', FiViewSet.as_view({'get': 'list', 'post': 'create'}), name='FiViewSet'),
    path('FiViewSet/<int:pk>/', FiViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='FiViewSet-detail'),
    path('api/fi/bulk-add/', BulkAddFiAPIView.as_view(), name='BulkAddFiAPIView'),
     path('get-target-details6/', get_target_details6, name='get_target_details6'),
]
