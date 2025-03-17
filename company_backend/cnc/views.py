from rest_framework.views import APIView
from rest_framework.response import Response
from .models import machining
from django.db.models import Sum, F
from datetime import datetime

from datetime import datetime
from django.db.models import F, Sum, Q,Case, When
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models.functions import Upper, Lower
class ProductionReport(APIView):
    def get(self, request, *args, **kwargs):
        # Extract query parameters
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        date = request.query_params.get('date')
        component = request.query_params.get('component')
        customer = request.query_params.get('customer')
        line = request.query_params.get('line')
        batch_id = request.query_params.get('batch_id')

        if customer:
            customer = customer.capitalize()
        

        # Build the filter query dynamically
        filters = Q()

        if date:
            filters &= Q(date=datetime.strptime(date, '%Y-%m-%d'))
        if month:
            filters &= Q(date__month=month)
        if year:
            filters &= Q(date__year=year)
        if component:
            filters &= Q(component=component)
        if customer:
            filters &= Q(customer=customer)
        if line:
            filters &= Q(line=line)
        if batch_id:
            filters &= Q(batch_id=batch_id)

        # Apply filters
        report = machining.objects.filter(filters)

        # Annotate with the total production weight (production * slug_weight)
        report = report.annotate(
            production_weight_kg=F('production'),
            total_cnc_rejection=F('cnc_height') + F('cnc_od') + F('cnc_bore') + F('cnc_groove') + F('cnc_dent'),
            total_forging_rejection=F('forging_height') + F('forging_od') + F('forging_bore') + F('forging_crack') + F('forging_dent'),
            total_pre_mc_rejection=F('pre_mc_height') + F('pre_mc_od') + F('pre_mc_bore') ,
            total_rework=F('rework_height') + F('rework_od') + F('rework_bore') + F('rework_groove') + F('rework_dent'),
            total_rejection=F('total_cnc_rejection') + F('total_forging_rejection') + F('total_pre_mc_rejection') 
        )

        # Aggregate production and rejection fields
        total_production = report.aggregate(
            conditional_production=Sum(
                Case(
                    When(setup='II', then=F('production')),
                    When(setup='Broch', then=F('production')),
                    
                    default=0
                )
            )
        )['conditional_production'] or 0
        total_cnc = report.aggregate(Sum('total_cnc_rejection'))['total_cnc_rejection__sum'] or 0
        total_forging = report.aggregate(Sum('total_forging_rejection'))['total_forging_rejection__sum'] or 0
        total_premc = report.aggregate(Sum('total_pre_mc_rejection'))['total_pre_mc_rejection__sum'] or 0
        total_rework = report.aggregate(Sum('total_rework'))['total_rework__sum'] or 0
        

        total_rejection = (total_cnc + total_forging + total_premc )

        # Calculate rejection percentage
        total_rejection_percentage = (total_rejection / (total_production)) * 100 if total_rejection else 0

        # Calculate total production weight (kg and tons) by summing production_weight_kg

        # Aggregate by component, customer, and line
        component_data = report.values('component').annotate(
            total_production_weight_kg=Sum(
                Case(
                    When(setup='II', then=F('production_weight_kg')),
                    When(setup='Broch', then=F('production_weight_kg')),
                    default=0
                )
            )
        ).order_by('component')

        customer_data = report.values('operator').annotate(
            total_production_weight_kg=Sum(
                Case(
                    When(setup='II', then=F('production_weight_kg')),
                    When(setup='Broch', then=F('production_weight_kg')),
                    default=0
                )
            )
        ).order_by('operator')

        line_data = report.values('inspector').annotate(
            total_production_weight_kg=Sum(
                Case(
                    When(setup='II', then=F('production_weight_kg')),
                    When(setup='Broch', then=F('production_weight_kg')),
                    default=0
                )
            )
        ).order_by('inspector')

        # Convert production_weight_kg to tons
        component_data = [{'component': item['component'], 'production_weight_ton': item['total_production_weight_kg'] } for item in component_data]
        customer_data = [{'operator': item['operator'], 'production_weight_ton': item['total_production_weight_kg'] } for item in customer_data]
        line_data = [{'inspector': item['inspector'], 'production_weight_ton': item['total_production_weight_kg'] } for item in line_data]

        # Prepare all data for table
        table_data = list(report.values())

        return Response({
            'total_production': total_production,
            'total_rejection': total_rejection,
            'rejection_percentage': total_rejection_percentage,
            'production_weight_kg': total_rework,
            'component_data': component_data,
            'customer_data': customer_data,
            'line_data': line_data,
            'table_data': table_data  # Include all fields for the table
        })

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# Create similar views for Year, Week, Customer, Component, and Line reports
class SuggestionView(APIView):
    def get(self, request):
        search_query = request.GET.get('value', '')  # The search input from the user
        search_type = request.GET.get('type', '')    # The type (line, customer, batch_number, component)

        if not search_query or not search_type:
            return Response([], status=status.HTTP_400_BAD_REQUEST)

        # Fetch suggestions based on the 'type' and 'value'
        if search_type == 'line':
            # Query Forging model to filter lines containing the search query
            suggestions = machining.objects.filter(line__icontains=search_query).values('line').distinct()
            return Response([entry['line'] for entry in suggestions])

        elif search_type == 'customer':
            # Query Forging model to filter customers containing the search query
            suggestions = machining.objects.filter(customer__icontains=search_query).values('customer').distinct()
            return Response([entry['customer'] for entry in suggestions])

        elif search_type == 'batch_number':
            # Query Forging model to filter batch numbers containing the search query
            suggestions = machining.objects.filter(batch_number__icontains=search_query).values('batch_number').distinct()
            return Response([entry['batch_number'] for entry in suggestions])

        elif search_type == 'component':
            # Query Forging model to filter components containing the search query
            suggestions = machining.objects.filter(component__icontains=search_query).values('component').distinct()
            return Response([entry['component'] for entry in suggestions])

        # If no valid search_type is provided, return a 400 error
        return Response([], status=status.HTTP_400_BAD_REQUEST)
    
