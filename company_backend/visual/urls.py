# urls.py

from django.urls import path
from .views import ProductionReport,SuggestionView,VisualViewSet,BulkAddVisualAPIView,get_target_details8

urlpatterns = [
    path('api/production-report/', ProductionReport.as_view(), name='production-report'),
    path('api/suggestions/', SuggestionView.as_view(), name='suggestions'),
    # Add additional endpoints for Year, Week, Customer, Component, and Line Reports
    path('VisualViewSet/', VisualViewSet.as_view({'get': 'list', 'post': 'create'}), name='VisualViewSet'),
    path('VisualViewSet/<int:pk>/', VisualViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='VisualViewSet-detail'),
    path('api/visual/bulk-add/', BulkAddVisualAPIView.as_view(), name='BulkAddVisualAPIView'),
    path('get-target-details8/', get_target_details8, name='get_target_details8'),
]
