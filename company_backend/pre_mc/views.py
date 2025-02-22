from rest_framework.views import APIView
from rest_framework.response import Response
from .models import pre_mc
from django.db.models import Sum, F, Q
from datetime import datetime
from django.db.models import ExpressionWrapper, FloatField
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
        shop_floor = request.query_params.get('line')

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
        if shop_floor:
            filters &= Q(shop_floor=shop_floor)
       

        # Apply filters
        report = pre_mc.objects.filter(filters)

        # Annotate with the total production weight (production * ringweight)
        report = report.annotate(
            production_weight_kg=F('qty'),
        )

        # Calculate total production and unique unit sum per day
        total_production = report.aggregate(Sum('qty'))['qty__sum'] or 0

                

        # Aggregate by component, customer, and line
        component_data = report.values('component').annotate(
            total_production_weight_kg=Sum('qty')
        ).order_by('component')

        customer_data = report.values('customer').annotate(
            total_production_weight_kg=Sum('qty')
        ).order_by('customer')

        line_data = report.values('shop_floor').annotate(
            total_production_weight_kg=Sum('qty')
        ).order_by('shop_floor')
            

        # Convert production_weight_kg to tons
        component_data = [{'component': item['component'], 'production_weight_ton': item['total_production_weight_kg'] } for item in component_data]
        customer_data = [{'customer': item['customer'], 'production_weight_ton': item['total_production_weight_kg'] } for item in customer_data]
        line_data = [{'shop_floor': item['shop_floor'], 'production_weight_ton': item['total_production_weight_kg'] } for item in line_data]
        # Prepare all data for table
        table_data = list(report.values())

        return Response({
            'total_production': total_production,

            'component_data': component_data,
            'customer_data': customer_data,
            'line_data': line_data,  # Line data with cost per kg
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
            suggestions = pre_mc.objects.filter(shop_floor__icontains=search_query).values('shop_floor').distinct()
            return Response([entry['shop_floor'] for entry in suggestions])

        elif search_type == 'customer':
            # Query Forging model to filter customers containing the search query
            suggestions = pre_mc.objects.filter(customer__icontains=search_query).values('customer').distinct()
            return Response([entry['customer'] for entry in suggestions])

        elif search_type == 'batch_number':
            # Query Forging model to filter batch numbers containing the search query
            suggestions = pre_mc.objects.filter(batch_number__icontains=search_query).values('batch_number').distinct()
            return Response([entry['batch_number'] for entry in suggestions])

        elif search_type == 'component':
            # Query Forging model to filter components containing the search query
            suggestions = pre_mc.objects.filter(component__icontains=search_query).values('component').distinct()
            return Response([entry['component'] for entry in suggestions])

        # If no valid search_type is provided, return a 400 error
        return Response([], status=status.HTTP_400_BAD_REQUEST)
    

from rest_framework import viewsets
from .serializers import pre_mcSerializer

class Pre_Mc_ViewSet(viewsets.ModelViewSet):
    queryset = pre_mc.objects.all()  # Use the model here
    serializer_class = pre_mcSerializer


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
import logging
logger = logging.getLogger(__name__)

class BulkAddpre_mcAPIView(APIView):
    """
    API endpoint to add multiple Forging records in bulk.
    """

    def post(self, request, *args, **kwargs):
       
        data = request.data  # Expecting a list of dictionaries

        if not isinstance(data, list):
            return Response({"error": "Expected a list of dictionaries."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate each entry in the list
        invalid_entries = []
        for i, entry in enumerate(data):
            if not isinstance(entry, dict):
                invalid_entries.append({"index": i, "error": "Entry is not a dictionary."})
            required_fields = [
                "batch_number", "date", "heat_no", "component", "customer", "qty",
                "shop_floor", "target", "total_produced","verified_by"
            ]
            missing_fields = [field for field in required_fields if field not in entry]
            if missing_fields:
                invalid_entries.append({"index": i, "missing_fields": missing_fields})

        if invalid_entries:
            return Response({"error": "Invalid entries found.", "details": invalid_entries}, status=status.HTTP_400_BAD_REQUEST)

        # Try creating all entries in a single transaction
        try:
            with transaction.atomic():
                forging_objects = [pre_mc(**entry) for entry in data]
                pre_mc.objects.bulk_create(forging_objects)
            return Response({"message": "Bulk data added successfully."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": "An error occurred while adding data.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

from django.http import JsonResponse
from django_pandas.io import read_frame
from .models import pre_mc

def balance_for_target_autofill():
    # Fetch all data from the Forging model
    batch_tracking = pre_mc.objects.all()
    
    # Convert queryset to DataFrame
    df_bt = read_frame(batch_tracking)
    
    # Extract relevant columns
    df_bt_extracted = df_bt[['batch_number', 'qty']]
    
    # Step 1: Add the new column 'total_production' by summing the specified columns
    df_bt_extracted['total_production'] = df_bt_extracted[['qty']].sum(axis=1)
    
    # Step 2: Group by 'batch_number' and sum the 'total_production' column
    df_total_production = df_bt_extracted.groupby('batch_number')['total_production'].sum().reset_index()
    
    # Convert the DataFrame to a list of dictionaries for easier filtering
    return df_total_production.to_dict(orient='records')

def get_target_details4(request):
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