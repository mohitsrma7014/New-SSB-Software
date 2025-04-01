from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Forging
from django.db.models import Sum, F
from datetime import datetime
from django.http import JsonResponse
from django_pandas.io import read_frame
from datetime import datetime
from django.db.models import F, Sum, Q
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
        report = Forging.objects.filter(filters)

        # Annotate with the total production weight (production * slug_weight)
        report = report.annotate(
            production_weight_kg=F('production') * F('slug_weight'),
            normalized_customer=Upper(F('customer')),
            normalized_line_incharge=Upper(F('line_incharge')),
            normalized_forman=Upper(F('forman'))
        )

        # Aggregate production and rejection fields
        total_production = report.aggregate(Sum('production'))['production__sum'] or 0
        total_up_setting = report.aggregate(Sum('up_setting'))['up_setting__sum'] or 0
        total_half_piercing = report.aggregate(Sum('half_piercing'))['half_piercing__sum'] or 0
        total_full_piercing = report.aggregate(Sum('full_piercing'))['full_piercing__sum'] or 0
        total_ring_rolling = report.aggregate(Sum('ring_rolling'))['ring_rolling__sum'] or 0
        total_sizing = report.aggregate(Sum('sizing'))['sizing__sum'] or 0
        total_overheat = report.aggregate(Sum('overheat'))['overheat__sum'] or 0
        total_bar_crack_pcs = report.aggregate(Sum('bar_crack_pcs'))['bar_crack_pcs__sum'] or 0

        total_rejection = (total_up_setting + total_half_piercing + total_full_piercing +
                           total_ring_rolling + total_sizing + total_overheat + total_bar_crack_pcs)

        # Calculate rejection percentage
        total_rejection_percentage = (total_rejection / (total_production + total_rejection)) * 100 if total_production else 0

        # Calculate total production weight (kg and tons) by summing production_weight_kg
        total_slug_weight = report.aggregate(Sum('production_weight_kg'))['production_weight_kg__sum'] or 0
        production_weight_kg = total_slug_weight
        production_weight_ton = production_weight_kg / 1000

        # Aggregate by component, customer, and line
        component_data = report.values('component').annotate(
            total_production_weight_kg=Sum('production_weight_kg')
        ).order_by('component')

        customer_data = report.values('normalized_customer').annotate(
            total_production_weight_kg=Sum('production_weight_kg')
        ).order_by('normalized_customer')

        line_data = report.values('line').annotate(
            total_production_weight_kg=Sum('production_weight_kg')
        ).order_by('line')

        # Convert production_weight_kg to tons
        component_data = [{'component': item['component'], 'production_weight_ton': item['total_production_weight_kg'] / 1000} for item in component_data]
        customer_data = [{'normalized_customer': item['normalized_customer'], 'production_weight_ton': item['total_production_weight_kg'] / 1000} for item in customer_data]
        line_data = [{'line': item['line'], 'production_weight_ton': item['total_production_weight_kg'] / 1000} for item in line_data]

        # Prepare all data for table
        table_data = list(report.values())

        return Response({
            'total_production': total_production,
            'total_rejection': total_rejection,
            'rejection_percentage': total_rejection_percentage,
            'production_weight_kg': production_weight_kg,
            'production_weight_ton': production_weight_ton,
            'component_data': component_data,
            'customer_data': customer_data,
            'line_data': line_data,
            'table_data': table_data  # Include all fields for the table
        })