from django.http import JsonResponse
from django_pandas.io import read_frame

def balance_for_target_autofill():
    # Fetch all data from the Forging model
    batch_tracking = machining.objects.all()
    
    # Convert queryset to DataFrame
    df_bt = read_frame(batch_tracking)
    
    # Extract relevant columns
    df_bt_extracted = df_bt[['batch_number','cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 
                  'cnc_dent', 'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 
                  'forging_dent', 'pre_mc_height', 'pre_mc_od', 'pre_mc_bore','production','setup']]
    
    # Step 1: Add the new column 'total_production' by summing the specified columns
    df_bt_extracted['total_production'] = df_bt_extracted[[ 'cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 
                  'cnc_dent', 'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 
                  'forging_dent', 'pre_mc_height', 'pre_mc_od', 'pre_mc_bore','production']].sum(axis=1)
    
    def conditional_production(x):
        if 'II' in df_bt_extracted.loc[x.index, 'setup'].values:
            return x[df_bt_extracted.loc[x.index, 'setup'] == 'II'].sum()
        elif 'Broch' in df_bt_extracted.loc[x.index, 'setup'].values:
            return x[df_bt_extracted.loc[x.index, 'setup'] == 'Broch'].sum()
        elif 'Drill' in df_bt_extracted.loc[x.index, 'setup'].values:
            return x[df_bt_extracted.loc[x.index, 'setup'] == 'Drill'].sum()
        elif 'Rough' in df_bt_extracted.loc[x.index, 'setup'].values:
            return x[df_bt_extracted.loc[x.index, 'setup'] == 'Rough'].sum()
        elif 'I' in df_bt_extracted.loc[x.index, 'setup'].values:
            return x[df_bt_extracted.loc[x.index, 'setup'] == 'I'].sum()
        else:
            return 0

    # Group by 'batch_number' and apply the conditional production logic
    df_total_production = df_bt_extracted.groupby('batch_number')['total_production'].apply(conditional_production).reset_index()
    
    # Convert the DataFrame to a list of dictionaries for easier filtering
    return df_total_production.to_dict(orient='records')

def get_target_details7(request):
    # Get the batch number from the request
    batch_no = request.GET.get('batch_no', '').strip()
    
    # If batch_no is empty, return an error
    if not batch_no:
        return JsonResponse({'error': 'No batch number provided'}, status=400)
    
    # Get the processed data from the balance_for_target_autofill function
    preprocessed_data = balance_for_target_autofill()
    
    # Find the matching batch number in the preprocessed data
    matching_part = next((part for part in preprocessed_data if part['batch_number'] == batch_no), None)
    
    # If a match is found, return the total production for that batch, otherwise return 0
    if matching_part:
        data = {
            'total_production': matching_part['total_production'],
        }
    else:
        data = {
            'total_production': 0  # Return 0 if no matching batch is found
        }
    
    return JsonResponse(data)



from rest_framework import viewsets
from .serializers import MachiningSerializer
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10  # Number of items per page
    page_size_query_param = 'page_size'
    max_page_size = 100

from django_filters import rest_framework as filters
from rest_framework import viewsets

class MachiningFilter(filters.FilterSet):
    date = filters.CharFilter(field_name="date", lookup_expr="icontains")
    batch_number = filters.CharFilter(field_name="batch_number", lookup_expr="icontains")
    shift = filters.CharFilter(field_name="shift", lookup_expr="icontains")
    component = filters.CharFilter(field_name="component", lookup_expr="icontains")
    verified_by = filters.CharFilter(field_name="verified_by", lookup_expr="icontains")

    class Meta:
        model = machining
        fields = ["date", "batch_number", "shift", "component", "verified_by"]

