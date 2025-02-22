# urls.py

from django.urls import path
from .views import ProductionReport,SuggestionView,HeattreatmentViewSet,BulkAddHeattreatmentAPIView,get_target_details2
urlpatterns = [
    path('api/production-report/', ProductionReport.as_view(), name='production-report-ht'),
    path('api/suggestions/', SuggestionView.as_view(), name='suggestions'),
    path('HeattreatmentViewSet/', HeattreatmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='HeattreatmentViewSet'),
    path('HeattreatmentViewSet/<int:pk>/', HeattreatmentViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='HeattreatmentViewSet-Set'),
    path('api/ht/bulk-add/', BulkAddHeattreatmentAPIView.as_view(), name='BulkAddHeattreatmentAPIView'),
    path('get-target-details2/', get_target_details2, name='get_target_details2'),
]
