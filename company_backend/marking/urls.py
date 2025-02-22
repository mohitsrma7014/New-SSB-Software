# urls.py

from django.urls import path
from .views import ProductionReport,SuggestionView,MarkingViewSet,BulkAddmarkingAPIView,get_target_details3

urlpatterns = [
    path('api/production-report/', ProductionReport.as_view(), name='production-report'),
    path('api/suggestions/', SuggestionView.as_view(), name='suggestions'),
    # Add additional endpoints for Year, Week, Customer, Component, and Line Reports
    path('MarkingViewSet/', MarkingViewSet.as_view({'get': 'list', 'post': 'create'}), name='MarkingViewSet'),
    path('MarkingViewSet/<int:pk>/', MarkingViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='MarkingViewSet-Set'),
    path('api/marking/bulk-add/', BulkAddmarkingAPIView.as_view(), name='BulkAddmarkingAPIView'),
    path('get-target-details3/', get_target_details3, name='get_target_details3'),

]
