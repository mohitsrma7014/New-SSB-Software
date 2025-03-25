from django.urls import path
from .views import ComplaintListCreateView, ComplaintDetailView, ComplaintHistoryView,ComplaintListCreateViewR,get_all_complaints_for_notifications
from .views import GenerateUIDView, IDListView,update_status,CategoryListView,SupplierListView,InstrumentListView,DepartmentListView

urlpatterns = [
    path('api/complaints/', ComplaintListCreateView.as_view(), name='complaint-list-create'),
    path('api/Rejected/', ComplaintListCreateViewR.as_view(), name='Rejected-list-create'),
    path('api/complaints/<int:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('api/complaints/<int:id>/history/', ComplaintHistoryView.as_view(), name='complaint-history'),
    path('generate-uid/', GenerateUIDView.as_view(), name='generate-uid'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('suppliers/', SupplierListView.as_view(), name='supplier-list'),
    path('instruments/', InstrumentListView.as_view(), name='instrument-list'),
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('id-list/', IDListView.as_view(), name='id-list'),
    path('update-status/<int:id>/', update_status, name='update-status'),
    path('api/complaints/notifications/', get_all_complaints_for_notifications, name='complaint-notifications'),
]
