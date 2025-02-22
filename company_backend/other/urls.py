from django.urls import path
from .views import upload_and_process_pdf

urlpatterns = [
    path('upload-pdf/', upload_and_process_pdf, name="upload-pdf"),
]
