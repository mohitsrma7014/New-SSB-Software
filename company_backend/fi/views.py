from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Fi
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
        chaker = request.query_params.get('customer')
        line = request.query_params.get('line')
        batch_id = request.query_params.get('batch_id')

    

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
        if chaker:
            filters &= Q(chaker=chaker)
        if line:
            filters &= Q(line=line)
        if batch_id:
            filters &= Q(batch_id=batch_id)

        # Apply filters
        report = Fi.objects.filter(filters)

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
        total_production = report.aggregate(Sum('production'))['production__sum'] or 0
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
            total_production_weight_kg=Sum('production')
        ).order_by('component')

        customer_data = report.values('chaker').annotate(
            total_production_weight_kg=Sum('production')
        ).order_by('chaker')

        line_data = report.values('shift').annotate(
            total_production_weight_kg=Sum('production')
        ).order_by('shift')

        # Convert production_weight_kg to tons
        component_data = [{'component': item['component'], 'production_weight_ton': item['total_production_weight_kg'] } for item in component_data]
        customer_data = [{'chaker': item['chaker'], 'production_weight_ton': item['total_production_weight_kg'] } for item in customer_data]
        line_data = [{'shift': item['shift'], 'production_weight_ton': item['total_production_weight_kg'] } for item in line_data]

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
            suggestions = Fi.objects.filter(line__icontains=search_query).values('line').distinct()
            return Response([entry['line'] for entry in suggestions])

        elif search_type == 'customer':
            # Query Forging model to filter customers containing the search query
            suggestions = Fi.objects.filter(chaker__icontains=search_query).values('chaker').distinct()
            return Response([entry['chaker'] for entry in suggestions])

        elif search_type == 'batch_number':
            # Query Forging model to filter batch numbers containing the search query
            suggestions = Fi.objects.filter(batch_number__icontains=search_query).values('batch_number').distinct()
            return Response([entry['batch_number'] for entry in suggestions])

        elif search_type == 'component':
            # Query Forging model to filter components containing the search query
            suggestions = Fi.objects.filter(component__icontains=search_query).values('component').distinct()
            return Response([entry['component'] for entry in suggestions])

        # If no valid search_type is provided, return a 400 error
        return Response([], status=status.HTTP_400_BAD_REQUEST)
from django.http import JsonResponse
from django_pandas.io import read_frame

def balance_for_target_autofill():
    # Fetch all data from the Forging model
    batch_tracking = Fi.objects.all()
    
    # Convert queryset to DataFrame
    df_bt = read_frame(batch_tracking)
    
    # Extract relevant columns
    df_bt_extracted = df_bt[['batch_number','cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 
                  'cnc_dent', 'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 
                  'forging_dent', 'pre_mc_height', 'pre_mc_od', 'pre_mc_bore', 'rework_height', 
                  'rework_od', 'rework_bore', 'rework_groove', 'rework_dent','rust','production']]
    
    # Step 1: Add the new column 'total_production' by summing the specified columns
    df_bt_extracted['total_production'] = df_bt_extracted[[ 'cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 
                  'cnc_dent', 'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 
                  'forging_dent', 'pre_mc_height', 'pre_mc_od', 'pre_mc_bore', 'rework_height', 
                  'rework_od', 'rework_bore', 'rework_groove', 'rework_dent','rust','production']].sum(axis=1)
    
    # Step 2: Group by 'batch_number' and sum the 'total_production' column
    df_total_production = df_bt_extracted.groupby('batch_number')['total_production'].sum().reset_index()
    
    # Convert the DataFrame to a list of dictionaries for easier filtering
    return df_total_production.to_dict(orient='records')

def get_target_details6(request):
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
from .serializers import FiSerializer

class FiViewSet(viewsets.ModelViewSet):
    queryset = Fi.objects.all()
    serializer_class = FiSerializer


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

class BulkAddFiAPIView(APIView):
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
                "batch_number", "date", "shift", "component","target1", "target","chaker","production", "remark", "cnc_height",
                "cnc_od","cnc_bore","cnc_groove","cnc_dent","forging_height","forging_od","forging_bore","forging_crack","forging_dent",
                "pre_mc_height", "pre_mc_od", "pre_mc_bore", "rework_height", "rework_od", "rework_bore","rework_groove","rework_dent", "heat_no", 
                "total_produced", "verified_by","rust"
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
                obj = Fi(**entry)
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
                Fi.objects.bulk_create(valid_entries)
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
from django.http import JsonResponse
from django_pandas.io import read_frame
from .models import Fi

def balance_for_target_autofill():
    # Fetch all data from the Forging model
    batch_tracking = Fi.objects.all()
    
    # Convert queryset to DataFrame
    df_bt = read_frame(batch_tracking)
    
    # Extract relevant columns
    df_bt_extracted = df_bt[['batch_number','cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 
                  'cnc_dent', 'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 
                  'forging_dent', 'pre_mc_height', 'pre_mc_od', 'pre_mc_bore', 'rework_height', 
                  'rework_od', 'rework_bore', 'rework_groove', 'rework_dent','rust','production']]
    
    # Step 1: Add the new column 'total_production' by summing the specified columns
    df_bt_extracted['total_production'] = df_bt_extracted[[ 'cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 
                  'cnc_dent', 'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 
                  'forging_dent', 'pre_mc_height', 'pre_mc_od', 'pre_mc_bore', 'rework_height', 
                  'rework_od', 'rework_bore', 'rework_groove', 'rework_dent','rust','production']].sum(axis=1)
    
    # Step 2: Group by 'batch_number' and sum the 'total_production' column
    df_total_production = df_bt_extracted.groupby('batch_number')['total_production'].sum().reset_index()
    
    # Convert the DataFrame to a list of dictionaries for easier filtering
    return df_total_production.to_dict(orient='records')

def get_target_details6(request):
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