from django.urls import path
from .views import ComplaintListCreateView, ComplaintDetailView, ComplaintHistoryView,ComplaintListCreateViewR
from .views import GenerateUIDView, IDListView,update_status

urlpatterns = [
    path('api/complaints/', ComplaintListCreateView.as_view(), name='complaint-list-create'),
    path('api/Rejected/', ComplaintListCreateViewR.as_view(), name='Rejected-list-create'),
    path('api/complaints/<int:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('api/complaints/<int:id>/history/', ComplaintHistoryView.as_view(), name='complaint-history'),
    path('generate-uid/', GenerateUIDView.as_view(), name='generate-uid'),
    path('id-list/', IDListView.as_view(), name='id-list'),
    path('update-status/<int:id>/', update_status, name='update-status'),
]