class MachiningViewSet(viewsets.ModelViewSet):
    queryset = machining.objects.all()
    serializer_class = MachiningSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = MachiningFilter

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.core.exceptions import ValidationError

import logging
logger = logging.getLogger(__name__)
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import logging
from rest_framework.parsers import MultiPartParser, FormParser

logger = logging.getLogger(__name__)

class BulkAddCncAPIView(APIView):
    """
    API endpoint to add multiple HeatTreatment records in bulk.
    """

    def post(self, request, *args, **kwargs):
        # Log the received data
        logger.info("Received request to bulk add HeatTreatment records.")
        logger.debug(f"Request data: {request.data}")

        data = request.data  # Expecting a list of dictionaries

        if not isinstance(data, list):
            logger.error("Request data is not a list.")
            return Response({"error": "Expected a list of dictionaries."}, status=status.HTTP_400_BAD_REQUEST)

        invalid_entries = []
        valid_entries = []

        for i, entry in enumerate(data):
            logger.debug(f"Processing entry {i}: {entry}")

            required_fields = [
                "batch_number", "date", "shift", "component", "machine_no", "mc_type",
                "operator", "inspector","setup", "target","target1","production", "remark", "cnc_height",
                "cnc_od","cnc_bore","cnc_groove","cnc_dent","forging_height","forging_od","forging_bore","forging_crack","forging_dent",
                "pre_mc_height", "pre_mc_od", "pre_mc_bore", "rework_height", "rework_od", "rework_bore","rework_groove","rework_dent", "heat_no", 
                "total_produced", "verified_by"
            ]

            # Check for missing fields
            missing_fields = [field for field in required_fields if field not in entry]
            if missing_fields:
                logger.warning(f"Entry {i} is missing required fields: {missing_fields}")
                invalid_entries.append({"index": i, "missing_fields": missing_fields})
                continue


            # Validate data types and constraints
            try:
                logger.debug(f"Validating entry {i}...")
                obj = machining(**entry)
                obj.full_clean()  # Validate using Django's model validation
                valid_entries.append(obj)
                logger.debug(f"Entry {i} validated successfully.")
            except ValidationError as e:
                logger.error(f"Validation error for entry {i}: {str(e)}")
                invalid_entries.append({"index": i, "error": str(e)})
            except Exception as e:
                logger.error(f"Unexpected error for entry {i}: {str(e)}")
                invalid_entries.append({"index": i, "error": str(e)})

        if invalid_entries:
            logger.error(f"Invalid entries found: {invalid_entries}")
            return Response(
                {"error": "Invalid entries found.", "details": invalid_entries},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                logger.info(f"Attempting to bulk create {len(valid_entries)} HeatTreatment records.")
                machining.objects.bulk_create(valid_entries)
                logger.info("Bulk creation successful.")
            return Response(
                {"message": "Bulk data added successfully.", "processed": len(valid_entries)},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.critical(f"Critical error during bulk creation: {str(e)}")
            return Response(
                {"error": "An error occurred while adding data.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



from heat_treatment.models import HeatTreatment
import pandas as pd
from fi.models import Fi

def balance_after_hold_material_use_autofill():
    # Step 1: Read the data from the Django models into pandas DataFrames
    blockmt_df = pd.DataFrame(list(machining.objects.all().values()))
    batch_tracking_df = pd.DataFrame(list(Fi.objects.all().values()))

    # Step 2: Group BatchTracking by block_mt_id and sum the kg_qty
    batch_tracking_grouped = batch_tracking_df.groupby('batch_number', as_index=False)['production'].sum()

    grouped_blockmt_df = (
        blockmt_df.groupby('batch_number', as_index=False)
        .agg({
                 # Take the first block_mt_id
                 'component': 'first', 
            'production': 'sum',          # Sum the production
            'heat_no': 'first',    # Replace with actual field names
            # Add other fields as needed
        })
    )


    # Step 3: Merge the grouped BatchTracking data with Blockmt on block_mt_id
    merged_df = pd.merge(grouped_blockmt_df, batch_tracking_grouped, on='batch_number', how='left')
    

    # Convert 'weight' to float to match the type of 'kg_qty'
    merged_df['remaining'] = merged_df['production_x'].astype(float) - merged_df['production_y'].fillna(0).astype(float)


    # Step 4: Calculate the remaining weight
    merged_df['remaining'] = merged_df['production_x'] - merged_df['production_y'].fillna(0)

    # Step 5: Convert the result to a dictionary
    result_dict = merged_df.to_dict(orient='records')

    return result_dict

def autocompletecnc(request):
    if 'batch_number' in request.GET:
        term = request.GET.get('batch_number').strip().lower()  # Convert the search term to lowercase and trim spaces

        # Get the preprocessed data
        preprocessed_data = balance_after_hold_material_use_autofill()

        # Filter the data based on the term
        components = [
            part['batch_number']
            for part in preprocessed_data
            if term in part['batch_number'].strip().lower()
        ]

        # Remove duplicates and sort the list
        unique_components = sorted(set(components))

        return JsonResponse(unique_components, safe=False)
    return JsonResponse([], safe=False)  # Return an empty list if no term is provided

def get_part_detailscnc(request):
    block_mt_id = request.GET.get('batch_number', '').strip().lower()

    # Get the preprocessed data from the balance_after_hold_material_use_autofill function
    preprocessed_data = balance_after_hold_material_use_autofill()

    # Find the matching part in the preprocessed data
    matching_part = next(
        (part for part in preprocessed_data if part['batch_number'].strip().lower() == block_mt_id),
        None
    )

    if matching_part:
        data = {
            'component': matching_part['component'],
            'heatno': matching_part['heat_no'],
            'pices': matching_part['production_x'],
        }
        return JsonResponse(data)
    else:
        return JsonResponse({'error': 'No matching part found'}, status=404)

from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Cncplanning

# Serializer for Cncplanning model
class CncplanningSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cncplanning
        fields = '__all__'
        read_only_fields = ('Cnc_uid',)  # Make Cnc_uid read-only

# ViewSet for Cncplanning
class CncplanningViewSet(viewsets.ViewSet):
    
    def list(self, request):
        """Retrieve all Cncplanning records."""
        queryset = Cncplanning.objects.all()
        serializer = CncplanningSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create a new Cncplanning record."""
        serializer = CncplanningSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()  # Save the instance
            return Response({
                "success": True,
                "message": "Cncplanning entry created successfully.",
                "Cnc_uid": instance.Cnc_uid
            }, status=status.HTTP_201_CREATED)
        # Log the validation errors
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, pk=None):
        """Retrieve a specific Cncplanning record by ID."""
        instance = get_object_or_404(Cncplanning, pk=pk)
        serializer = CncplanningSerializer(instance)
        return Response(serializer.data)

    def update(self, request, pk=None):
        """Update a specific Cncplanning record by ID."""
        instance = get_object_or_404(Cncplanning, pk=pk)
        serializer = CncplanningSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "Cncplanning entry updated successfully.",
                "Cnc_uid": instance.Cnc_uid
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete a specific Cncplanning record by ID."""
        instance = get_object_or_404(Cncplanning, pk=pk)
        instance.delete()
        return Response({
            "success": True,
            "message": "Cncplanning entry deleted successfully."
        }, status=status.HTTP_204_NO_CONTENT)


from datetime import datetime
from django.db.models import Sum
from django.http import JsonResponse
def get_available_cnc_lines(request):
    # Get the start and end dates from query parameters
    Target_start_date = request.GET.get('start_date')
    Target_End_date = request.GET.get('end_date')
    
    try:
        start_date = datetime.strptime(Target_start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(Target_End_date, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({"error": "Invalid date format"}, status=400)

    # Ensure the end date is the end of the day, so we can include all of that day
    end_date = datetime.combine(end_date, datetime.max.time()).date()

    # Group the data by cnc_line and sum the required cycle times for the date range
    cnc_lines_data = (
        Cncplanning.objects.filter(
            Target_start_date__lte=end_date, Target_End_date__gte=start_date
        )
        .values('cnc_line')
        .annotate(total_required_cycle_time=Sum('required_cycle_time'))
        .order_by('cnc_line')
    )

    # Define capacity for each line
    cnc_line_capacity = {
        'Line-1': 1728000,
        'Line-2': 1536000,
        'Line-3': 1824000,
        'Basement': 1152000,
        'New Plant': 960000,
        'Robot': 192000,
        'VMC': 576000,
        'Broch': 192000,
    }
  


    # Create a dictionary to store the total required cycle time for each line
    booked_cycle_times = {line['cnc_line']: line['total_required_cycle_time'] for line in cnc_lines_data}

    # Initialize the available_lines list with full capacity for all lines
    available_lines = []
    for line, capacity in cnc_line_capacity.items():
        # If no booking is found for the line, consider full capacity available
        total_required_cycle_time = booked_cycle_times.get(line, 0)
        remaining_cycle_time = capacity - total_required_cycle_time
        
        # Add the line's remaining cycle time to the list
        available_lines.append({
            "cnc_line": line,
            "remaining_cycle_time": remaining_cycle_time
        })

    print(available_lines)

    return JsonResponse({'available_lines': available_lines})

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cncplanning
from django.db.models import Sum
from datetime import datetime

class CncCycleTimeView(APIView):
    def get(self, request):
        start_date_str = request.query_params.get('start_date', None)
        end_date_str = request.query_params.get('end_date', None)

        if not start_date_str or not end_date_str:
            return Response({"error": "Please provide both 'start_date' and 'end_date' parameters."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use 'YYYY-MM-DD'."}, status=status.HTTP_400_BAD_REQUEST)

        # Query to filter the data within the date range and aggregate the required cycle time by line, cell, and machine number
        filtered_data = Cncplanning.objects.filter(
            Target_start_date__gte=start_date,
            Target_End_date__lte=end_date
        ).values('cnc_line', 'cell', 'machine_no').annotate(
            total_required_cycle_time=Sum('required_cycle_time'),
            total_machine_cycle_time=Sum('machine_cycle_time')
        )

        return Response(filtered_data, status=status.HTTP_200_OK)
    



from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Cnc_line_master, LineHistory
from .serializers import LineSerializer, LineHistorySerializer

# Create & List Complaints
class ComplaintListCreateView(generics.ListCreateAPIView):
    queryset = Cnc_line_master.objects.all().order_by('-created_at')
    serializer_class = LineSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        if not serializer.is_valid():
            print("Validation Errors:", serializer.errors)  # Log validation errors
        serializer.save(created_by=self.request.user)



# Retrieve & Update Complaint
class ComplaintDetailView(generics.RetrieveUpdateAPIView):
    queryset = Cnc_line_master.objects.all()
    serializer_class = LineSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_update(self, serializer):
        complaint = self.get_object()
        updated_data = serializer.validated_data

        # Log changes in ComplaintHistory
        for field, new_value in updated_data.items():
            old_value = getattr(complaint, field)
            if old_value != new_value:
                LineHistory.objects.create(
                    complaint=complaint,
                    changed_by=self.request.user,
                    field_changed=field,
                    old_value=str(old_value),
                    new_value=str(new_value),
                )

        serializer.save()

# Get Complaint History
# Get Complaint History
class ComplaintHistoryView(generics.ListAPIView):
    serializer_class = LineHistorySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        complaint_id = self.kwargs['id']

        # Use select_related to fetch related user data in a single query
        queryset = LineHistory.objects.filter(complaint_id=complaint_id).select_related('changed_by').order_by('-changed_at')

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



from forging.models import Forging
from django.db.models import Sum, F, ExpressionWrapper, FloatField, Value, IntegerField
from django.db.models.functions import TruncMonth
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime,date
from .models import machining  # Ensure your model is correctly imported
from django.utils import timezone
from visual.models import Visual
from django.db.models.functions import Coalesce
class MonthlyProductionAPIView(APIView):
   def get(self, request):
        # Get the financial year from the query parameters, default to current FY
        fy_year = request.query_params.get('fy_year', None)
        
        if not fy_year:
            # Default to current financial year (assuming April to March)
            today = timezone.now().date()
            if today.month >= 4:
                fy_year = today.year
            else:
                fy_year = today.year - 1
        
        # Define the start and end dates for the financial year
        start_date = datetime(fy_year, 4, 1).date()
        end_date = datetime(fy_year + 1, 3, 31).date()
        
        # Filter data for the given financial year
        machining_data = machining.objects.filter(date__range=(start_date, end_date), setup='II')
        fi_data = Fi.objects.filter(date__range=(start_date, end_date))
        visual_data = Visual.objects.filter(date__range=(start_date, end_date))
        
        # Aggregate production and rejection data
        response_data = []
        
        for month in range(1, 13):
            month_start = datetime(fy_year, month, 1).date()
            month_end = datetime(fy_year, month + 1, 1).date() if month < 12 else datetime(fy_year + 1, 1, 1).date()
            
            # Filter data for the month
            machining_month_data = machining_data.filter(date__range=(month_start, month_end))
            fi_month_data = fi_data.filter(date__range=(month_start, month_end))
            visual_month_data = visual_data.filter(date__range=(month_start, month_end))
            
            # Calculate total production using Coalesce to handle None values
            total_production = machining_month_data.filter(setup='II').aggregate(
                    total=Coalesce(Sum('production'), 0)
                )['total']
            
            
            
            # Calculate CNC rejection details
            cnc_rejection = (
                machining_month_data.aggregate(total=Coalesce(Sum(
                    F('cnc_height') + F('cnc_od') + F('cnc_bore') + F('cnc_groove') + F('cnc_dent')
                ), 0))['total'] +
                fi_month_data.aggregate(total=Coalesce(Sum(
                    F('cnc_height') + F('cnc_od') + F('cnc_bore') + F('cnc_groove') + F('cnc_dent')
                ), 0))['total'] +
                visual_month_data.aggregate(total=Coalesce(Sum(
                    F('cnc_height') + F('cnc_od') + F('cnc_bore') + F('cnc_groove') + F('cnc_dent')
                ), 0))['total']
            )
            cnc_rejection_ppm = (cnc_rejection / total_production) * 1_000_000 if total_production else 0
            cnc_rejection_percent = (cnc_rejection / total_production) * 100 if total_production else 0
            
            # Calculate Forging rejection details
            forging_rejection = (
                machining_month_data.aggregate(total=Coalesce(Sum(
                    F('forging_height') + F('forging_od') + F('forging_bore') + F('forging_crack') + F('forging_dent')
                ), 0))['total'] +
                fi_month_data.aggregate(total=Coalesce(Sum(
                    F('forging_height') + F('forging_od') + F('forging_bore') + F('forging_crack') + F('forging_dent')
                ), 0))['total'] +
                visual_month_data.aggregate(total=Coalesce(Sum(
                    F('forging_height') + F('forging_od') + F('forging_bore') + F('forging_crack') + F('forging_dent')
                ), 0))['total']
            )
            forging_rejection_ppm = (forging_rejection / total_production) * 1_000_000 if total_production else 0
            forging_rejection_percent = (forging_rejection / total_production) * 100 if total_production else 0
            
            # Calculate Pre-MC rejection details
            premc_rejection = (
                machining_month_data.aggregate(total=Coalesce(Sum(
                    F('pre_mc_height') + F('pre_mc_od') + F('pre_mc_bore')
                ), 0))['total'] +
                fi_month_data.aggregate(total=Coalesce(Sum(
                    F('pre_mc_height') + F('pre_mc_od') + F('pre_mc_bore')
                ), 0))['total'] +
                visual_month_data.aggregate(total=Coalesce(Sum(
                    F('pre_mc_height') + F('pre_mc_od') + F('pre_mc_bore')
                ), 0))['total']
            )
            premc_rejection_ppm = (premc_rejection / total_production) * 1_000_000 if total_production else 0
            premc_rejection_percent = (premc_rejection / total_production) * 100 if total_production else 0


            # Calculate total rejection using Coalesce to handle None values
            total_rejection = cnc_rejection+forging_rejection+premc_rejection
            
            # Append the data for the month
            response_data.append({
                'month_year': f"{month}-{fy_year}",
                'total_production': total_production,
                'total_rejection': total_rejection,
                'cnc_rejection': cnc_rejection,
                'cnc_rejection_ppm': cnc_rejection_ppm,
                'cnc_rejection_percent': cnc_rejection_percent,
                'forging_rejection': forging_rejection,
                'forging_rejection_ppm': forging_rejection_ppm,
                'forging_rejection_percent': forging_rejection_percent,
                'premc_rejection': premc_rejection,
                'premc_rejection_ppm': premc_rejection_ppm,
                'premc_rejection_percent': premc_rejection_percent,
            })
        
        return JsonResponse(response_data, safe=False)

from raw_material.models import Masterlist
from collections import defaultdict


def get_fy_trends(request, year=None):
    if not year:
        year = datetime.now().year
    else:
        year = int(year)

    # Define the fiscal year range (assuming FY starts in April)
    fy_start_month = 4
    if datetime.now().month >= fy_start_month:
        fy_start_date = date(year, fy_start_month, 1)
        fy_end_date = date(year + 1, fy_start_month - 1, 31)
    else:
        fy_start_date = date(year - 1, fy_start_month, 1)
        fy_end_date = date(year, fy_start_month - 1, 31)

    # Fetch Masterlist for cost calculation
    masterlist = {item.component: item.cost for item in Masterlist.objects.all()}

    # Initialize data structure for all months in the fiscal year
    monthly_data = defaultdict(lambda: {
        "forging": {"total_production": 0, "total_rejection": 0, "rejection_cost": 0},
        "cnc": {"total_production": 0, "total_rejection": 0, "rejection_cost": 0},
        "pre_mc": {"total_production": 0, "total_rejection": 0, "rejection_cost": 0},
        "overall": {"total_production": 0, "total_rejection": 0, "rejection_cost": 0}
    })

    # Helper function to calculate rejection cost
    def calculate_rejection_cost(component, rejection_count):
        return masterlist.get(component, 0) * rejection_count

    # Process Forging Data
    forging_data = Forging.objects.filter(date__range=(fy_start_date, fy_end_date))
    for entry in forging_data:
        month_year = entry.date.strftime("%m-%Y")
        # Forging Production
        monthly_data[month_year]["forging"]["total_production"] += entry.production
        # Forging Rejection (from Forging model)
        forging_rejection = (
            entry.up_setting + entry.half_piercing + entry.full_piercing +
            entry.ring_rolling + entry.sizing + entry.overheat + entry.bar_crack_pcs
        )
        monthly_data[month_year]["forging"]["total_rejection"] += forging_rejection
        monthly_data[month_year]["forging"]["rejection_cost"] += calculate_rejection_cost(entry.component, forging_rejection)

    # Process Machining Data (CNC and Pre-MC)
    machining_data = machining.objects.filter(date__range=(fy_start_date, fy_end_date))
    for entry in machining_data:
        month_year = entry.date.strftime("%m-%Y")
        # CNC Rejection
        cnc_rejection = (
            entry.cnc_height + entry.cnc_od + entry.cnc_bore +
            entry.cnc_groove + entry.cnc_dent
        )
        if entry.setup == "II":
            monthly_data[month_year]["cnc"]["total_production"] += entry.production
        monthly_data[month_year]["cnc"]["total_rejection"] += cnc_rejection
        monthly_data[month_year]["cnc"]["rejection_cost"] += calculate_rejection_cost(entry.component, cnc_rejection)
        # Pre-MC Rejection
        pre_mc_rejection = (
            entry.pre_mc_height + entry.pre_mc_od + entry.pre_mc_bore
        )
        if entry.setup == "II":
            monthly_data[month_year]["pre_mc"]["total_production"] += entry.production
        monthly_data[month_year]["pre_mc"]["total_rejection"] += pre_mc_rejection
        monthly_data[month_year]["pre_mc"]["rejection_cost"] += calculate_rejection_cost(entry.component, pre_mc_rejection)
        # Forging Rejection (from Machining model)
        forging_rejection = (
            entry.forging_height + entry.forging_od + entry.forging_bore +
            entry.forging_crack + entry.forging_dent
        )
        monthly_data[month_year]["forging"]["total_rejection"] += forging_rejection
        monthly_data[month_year]["forging"]["rejection_cost"] += calculate_rejection_cost(entry.component, forging_rejection)

    # Process Fi Data
    fi_data = Fi.objects.filter(date__range=(fy_start_date, fy_end_date))
    for entry in fi_data:
        month_year = entry.date.strftime("%m-%Y")
        # CNC Rejection
        cnc_rejection = (
            entry.cnc_height + entry.cnc_od + entry.cnc_bore +
            entry.cnc_groove + entry.cnc_dent
        )
        monthly_data[month_year]["cnc"]["total_rejection"] += cnc_rejection
        monthly_data[month_year]["cnc"]["rejection_cost"] += calculate_rejection_cost(entry.component, cnc_rejection)
        # Pre-MC Rejection
        pre_mc_rejection = (
            entry.pre_mc_height + entry.pre_mc_od + entry.pre_mc_bore
        )
        monthly_data[month_year]["pre_mc"]["total_rejection"] += pre_mc_rejection
        monthly_data[month_year]["pre_mc"]["rejection_cost"] += calculate_rejection_cost(entry.component, pre_mc_rejection)
        # Forging Rejection (from Fi model)
        forging_rejection = (
            entry.forging_height + entry.forging_od + entry.forging_bore +
            entry.forging_crack + entry.forging_dent
        )
        monthly_data[month_year]["forging"]["total_rejection"] += forging_rejection
        monthly_data[month_year]["forging"]["rejection_cost"] += calculate_rejection_cost(entry.component, forging_rejection)

    # Process Visual Data
    visual_data = Visual.objects.filter(date__range=(fy_start_date, fy_end_date))
    for entry in visual_data:
        month_year = entry.date.strftime("%m-%Y")
        # CNC Rejection
        cnc_rejection = (
            entry.cnc_height + entry.cnc_od + entry.cnc_bore +
            entry.cnc_groove + entry.cnc_dent
        )
        monthly_data[month_year]["cnc"]["total_rejection"] += cnc_rejection
        monthly_data[month_year]["cnc"]["rejection_cost"] += calculate_rejection_cost(entry.component, cnc_rejection)
        # Pre-MC Rejection
        pre_mc_rejection = (
            entry.pre_mc_height + entry.pre_mc_od + entry.pre_mc_bore
        )
        monthly_data[month_year]["pre_mc"]["total_rejection"] += pre_mc_rejection
        monthly_data[month_year]["pre_mc"]["rejection_cost"] += calculate_rejection_cost(entry.component, pre_mc_rejection)
        # Forging Rejection (from Visual model)
        forging_rejection = (
            entry.forging_height + entry.forging_od + entry.forging_bore +
            entry.forging_crack + entry.forging_dent
        )
        monthly_data[month_year]["forging"]["total_rejection"] += forging_rejection
        monthly_data[month_year]["forging"]["rejection_cost"] += calculate_rejection_cost(entry.component, forging_rejection)

    # Calculate Overall Metrics
    for month_year, data in monthly_data.items():
        data["overall"]["total_production"] = data["forging"]["total_production"]
        data["overall"]["total_rejection"] = (
            data["forging"]["total_rejection"] +
            data["cnc"]["total_rejection"] +
            data["pre_mc"]["total_rejection"]
        )
        data["overall"]["rejection_cost"] = (
            data["forging"]["rejection_cost"] +
            data["cnc"]["rejection_cost"] +
            data["pre_mc"]["rejection_cost"]
        )

    # Calculate Rejection Percentage
    for month_year, data in monthly_data.items():
        for category in ["forging", "cnc", "pre_mc", "overall"]:
            total_production = data[category]["total_production"]
            total_rejection = data[category]["total_rejection"]
            data[category]["rejection_percentage"] = (total_rejection / total_production * 100) if total_production else 0

    # Prepare Final Response
    response_data = []
    current_date = fy_start_date
    while current_date <= fy_end_date:
        month_year = current_date.strftime("%m-%Y")
        data = monthly_data.get(month_year, {
            "forging": {"total_production": 0, "total_rejection": 0, "rejection_cost": 0, "rejection_percentage": 0},
            "cnc": {"total_production": 0, "total_rejection": 0, "rejection_cost": 0, "rejection_percentage": 0},
            "pre_mc": {"total_production": 0, "total_rejection": 0, "rejection_cost": 0, "rejection_percentage": 0},
            "overall": {"total_production": 0, "total_rejection": 0, "rejection_cost": 0, "rejection_percentage": 0}
        })
        response_data.append({
            "month_year": month_year,
            "forging": data["forging"],
            "cnc": data["cnc"],
            "pre_mc": data["pre_mc"],
            "overall": data["overall"]
        })
        # Move to the next month
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)

    return JsonResponse(response_data, safe=False)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
import pandas as pd


class MergedSheetAPI(APIView):
    def get(self, request):
        # Get query parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Convert string dates to datetime objects
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

        # Default to yesterday if no date range is provided
        if not start_date:
            start_date = datetime.now() - timedelta(days=1)
        if not end_date:
            end_date = start_date

        # Fetch data from all three models within the date range
        machining_data = machining.objects.filter(date__range=[start_date, end_date])
        visual_data = Visual.objects.filter(date__range=[start_date, end_date])
        fi_data = Fi.objects.filter(date__range=[start_date, end_date])

        # Convert querysets to DataFrames
        machining_df = pd.DataFrame(list(machining_data.values()))
        visual_df = pd.DataFrame(list(visual_data.values()))
        fi_df = pd.DataFrame(list(fi_data.values()))

        # Debugging: Print columns
        print("Machining Columns:", machining_df.columns)
        print("Visual Columns:", visual_df.columns)
        print("Fi Columns:", fi_df.columns)

        # Ensure all DataFrames have the required columns
        required_columns = ['component', 'shift']
        for df in [machining_df, visual_df, fi_df]:
            for col in required_columns:
                if col not in df.columns:
                    df[col] = None  # or df[col] = 0, depending on your use case

        # Check for empty DataFrames
        if machining_df.empty or visual_df.empty or fi_df.empty:
            return Response({"error": "No data found for the given date range"}, status=status.HTTP_404_NOT_FOUND)

        # Merge DataFrames on 'component' and 'date'
        merged_df = pd.merge(machining_df, visual_df, on=['component', 'shift'], how='outer', suffixes=('_machining', '_visual'))
        merged_df = pd.merge(merged_df, fi_df, on=['component', 'shift'], how='outer', suffixes=('', '_fi'))

        # Fill NaN values with 0 for production and target
        merged_df['production_machining'] = merged_df['production_machining'].fillna(0)
        merged_df['target_machining'] = merged_df['target_machining'].fillna(0)
        merged_df['production_visual'] = merged_df['production_visual'].fillna(0)
        merged_df['target_visual'] = merged_df['target_visual'].fillna(0)
        merged_df['production'] = merged_df['production'].fillna(0)
        merged_df['target'] = merged_df['target'].fillna(0)

        # Calculate total production and target
        merged_df['total_production'] = merged_df['production_machining'] + merged_df['production_visual'] + merged_df['production']
        merged_df['total_target'] = merged_df['target_machining'] + merged_df['target_visual'] + merged_df['target']

        # Calculate rejection reasons and percentages
        rejection_columns = ['cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 'cnc_dent',
                            'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 'forging_dent',
                            'pre_mc_height', 'pre_mc_od', 'pre_mc_bore']

        for col in rejection_columns:
            merged_df[col] = merged_df[col + '_machining'].fillna(0) + merged_df[col + '_visual'].fillna(0) + merged_df[col].fillna(0)
            merged_df[col + '_percent'] = (merged_df[col] / merged_df['total_production']) * 100

        # Calculate total rejection and percentage
        merged_df['total_rejection'] = merged_df[rejection_columns].sum(axis=1)
        merged_df['total_rejection_percent'] = (merged_df['total_rejection'] / merged_df['total_production']) * 100

        # Select and order the final columns
        final_columns = ['component', 'shift', 'total_production', 'total_target',
                        'cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 'cnc_dent',
                        'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 'forging_dent',
                        'pre_mc_height', 'pre_mc_od', 'pre_mc_bore',
                        'total_rejection', 'total_rejection_percent']

        final_df = merged_df[final_columns]

        # Convert DataFrame to JSON
        result = final_df.to_dict(orient='records')

        return Response(result, status=status.HTTP_200_OK)