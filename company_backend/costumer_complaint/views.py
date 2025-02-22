from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Complaint, ComplaintHistory
from .serializers import ComplaintSerializer, ComplaintHistorySerializer

# Create & List Complaints
class ComplaintListCreateView(generics.ListCreateAPIView):
    queryset = Complaint.objects.all().order_by('-created_at')
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        if not serializer.is_valid():
            print("Validation Errors:", serializer.errors)  # Log validation errors
        serializer.save(created_by=self.request.user)


from django.conf import settings
from django.core.files.storage import default_storage
from django.utils.safestring import mark_safe
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile

class ComplaintDetailView(generics.RetrieveUpdateAPIView):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_update(self, serializer):
        complaint = self.get_object()
        updated_data = serializer.validated_data

        for field, new_value in updated_data.items():
            old_value = getattr(complaint, field, None)

            # Handle file fields separately
            if hasattr(complaint._meta.get_field(field), "upload_to"):
                if old_value:
                    old_value_url = self.request.build_absolute_uri(old_value.url)
                else:
                    old_value_url = "None"

                # Handle newly uploaded file
                if isinstance(new_value, (InMemoryUploadedFile, TemporaryUploadedFile)):
                    new_value_url = new_value.name  # Use filename instead of .url
                elif new_value:
                    new_value_url = self.request.build_absolute_uri(new_value.url)
                else:
                    new_value_url = "None"
            else:
                old_value_url = str(old_value)
                new_value_url = str(new_value)

            # Save history if values changed
            if old_value_url != new_value_url:
                ComplaintHistory.objects.create(
                    complaint=complaint,
                    changed_by=self.request.user,
                    field_changed=field,
                    old_value=old_value_url,
                    new_value=new_value_url,
                )

        serializer.save()



# Get Complaint History
# Get Complaint History
class ComplaintHistoryView(generics.ListAPIView):
    serializer_class = ComplaintHistorySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        complaint_id = self.kwargs['id']

        # Use select_related to fetch related user data in a single query
        queryset = ComplaintHistory.objects.filter(complaint_id=complaint_id).select_related('changed_by').order_by('-changed_at')

        # Print the complaint history with user names
        data = [
            {
                "id": entry.id,
                "complaint_id": entry.complaint_id,
                "changed_by": entry.changed_by.get_full_name() or entry.changed_by.username,  # Get name instead of ID
                "changed_at": entry.changed_at,
                "field_changed": entry.field_changed,
                "old_value": entry.old_value,
                "new_value": entry.new_value,
            }
            for entry in queryset
        ]

        return queryset
