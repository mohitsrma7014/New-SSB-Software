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

class MachiningViewSet(viewsets.ModelViewSet):
    queryset = machining.objects.all()
    serializer_class = MachiningSerializer


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