class ProductionByMonth(APIView):
    def get(self, request, *args, **kwargs):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        date_from = datetime(year=int(year), month=int(month), day=1)
        next_month = date_from.replace(month=int(month) % 12 + 1, day=1)
        report = Forging.objects.filter(date__gte=date_from, date__lt=next_month)

        total_production = report.aggregate(Sum('production'))['production__sum'] or 0
        total_rejection = report.aggregate(Sum('rejection'))['rejection__sum'] or 0
        rejection_percentage = (total_rejection / (total_production + total_rejection)) * 100 if total_production else 0

        production_weight_kg = report.aggregate(Sum('production_weight_kg'))['production_weight_kg__sum'] or 0
        production_weight_ton = production_weight_kg / 1000

        return Response({
            'total_production': total_production,
            'total_rejection': total_rejection,
            'rejection_percentage': rejection_percentage,
            'production_weight_kg': production_weight_kg,
            'production_weight_ton': production_weight_ton
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
            suggestions = Forging.objects.filter(line__icontains=search_query).values('line').distinct()
            return Response([entry['line'] for entry in suggestions])

        elif search_type == 'customer':
            # Query Forging model to filter customers containing the search query
            suggestions = Forging.objects.filter(customer__icontains=search_query).values('customer').distinct()
            return Response([entry['customer'] for entry in suggestions])

        elif search_type == 'batch_number':
            # Query Forging model to filter batch numbers containing the search query
            suggestions = Forging.objects.filter(batch_number__icontains=search_query).values('batch_number').distinct()
            return Response([entry['batch_number'] for entry in suggestions])

        elif search_type == 'component':
            # Query Forging model to filter components containing the search query
            suggestions = Forging.objects.filter(component__icontains=search_query).values('component').distinct()
            return Response([entry['component'] for entry in suggestions])
        elif search_type == 'forman':
            # Query Forging model to filter components containing the search query
            suggestions = Forging.objects.filter(forman__icontains=search_query).values('forman').distinct()
            return Response([entry['forman'] for entry in suggestions])


        # If no valid search_type is provided, return a 400 error
        return Response([], status=status.HTTP_400_BAD_REQUEST)
    

# views.py
from rest_framework import viewsets
from .serializers import ForgingSerializer

class ForgingViewSet(viewsets.ModelViewSet):
    queryset = Forging.objects.all()
    serializer_class = ForgingSerializer




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Forging

class BulkAddForgingAPIView(APIView):
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
                "batch_number", "date", "shift", "component", "customer", "slug_weight",
                "rm_grade", "heat_number", "line", "line_incharge", "forman", "target",
                "production", "rework", "up_setting", "half_piercing", "full_piercing",
                "ring_rolling", "sizing", "overheat", "bar_crack_pcs","verified_by"
            ]
            missing_fields = [field for field in required_fields if field not in entry]
            if missing_fields:
                invalid_entries.append({"index": i, "missing_fields": missing_fields})

        if invalid_entries:
            return Response({"error": "Invalid entries found.", "details": invalid_entries}, status=status.HTTP_400_BAD_REQUEST)

        # Try creating all entries in a single transaction
        try:
            with transaction.atomic():
                forging_objects = [Forging(**entry) for entry in data]
                Forging.objects.bulk_create(forging_objects)
            return Response({"message": "Bulk data added successfully."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": "An error occurred while adding data.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


def balance_for_target_autofill():
    # Fetch all data from the Forging model
    batch_tracking = Forging.objects.all()
    
    # Convert queryset to DataFrame
    df_bt = read_frame(batch_tracking)
    
    # Extract relevant columns
    df_bt_extracted = df_bt[['batch_number', 'production', 'rework', 'up_setting', 'half_piercing', 'full_piercing', 'ring_rolling', 'sizing', 'overheat']]
    
    # Step 1: Add the new column 'total_production' by summing the specified columns
    df_bt_extracted['total_production'] = df_bt_extracted[['production', 'rework', 'up_setting', 'half_piercing', 'full_piercing', 'ring_rolling', 'sizing', 'overheat']].sum(axis=1)
    
    # Step 2: Group by 'batch_number' and sum the 'total_production' column
    df_total_production = df_bt_extracted.groupby('batch_number')['total_production'].sum().reset_index()
    
    # Convert the DataFrame to a list of dictionaries for easier filtering
    return df_total_production.to_dict(orient='records')

def get_target_details1(request):
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
from heat_treatment.models import HeatTreatment
import pandas as pd

def balance_after_hold_material_use_autofill():
    # Step 1: Read the data from the Django models into pandas DataFrames
    blockmt_df = pd.DataFrame(list(Forging.objects.all().values()))
    batch_tracking_df = pd.DataFrame(list(HeatTreatment.objects.all().values()))

    # Step 2: Group BatchTracking by block_mt_id and sum the kg_qty
    batch_tracking_grouped = batch_tracking_df.groupby('batch_number', as_index=False)['production'].sum()

    grouped_blockmt_df = (
        blockmt_df.groupby('batch_number', as_index=False)
        .agg({
                 # Take the first block_mt_id
                 'component': 'first', 
            'customer': 'first',            # Take the first weight
            'production': 'sum',          # Sum the production
            'slug_weight': 'first',     # Replace with actual field names
            'rm_grade': 'first',
            'heat_number': 'first',    # Replace with actual field names
            # Add other fields as needed
        })
    )


    # Step 3: Merge the grouped BatchTracking data with Blockmt on block_mt_id
    merged_df = pd.merge(grouped_blockmt_df, batch_tracking_grouped, on='batch_number', how='left')
    

    # Convert 'weight' to float to match the type of 'kg_qty'
    merged_df['remaining'] = merged_df['production_x'].astype(float) - merged_df['production_y'].fillna(0).astype(float)


    # Step 4: Calculate the remaining weight
    merged_df['remaining'] = merged_df['production_x'] - merged_df['production_y'].fillna(0)
    print(merged_df)

    # Step 5: Convert the result to a dictionary
    result_dict = merged_df.to_dict(orient='records')

    return result_dict

def autocompleteheat(request):
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

def get_part_detailsheat(request):
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
            'customer': matching_part['customer'],
            'grade': matching_part['rm_grade'],  # Adjust based on your needs
            'heatno': matching_part['heat_number'],
            'pices': matching_part['production_x'],
        }
        return JsonResponse(data)
    else:
        return JsonResponse({'error': 'No matching part found'}, status=404)


import calendar
from datetime import date, timedelta
from django.db.models import Sum
from django.http import JsonResponse
from django.views import View
from .models import Forging
from django.db.models import F, Sum, DecimalField

# class MonthlyProductionView(View):
#     def get(self, request):
#         # Get today's date
#         today = date.today()

#         # Determine the first and last day of the current month
#         first_day_current_month = today.replace(day=1)
#         last_day_current_month = today.replace(day=calendar.monthrange(today.year, today.month)[1])

#         # Determine the first and last day of the previous month
#         first_day_prev_month = (first_day_current_month - timedelta(days=1)).replace(day=1)
#         last_day_prev_month = first_day_current_month - timedelta(days=1)

#         # Get the production and slug weight for the current month
#         current_month_data = Forging.objects.filter(date__range=(first_day_current_month, last_day_current_month))
#         current_month_production = current_month_data.aggregate(
#             total_production_weight=Sum(F('production') * F('slug_weight'), output_field=DecimalField())
#         )['total_production_weight'] or 0

#         # Convert to tons
#         current_month_production_ton = current_month_production / 1000

#         # Get the production and slug weight for the previous month
#         prev_month_data = Forging.objects.filter(date__range=(first_day_prev_month, last_day_prev_month))
#         prev_month_production = prev_month_data.aggregate(
#             total_production_weight=Sum(F('production') * F('slug_weight'), output_field=DecimalField())
#         )['total_production_weight'] or 0

#         # Convert to tons
#         prev_month_production_ton = prev_month_production / 1000

#         # Calculate percentage difference
#         if prev_month_production_ton > 0:
#             percentage_diff = ((current_month_production_ton - prev_month_production_ton) / prev_month_production_ton) * 100
#         else:
#             percentage_diff = None  # Cannot calculate percentage difference if previous month's production is zero

#         # Prepare the response
#         response = {
#             "current_month_production_ton": round(current_month_production_ton, 2),
#             "prev_month_production_ton": round(prev_month_production_ton, 2),
#             "percentage_difference": round(percentage_diff, 2) if percentage_diff is not None else "N/A"
#         }

#         return JsonResponse(response)
    

from datetime import date, timedelta
from django.views import View
from django.db.models import Sum, F
from django.db.models.fields import DecimalField
from django.http import JsonResponse

class MonthlyProductionView(View):
    def get(self, request):
        # Get today's date
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Determine the first day of the current month
        first_day_current_month = today.replace(day=1)
        
        # Determine the first day of the previous month
        if today.month == 1:
            first_day_last_month = today.replace(year=today.year - 1, month=12, day=1)
        else:
            first_day_last_month = today.replace(month=today.month - 1, day=1)
        
        # Calculate the end of the previous month (last day of previous month)
        if today.month == 1:
            # If current month is January, previous month is December of previous year
            end_of_last_month = today.replace(year=today.year - 1, month=12, day=31)
        else:
            # For other months, get the first day of current month and subtract 1 day to get last day of previous month
            end_of_last_month = first_day_current_month - timedelta(days=1)
        
        # Get production data for the entire previous month
        last_month_data = Forging.objects.filter(date__range=(first_day_last_month, end_of_last_month))
        last_month_production = last_month_data.aggregate(
            total_production_weight=Sum(F('production') * F('slug_weight'), output_field=DecimalField())
        )['total_production_weight'] or 0
        last_month_production_ton = last_month_production / 1000

        # Get production data from the start of the current month to yesterday
        current_month_data = Forging.objects.filter(date__range=(first_day_current_month, yesterday))
        current_month_production = current_month_data.aggregate(
            total_production_weight=Sum(F('production') * F('slug_weight'), output_field=DecimalField())
        )['total_production_weight'] or 0
        current_month_production_ton = current_month_production / 1000

        # Calculate percentage difference
        if last_month_production_ton > 0:
            percentage_diff = ((float(current_month_production_ton) - float(last_month_production_ton)) / float(last_month_production_ton)) * 100

        else:
            percentage_diff = None  # Cannot calculate percentage difference if previous month's production is zero

        # Prepare the response
        response = {
            "prev_month_production_ton": round(last_month_production_ton, 2),
            "current_month_production_ton": round(current_month_production_ton, 2),
            "percentage_difference": round(percentage_diff, 2) if percentage_diff is not None else "N/A",
            "comparison_note": "Current month data is up to yesterday. Previous month data is for full month."
        }

        return JsonResponse(response)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from datetime import datetime, timedelta
from .models import Forging
from .serializers import ForgingSerializer

class ProductionTrendAPI(APIView):

    def get(self, request, format=None):
        # Get the current date and calculate the last 12 months
        current_date = datetime.now().date()
        start_date = current_date.replace(day=1)  # First day of the current month
        end_date = start_date - timedelta(days=1)  # Last day of the previous month

        # Get the data for the current month and the previous 12 months
        months_data = []
        for i in range(7):
            # Calculate the start date for the month (using month shifting)
            start_of_month = start_date.replace(
                month=start_date.month - i if start_date.month - i > 0 else 12 + (start_date.month - i),
                year=start_date.year - (start_date.month - i < 1)
            )

            # Get the last day of the calculated month
            end_of_month = start_of_month.replace(day=28) + timedelta(days=4)  # Ensures we are in the correct month
            end_of_month = end_of_month.replace(day=1) - timedelta(days=1)  # Last day of the month

            # Filter forging entries for this particular month
            forgings = Forging.objects.filter(date__gte=start_of_month, date__lte=end_of_month)

            # Calculate the total production in tons for this month
            total_production_in_ton = sum(
                (forging.production * forging.slug_weight) / 1000 for forging in forgings
            )

            # Append the result to the list
            months_data.append({
                'month': start_of_month.strftime('%Y-%m'),  # Format the month as "YYYY-MM"
                'production_in_ton': total_production_in_ton
            })

        # Return the response with the production data for each month
        return Response(months_data, status=status.HTTP_200_OK)



class RejectionTrendAPI(APIView):

    def get(self, request, format=None):
        # Get the current date and calculate the last 12 months
        current_date = datetime.now().date()
        start_date = current_date.replace(day=1)  # First day of the current month
        end_date = start_date - timedelta(days=1)  # Last day of the previous month

        # Get the data for the current month and the previous 12 months
        months_data = []
        for i in range(7):
            # Calculate the start date for the month (using month shifting)
            start_of_month = start_date.replace(
                month=start_date.month - i if start_date.month - i > 0 else 12 + (start_date.month - i),
                year=start_date.year - (start_date.month - i < 1)
            )

            # Get the last day of the calculated month
            end_of_month = start_of_month.replace(day=28) + timedelta(days=4)  # Ensures we are in the correct month
            end_of_month = end_of_month.replace(day=1) - timedelta(days=1)  # Last day of the month

            # Filter forging entries for this particular month
            forgings = Forging.objects.filter(date__gte=start_of_month, date__lte=end_of_month)

            # Aggregate total rejection and total production
            total_rejection = sum(
                forging.up_setting + forging.half_piercing + forging.full_piercing + forging.ring_rolling + forging.sizing + forging.overheat + forging.bar_crack_pcs
                for forging in forgings
            )
            total_production = sum(
                forging.production + forging.up_setting + forging.half_piercing + forging.full_piercing + forging.ring_rolling + forging.sizing + forging.overheat + forging.bar_crack_pcs
                for forging in forgings
            )

            # Calculate rejection percentage for the month
            if total_production > 0:  # Avoid division by zero
                total_rejection_percent = (total_rejection / total_production) * 100
            else:
                total_rejection_percent = 0

            # Append the result to the list
            months_data.append({
                'month': start_of_month.strftime('%Y-%m'),
                'production_in_ton': total_rejection_percent
            })


        # Return the response with the production data for each month
        return Response(months_data, status=status.HTTP_200_OK)




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from datetime import datetime

class RejectionData(APIView):

    def get(self, request):
        component = request.query_params.get('component', None)
        line = request.query_params.get('line', None)
        forman = request.query_params.get('forman', None)
        customer = request.query_params.get('customer', None)
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        # Filter based on query parameters
        queryset = Forging.objects.all()

        if component:
            queryset = queryset.filter(component=component)
        if customer:
            queryset = queryset.filter(customer=customer)
        if line:
            queryset = queryset.filter(line=line)
        if forman:
            queryset = queryset.filter(forman=forman)
        if start_date and end_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__range=[start_date, end_date])
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate total rejection
        total_rejection = queryset.aggregate(
            total_rejection=Sum('up_setting') + Sum('half_piercing') + Sum('full_piercing') +
                           Sum('ring_rolling') + Sum('sizing') + Sum('overheat') + Sum('bar_crack_pcs')
        )

        # Serialize the filtered data
        serializer = ForgingSerializer(queryset, many=True)

        # Prepare the response data
        response_data = {
            "total_rejection": total_rejection.get('total_rejection', 0),
            "data": serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)




from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import Forging 
from cnc.models import machining
from raw_material.models import dispatch
from visual.models import Visual
from pre_mc.models import pre_mc

from django.db.models import Sum, F
from django.db.models import Sum
from rest_framework.decorators import api_view
from rest_framework.response import Response
# Example mapping of mother components and their sub-components
component_hierarchy = {
    "13981": {
        "sub_components": [ "13981","18243"],
        "is_mother": True  # Indicates this is a mother component
    },
    "13356": {
        "sub_components": ["13356", "sub_component_2B"],
        "is_mother": True
    },
    "normal_component_1": {
        "sub_components": [],  # No sub-components
        "is_mother": False  # Indicates this is a normal component
    },
    # Add more components as needed
}
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from raw_material.models import Masterlist


extra_production = {
    "60450248": {
        "forging": 0,
        "heat_treatment": 378,
        "pre_mc": 280,
        "machining": 9,
        "visual": 39,
        "dispatch":0,
    },
    "60550202": {
        "forging": 0,
        "heat_treatment": 1150,
        "pre_mc": 1576 ,
        "machining": 1576,
        "visual": 1576,
        "dispatch":1256 ,
    },
    "69009710": {
        "forging": 0,
        "heat_treatment": 30,
        "pre_mc": 30 ,
        "machining": 30,
        "visual": 30,
        "dispatch":30 ,
    },
    "69000084": {
        "forging": 0,
        "heat_treatment": 115,
        "pre_mc": 115 ,
        "machining": 115,
        "visual": 115,
        "dispatch":115 ,
    },

    "N07500001PHT/FTB": {
        "forging": 474,
        "heat_treatment": 605,
        "pre_mc": 2385 ,
        "machining": 176,
        "visual": 0,
        "dispatch":3193 ,
    },
    "1500071/TB": {
        "forging": 0,
        "heat_treatment": 10496 ,
        "pre_mc": 13476,
        "machining": 16385 ,
        "visual": 16385 ,
        "dispatch":12328  ,
    },
    "F8A03611": {
        "forging": 667,
        "heat_treatment": 685 ,
        "pre_mc": 0,
        "machining": 585  ,
        "visual": 740 ,
        "dispatch":1500  ,
    },
    "10121738": {
        "forging": 0,
        "heat_treatment": 370 ,
        "pre_mc": 370,
        "machining": 15  ,
        "visual": 370 ,
        "dispatch":30  ,
    },
    "10169794": {
        "forging": 0,
        "heat_treatment": 37465 ,
        "pre_mc": 64420 ,
        "machining": 49565   ,
        "visual": 48973  ,
        "dispatch":68921 ,
    },
    "10442099": {
        "forging": 8811 ,
        "heat_treatment": 8811  ,
        "pre_mc": 8811  ,
        "machining": 1407    ,
        "visual": 0  ,
        "dispatch":4998  ,
    },
    "10155821": {
        "forging": 0 ,
        "heat_treatment": 12606 ,
        "pre_mc": 13075 ,
        "machining": 12704,
        "visual": 10156   ,
        "dispatch":19544 ,
    },
    "10127041": {
        "forging": 0 ,
        "heat_treatment": 14672  ,
        "pre_mc": 12538  ,
        "machining": 8429,
        "visual": 7385    ,
        "dispatch":13792  ,
    },
    "10154766": {
        "forging": 0 ,
        "heat_treatment": 4173  ,
        "pre_mc": 4173   ,
        "machining": 1506,
        "visual": 1662     ,
        "dispatch":4098   ,
    },
    "728.06.033.01": {
        "forging": 0 ,
        "heat_treatment": 13192  ,
        "pre_mc": 18669 ,
        "machining": 11358,
        "visual": 12508 ,
        "dispatch":16054,
    },
    "SU21094": {
        "forging": 0 ,
        "heat_treatment": 2381  ,
        "pre_mc": 5245  ,
        "machining": 2017 ,
        "visual": 2285 ,
        "dispatch":4585 ,
    },
    "1324.332.018": {
        "forging": 0,
        "heat_treatment": 3780  ,
        "pre_mc": 3780   ,
        "machining": 2985  ,
        "visual": 2055  ,
        "dispatch":1668  ,
    },
    "2715 2620 5408": {
        "forging": 959 ,
        "heat_treatment": 959   ,
        "pre_mc": 959   ,
        "machining": 405 ,
        "visual": 0 ,
        "dispatch":959  ,
    },
    "48103852/ftb": {
        "forging": 0,
        "heat_treatment": 4361   ,
        "pre_mc": 5382   ,
        "machining": 2951  ,
        "visual": 2605  ,
        "dispatch":5962 ,
    },
    "4TN1247FP5 CN": {
        "forging": 0,
        "heat_treatment": 8400   ,
        "pre_mc": 8400   ,
        "machining": 8400  ,
        "visual": 8400  ,
        "dispatch":8400  ,
    },
    "4TN1247FP5 CP": {
        "forging": 0,
        "heat_treatment": 8215  ,
        "pre_mc": 8215,
        "machining": 8215 ,
        "visual": 8215 ,
        "dispatch":8215 ,
    },
    "4TN1248FP5 CN": {
        "forging": 0,
        "heat_treatment": 10000   ,
        "pre_mc": 10000   ,
        "machining": 10000  ,
        "visual": 10000  ,
        "dispatch":10000  ,
    },
    "4TN1248FP5 CP": {
        "forging": 0 ,
        "heat_treatment": 8000   ,
        "pre_mc": 8000   ,
        "machining": 8000  ,
        "visual": 8000  ,
        "dispatch":8000  ,
    },
    "32218 CP": {
        "forging": 953 ,
        "heat_treatment": 953   ,
        "pre_mc": 953   ,
        "machining": 0 ,
        "visual": 953  ,
        "dispatch":953  ,
    },
    "572 CP": {
        "forging": 1790 ,
        "heat_treatment": 1790   ,
        "pre_mc": 1790   ,
        "machining": 0 ,
        "visual": 1790  ,
        "dispatch":1790  ,
    },
    "HM212049 CN": {
        "forging": 0 ,
        "heat_treatment": 40665    ,
        "pre_mc": 41430   ,
        "machining": 41795  ,
        "visual": 41795  ,
        "dispatch":21635  ,
    },
    "HM212011 CP": {
        "forging": 0,
        "heat_treatment": 49119   ,
        "pre_mc": 48619   ,
        "machining": 48619  ,
        "visual": 48619 ,
        "dispatch":23491  ,
    },
    "552 CP": {
        "forging": 0 ,
        "heat_treatment": 25745  ,
        "pre_mc": 25445  ,
        "machining": 25445  ,
        "visual": 25445  ,
        "dispatch":15149  ,
    },
    "555S CN": {
        "forging": 0,
        "heat_treatment": 24830   ,
        "pre_mc": 24530  ,
        "machining": 24530  ,
        "visual": 24530  ,
        "dispatch":13218  ,
    },
    "6420 CP": {
        "forging": 0,
        "heat_treatment": 27764  ,
        "pre_mc": 24806  ,
        "machining": 49951 ,
        "visual": 49951 ,
        "dispatch":43867  ,
    },
    "6461 CN": {
        "forging": -30704  ,
        "heat_treatment": 14310   ,
        "pre_mc": 14310   ,
        "machining": 14310  ,
        "visual": 14310  ,
        "dispatch":0 ,
    },
    "JM511946 CN": {
        "forging": 300 ,
        "heat_treatment": 300 ,
        "pre_mc": 300   ,
        "machining": 23 ,
        "visual": 0 ,
        "dispatch":0 ,
    },
    "JM511910 CP": {
        "forging": 300,
        "heat_treatment": 300  ,
        "pre_mc": 300  ,
        "machining": 0 ,
        "visual": 5 ,
        "dispatch":0 ,
    },
    "5621-0000G": {
        "forging": 0,
        "heat_treatment": 2804   ,
        "pre_mc": 4577   ,
        "machining": 3205  ,
        "visual": 4530  ,
        "dispatch":2571  ,
    },
    "5618-0000G": {
        "forging": 280,
        "heat_treatment": 280  ,
        "pre_mc": 280  ,
        "machining": 0 ,
        "visual": 280 ,
        "dispatch":280 ,
    },
    "5603-0000G": {
        "forging": 0,
        "heat_treatment": 1135   ,
        "pre_mc": 1135   ,
        "machining": 1135  ,
        "visual": 1135  ,
        "dispatch":1135  ,
    },
    "6026-0000G": {
        "forging": 0,
        "heat_treatment": 1316   ,
        "pre_mc": 3224   ,
        "machining": 1327 ,
        "visual": 5454  ,
        "dispatch":3431 ,
    },
    "5691": {
        "forging": 88,
        "heat_treatment": 0  ,
        "pre_mc": 723   ,
        "machining": 723  ,
        "visual": 723  ,
        "dispatch":723  ,
    },
    "8603": {
        "forging": 0,
        "heat_treatment": 3713   ,
        "pre_mc": 9243   ,
        "machining": 9243  ,
        "visual": 9243  ,
        "dispatch":6927  ,
    },
    "6028-0000G": {
        "forging": 335 ,
        "heat_treatment": 0  ,
        "pre_mc": 1397   ,
        "machining": 438  ,
        "visual": 2790  ,
        "dispatch":2590 ,
    },
    "8218": {
        "forging": 0,
        "heat_treatment": 8485  ,
        "pre_mc": 8485  ,
        "machining": 8485 ,
        "visual": 8485 ,
        "dispatch":8485 ,
    },
    "8610": {
        "forging": 0,
        "heat_treatment": 1714  ,
        "pre_mc": 7870   ,
        "machining": 7870  ,
        "visual": 7870  ,
        "dispatch":4762  ,
    },
    "8914": {
        "forging": 310,
        "heat_treatment": 310  ,
        "pre_mc": 310  ,
        "machining": 0 ,
        "visual": 20 ,
        "dispatch":310 ,
    },
    "4105-0000G": {
        "forging": 0,
        "heat_treatment": 0  ,
        "pre_mc": 0  ,
        "machining": 950  ,
        "visual": 34180  ,
        "dispatch":25778 ,
    },
    "3101-0000G": {
        "forging": 0,
        "heat_treatment": 12684  ,
        "pre_mc": 12177    ,
        "machining": 9769  ,
        "visual": 27662  ,
        "dispatch":12659 ,
    },
    "5305-0000G": {
        "forging": 0,
        "heat_treatment": 10899   ,
        "pre_mc": 15307  ,
        "machining": 9554  ,
        "visual": 16664  ,
        "dispatch":14705  ,
    },
    "5621-0000G": {
        "forging": 0,
        "heat_treatment": 2804   ,
        "pre_mc": 4577   ,
        "machining": 3205  ,
        "visual": 4577  ,
        "dispatch":2658 ,
    },
    "8618": {
        "forging": 0,
        "heat_treatment": 1252   ,
        "pre_mc": 4520   ,
        "machining": 4520  ,
        "visual": 4520  ,
        "dispatch":3397  ,
    },
    "8610": {
        "forging": 0,
        "heat_treatment": 1214   ,
        "pre_mc": 7370   ,
        "machining": 7370  ,
        "visual": 7370 ,
        "dispatch":4262  ,
    },
    "5684": {
        "forging": 0,
        "heat_treatment": 2274   ,
        "pre_mc": 5105   ,
        "machining": 5105  ,
        "visual": 5105  ,
        "dispatch":3257   ,
    },
    "8912-0000G": {
        "forging": 0,
        "heat_treatment": 10501   ,
        "pre_mc": 13226   ,
        "machining": 8276 ,
        "visual": 7779  ,
        "dispatch":12804 ,
    },
    "8913": {
        "forging": 0,
        "heat_treatment": 710   ,
        "pre_mc": 1461   ,
        "machining": 741 ,
        "visual": 941  ,
        "dispatch":1357 ,
    },
    "8601": {
        "forging": 0,
        "heat_treatment": 4932   ,
        "pre_mc": 8090   ,
        "machining": 8090  ,
        "visual": 8090  ,
        "dispatch":5885  ,
    },
    "8603": {
        "forging": 0,
        "heat_treatment": 3713   ,
        "pre_mc": 9443    ,
        "machining": 9443   ,
        "visual": 9443   ,
        "dispatch":7127   ,
    },
    "5686": {
        "forging": 0,
        "heat_treatment": 405   ,
        "pre_mc": 645   ,
        "machining": 895  ,
        "visual": 895  ,
        "dispatch":490  ,
    },
    "5683": {
        "forging": 0,
        "heat_treatment": 1258   ,
        "pre_mc": 5335   ,
        "machining": 5335  ,
        "visual": 5335  ,
        "dispatch":3624 ,
    },
    "8617": {
        "forging": 0,
        "heat_treatment": 3430   ,
        "pre_mc": 5980   ,
        "machining": 5980  ,
        "visual": 5980  ,
        "dispatch":4351  ,
    },
    "320-7051": {
        "forging": 0,
        "heat_treatment": 326   ,
        "pre_mc": 76   ,
        "machining": 194  ,
        "visual": 326  ,
        "dispatch":276 ,
    },
    "3752009348": {
        "forging": 0,
        "heat_treatment": 1  ,
        "pre_mc": 37  ,
        "machining": 27 ,
        "visual": 32,
        "dispatch":37  ,
    },
    "abc": {
        "forging": 0,
        "heat_treatment": 0  ,
        "pre_mc": 0  ,
        "machining": 0 ,
        "visual": 0 ,
        "dispatch":0 ,
    },
    "abc": {
        "forging": 0,
        "heat_treatment": 0  ,
        "pre_mc": 0  ,
        "machining": 0 ,
        "visual": 0 ,
        "dispatch":0 ,
    },

    "abc": {
        "forging": 0,
        "heat_treatment": 0  ,
        "pre_mc": 0  ,
        "machining": 0 ,
        "visual": 0 ,
        "dispatch":0 ,
    },
    # Add more components as needed
}

@api_view(['GET'])
def inventory_status(request, component_name=None):
    # Fetch all distinct components from Forging, Machining, and Visual in bulk
    forging_components = set(Forging.objects.values_list('component', flat=True).distinct())
    machining_components = set(machining.objects.values_list('component', flat=True).distinct())
    visual_components = set(Visual.objects.values_list('component', flat=True).distinct())

    # Combine and get unique components
    all_components = forging_components | machining_components | visual_components

    # Filter components based on similarity if component_name is provided
    if component_name:
        all_components = {component for component in all_components if component_name.lower() in component.lower()}

    # Fetch Masterlist Data in bulk
    masterlist_data = {
        m.component: {"customer": m.customer, "cost": m.cost}
        for m in Masterlist.objects.all()
    }

    # Fetch all pre_mc, machining, forging, heat_treatment, visual, and dispatch data in bulk
    pre_mc_data = pre_mc.objects.values('component').annotate(total=Sum('qty'))
    machining_data = machining.objects.filter(setup="II").values('component').annotate(total=Sum('production'))
    forging_data = Forging.objects.values('component').annotate(total=Sum('production'))
    heat_treatment_data = HeatTreatment.objects.values('component').annotate(total=Sum('production'))
    visual_data = Visual.objects.values('component').annotate(total=Sum('production'))
    dispatch_data = dispatch.objects.values('component').annotate(total=Sum('pices'))

    # Convert bulk data into dictionaries for quick lookups
    pre_mc_dict = {item['component']: item['total'] for item in pre_mc_data}
    machining_dict = {item['component']: item['total'] for item in machining_data}
    forging_dict = {item['component']: item['total'] for item in forging_data}
    heat_treatment_dict = {item['component']: item['total'] for item in heat_treatment_data}
    visual_dict = {item['component']: item['total'] for item in visual_data}
    dispatch_dict = {item['component']: item['total'] for item in dispatch_data}

    # Initialize data list
    data = []

    for component in all_components:
        # Check if the component is a mother component
        component_info = component_hierarchy.get(component, {"sub_components": [], "is_mother": False})
        is_mother = component_info["is_mother"]
        sub_components = component_info["sub_components"]

        # Check if component is a sub-component of a mother component
        parent_component = None
        for mother, info in component_hierarchy.items():
            if component in info.get("sub_components", []):
                parent_component = mother
                break

        # Fetch Mother Component's Pre-MC Production
        if is_mother:
            mother_pre_mc_production = pre_mc_dict.get(component, 0)
        elif parent_component:
            mother_pre_mc_production = pre_mc_dict.get(parent_component, 0)
        else:
            mother_pre_mc_production = pre_mc_dict.get(component, 0)

        # Machining Should Include Mother + Sub-Components
        if is_mother:
            machining_production = sum(machining_dict.get(c, 0) for c in [component] + sub_components)
        else:
            machining_production = sum(machining_dict.get(c, 0) for c in ([component, parent_component] if parent_component else [component]))

        # Fetch Other Stage Productions
        forging_production = forging_dict.get(component, 0)
        heat_treatment_production = heat_treatment_dict.get(component, 0)
        visual_production = visual_dict.get(component, 0)

        # Add Extra Production
        extra = extra_production.get(component, {})
        forging_production += extra.get("forging", 0)
        heat_treatment_production += extra.get("heat_treatment", 0)
        mother_pre_mc_production += extra.get("pre_mc", 0)
        machining_production += extra.get("machining", 0)
        visual_production += extra.get("visual", 0)

        dispatched_pieces = dispatch_dict.get(component, 0) + extra.get("dispatch", 0)

        # Inventory Calculation
        available_after_forging = forging_production - heat_treatment_production
        available_after_heat_treatment = heat_treatment_production - mother_pre_mc_production
        available_after_pre_mc = mother_pre_mc_production - machining_production
        available_after_machining = machining_production - visual_production
        available_after_visual = visual_production - dispatched_pieces

        # Fetch Customer & Cost from Masterlist
        master_data = masterlist_data.get(component, {"customer": None, "cost": None})

        # Append Data
        data.append({
            "component": component,
            "is_mother": is_mother,
            "sub_components": sub_components if is_mother else [],
            "forging_production": forging_production,
            "heat_treatment_production": heat_treatment_production,
            "pre_mc_production": mother_pre_mc_production,
            "machining_production": machining_production,
            "visual_production": visual_production,
            "dispatched_pieces": dispatched_pieces,
            "available_after_forging": available_after_forging,
            "available_after_heat_treatment": available_after_heat_treatment,
            "available_after_pre_mc": available_after_pre_mc,
            "available_after_machining": available_after_machining,
            "available_after_visual": available_after_visual,
            "customer": master_data["customer"],
            "cost": master_data["cost"],
        })

    return Response(data)



from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10  # Number of items per page
    page_size_query_param = 'page_size'
    max_page_size = 100

from django_filters import rest_framework as filters
from rest_framework import viewsets
import django_filters

class ForgingFilter(django_filters.FilterSet):
    date = django_filters.CharFilter(field_name="date", lookup_expr="icontains")
    batch_number = django_filters.CharFilter(field_name="batch_number", lookup_expr="icontains")
    shift = django_filters.CharFilter(field_name="shift", lookup_expr="icontains")
    component = django_filters.CharFilter(field_name="component", lookup_expr="icontains")
    verified_by = django_filters.CharFilter(field_name="verified_by", lookup_expr="icontains")

    class Meta:
        model = Forging  # ✅ Correct model assigned
        fields = ["date", "batch_number", "shift", "component", "verified_by"]

class ForgingViewSet1(viewsets.ModelViewSet):
    queryset = Forging.objects.all()
    serializer_class = ForgingSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = ForgingFilter