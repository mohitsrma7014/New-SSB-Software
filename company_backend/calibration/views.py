from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import CALIBRATION, CALIBRATIONHistory
from .serializers import ComplaintSerializer, ComplaintHistorySerializer

# Create & List Complaints
class ComplaintListCreateView(generics.ListCreateAPIView):
    queryset = CALIBRATION.objects.filter(status="Running").order_by('-created_at')
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        if not serializer.is_valid():
            print("Validation Errors:", serializer.errors)  # Log validation errors
        serializer.save(created_by=self.request.user)

class ComplaintListCreateViewR(generics.ListCreateAPIView):
    queryset = CALIBRATION.objects.filter(status="Rejected").order_by('-created_at')
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
    queryset = CALIBRATION.objects.all()
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
                CALIBRATIONHistory.objects.create(
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
        queryset = CALIBRATIONHistory.objects.filter(complaint_id=complaint_id).select_related('changed_by').order_by('-changed_at')

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


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ID
from .serializers import IDSerializer

class GenerateUIDView(APIView):
    def post(self, request):
        category = request.data.get("category")

        if not category:
            return Response({"error": "Category is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get all existing UIDs for the given category
        existing_uids = ID.objects.filter(category=category).values_list('uid', flat=True)

        highest_number = 0
        for uid in existing_uids:
            try:
                parts = uid.split("/")  # Split by '/'
                if len(parts) == 3 and parts[1] == category:  # Ensure correct format
                    num = int(parts[2])  # Extract the last part as an integer
                    highest_number = max(highest_number, num)
            except ValueError:
                continue  # Skip any malformed UIDs

        new_number = highest_number + 1
        new_uid = f"SSB/{category}/{new_number}"

        # Save new UID in ID model
        id_obj = ID.objects.create(category=category, uid=new_uid)
        return Response(IDSerializer(id_obj).data, status=status.HTTP_201_CREATED)




class IDListView(APIView):
    def get(self, request):
        ids = ID.objects.all()
        serializer = IDSerializer(ids, many=True)
        return Response(serializer.data)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ID
from .serializers import IDSerializer
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json

@csrf_exempt
def update_status(request, id):  # Change 'uid' to 'id'
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)
            new_status = data.get("receiving_status")

            # Fetch object using database ID
            uid_obj = get_object_or_404(ID, id=id)

            # Update status
            uid_obj.receiving_status = new_status
            uid_obj.save()

            return JsonResponse({"message": "Status updated successfully", "new_status": new_status}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)

