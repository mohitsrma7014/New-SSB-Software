from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import CALIBRATION, CALIBRATIONHistory
from .serializers import ComplaintSerializer, ComplaintHistorySerializer

# Create & List Complaints
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import CALIBRATION
from .serializers import ComplaintSerializer
from rest_framework.pagination import PageNumberPagination
from django_filters import rest_framework as filters

# Custom filter class
class CalibrationFilter(filters.FilterSet):
    uid = filters.CharFilter(lookup_expr='icontains')
    name_of_instrument = filters.CharFilter(lookup_expr='icontains')
    catagory = filters.CharFilter(lookup_expr='icontains')
    department = filters.CharFilter(lookup_expr='icontains')
    supplier = filters.CharFilter(lookup_expr='icontains')
    CALIBRATION_AGENCY = filters.CharFilter(lookup_expr='icontains')
    LOCATION = filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = CALIBRATION
        fields = ['uid', 'name_of_instrument', 'catagory', 'department', 'supplier', 'CALIBRATION_AGENCY', 'LOCATION']

# Custom pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ComplaintListCreateView(generics.ListCreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = CalibrationFilter

    def get_queryset(self):
        queryset = CALIBRATION.objects.filter(status="Running").order_by('-created_at')
        return queryset

    def perform_create(self, serializer):
        if not serializer.is_valid():
            print("Validation Errors:", serializer.errors)  # Log validation errors
        serializer.save(created_by=self.request.user)
        

from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_complaints_for_notifications(request):
    complaints = CALIBRATION.objects.filter(status="Running").order_by('-created_at')
    serializer = ComplaintSerializer(complaints, many=True)
    return Response(serializer.data)

class ComplaintListCreateViewR(generics.ListCreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = CalibrationFilter

    def get_queryset(self):
        queryset = CALIBRATION.objects.filter(status="Rejected").order_by('-created_at')
        return queryset

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


from .models import ID, Category, Supplier, Instrument, Department
class GenerateUIDView(APIView):
    def post(self, request):
        category = request.data.get("category")
        supplier = request.data.get("supplier")
        name_of_instrument = request.data.get("name_of_instrument")
        department = request.data.get("department")

        if not category or not supplier or not name_of_instrument or not department:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get the highest UID number for the given combination
        existing_uids = ID.objects.filter(
            category=category,
        ).values_list('uid', flat=True)

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
        id_obj = ID.objects.create(
            category=category,
            uid=new_uid,
            supplier=supplier,
            name_of_instrument=name_of_instrument,
            department=department
        )
        return Response({"uid": new_uid}, status=status.HTTP_201_CREATED)
    

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 10  # Number of items per page
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "total_entries": self.page.paginator.count,
            "total_pages": self.page.paginator.num_pages,
            "current_page": self.page.number,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })

class IDListView(APIView):
    pagination_class = CustomPagination

    def get(self, request):
        status = request.query_params.get("status", None)  # Get status from query params
        page = request.query_params.get("page", 1)  # Get page number
        page_size = request.query_params.get("page_size", 10)  # Get page size

        if status:
            ids = ID.objects.filter(receiving_status=status)  # Filter by status
        else:
            ids = ID.objects.all()  # Fetch all if no status is provided

        # Paginate the results
        paginator = self.pagination_class()
        paginated_ids = paginator.paginate_queryset(ids, request)
        serializer = IDSerializer(paginated_ids, many=True)
        return paginator.get_paginated_response(serializer.data)
    
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


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Category, Supplier, Instrument, Department

class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.all().values_list('name', flat=True)
        return Response(list(categories), status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get("name")
        if not name:
            return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
        Category.objects.create(name=name)
        return Response({"message": "Category added successfully"}, status=status.HTTP_201_CREATED)

# Similarly, create views for Supplier, Instrument, and Department

class SupplierListView(APIView):
    def get(self, request):
        categories = Supplier.objects.all().values_list('name', flat=True)
        return Response(list(categories), status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get("name")
        if not name:
            return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
        Supplier.objects.create(name=name)
        return Response({"message": "Supplier added successfully"}, status=status.HTTP_201_CREATED)

# Similarly, create views for Supplier, Instrument, and Department

class InstrumentListView(APIView):
    def get(self, request):
        categories = Instrument.objects.all().values_list('name', flat=True)
        return Response(list(categories), status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get("name")
        if not name:
            return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
        Instrument.objects.create(name=name)
        return Response({"message": "Instrument added successfully"}, status=status.HTTP_201_CREATED)

# Similarly, create views for Supplier, Instrument, and Department

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Category, Supplier, Instrument, Department

class DepartmentListView(APIView):
    def get(self, request):
        categories = Department.objects.all().values_list('name', flat=True)
        return Response(list(categories), status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get("name")
        if not name:
            return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
        Department.objects.create(name=name)
        return Response({"message": "Department added successfully"}, status=status.HTTP_201_CREATED)

# Similarly, create views for Supplier, Instrument, and Department