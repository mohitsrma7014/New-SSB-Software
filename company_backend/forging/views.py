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
        
        # Determine the same date in the previous month - 1 day
        if today.month == 1:
            last_month_date = today.replace(year=today.year - 1, month=12) - timedelta(days=1)
        else:
            last_month_date = today.replace(month=today.month - 1) - timedelta(days=1)
        
        # Get production data from the start of the last month to the same date in the previous month - 1 day
        last_month_data = Forging.objects.filter(date__range=(first_day_last_month, last_month_date))
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
            percentage_diff = ((current_month_production_ton - last_month_production_ton) / last_month_production_ton) * 100
        else:
            percentage_diff = None  # Cannot calculate percentage difference if previous month's production is zero

        # Prepare the response
        response = {
            "prev_month_production_ton": round(last_month_production_ton, 2),
            "current_month_production_ton": round(current_month_production_ton, 2),
            "percentage_difference": round(percentage_diff, 2) if percentage_diff is not None else "N/A"
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

@api_view(['GET'])
def inventory_status(request, component_name=None):
    components = Forging.objects.values_list('component', flat=True).distinct()
    data = []
    
    # Filter components based on similarity
    if component_name:
        components = [component for component in components if component_name.lower() in component.lower()]
    
    for component in components:
        forging_production = Forging.objects.filter(component=component).aggregate(Sum('production'))['production__sum'] or 0
        heat_treatment_production = HeatTreatment.objects.filter(component=component).aggregate(Sum('production'))['production__sum'] or 0

        machining_production = (
            machining.objects.filter(component=component, setup="II")
            .aggregate(Sum("production"))["production__sum"]
            or 0
        )

        visual_production = Visual.objects.filter(component=component).aggregate(Sum('production'))['production__sum'] or 0
        dispatched_pieces = dispatch.objects.filter(component=component).aggregate(Sum('pices'))['pices__sum'] or 0
        
        available_after_forging = forging_production - heat_treatment_production
        available_after_heat_treatment = heat_treatment_production - machining_production
        available_after_machining = machining_production - visual_production
        available_after_visual = visual_production - dispatched_pieces
        
        data.append({
            "component": component,
            "forging_production": forging_production,
            "heat_treatment_production": heat_treatment_production,
            "machining_production": machining_production,
            "visual_production": visual_production,
            "dispatched_pieces": dispatched_pieces,
            "available_after_forging": available_after_forging,
            "available_after_heat_treatment": available_after_heat_treatment,
            "available_after_machining": available_after_machining,
            "available_after_visual": available_after_visual,
        })
    
    return Response(data)
