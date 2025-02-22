# urls.py

from django.urls import path
from .views import ProductionReport,SuggestionView,Pre_Mc_ViewSet,BulkAddpre_mcAPIView,get_target_details4
urlpatterns = [
    path('api/production-report/', ProductionReport.as_view(), name='production-report-ht'),
    path('api/suggestions/', SuggestionView.as_view(), name='suggestions'),
    path('Pre_Mc_ViewSet/', Pre_Mc_ViewSet.as_view({'get': 'list', 'post': 'create'}), name='Pre_Mc_ViewSet'),
    path('Pre_Mc_ViewSet/<int:pk>/', Pre_Mc_ViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='Pre_Mc_View-Set'),
    path('api/pre_mc/bulk-add/', BulkAddpre_mcAPIView.as_view(), name='BulkAddpre_mcAPIView'),
    path('get-target-details4/', get_target_details4, name='get_target_details4'),
]