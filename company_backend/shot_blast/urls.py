# urls.py

from django.urls import path
from .views import ProductionReport,SuggestionView,ShotblastViewSet,BulkAddShotblastAPIView,get_target_details5
urlpatterns = [
    path('api/production-report/', ProductionReport.as_view(), name='production-report-ht'),
    path('api/suggestions/', SuggestionView.as_view(), name='suggestions'),
    path('ShotblastViewSet/', ShotblastViewSet.as_view({'get': 'list', 'post': 'create'}), name='ShotblastViewSet'),
    path('ShotblastViewSet/<int:pk>/', ShotblastViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='ShotblastViewSet-Set'),
    path('api/sb/bulk-add/', BulkAddShotblastAPIView.as_view(), name='BulkAddShotblastAPIView'),
    path('get-target-details5/', get_target_details5, name='get_target_details5'),
]
