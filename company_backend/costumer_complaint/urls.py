from django.urls import path
from .views import ComplaintListCreateView, ComplaintDetailView, ComplaintHistoryView

urlpatterns = [
    path('api/complaints/', ComplaintListCreateView.as_view(), name='complaint-list-create'),
    path('api/complaints/<int:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('api/complaints/<int:id>/history/', ComplaintHistoryView.as_view(), name='complaint-history'),
]
