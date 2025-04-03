# views.py
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import RawMaterialSerializer
from .models import RawMaterial,Blockmt,BatchTracking,rmreciveinbatch,Masterlist
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from .serializers import RawMaterialSerializer,BatchSerializer
import pandas as pd
from decimal import Decimal
import json
from rest_framework import generics
from urllib.parse import quote
from decimal import Decimal
from django_pandas.io import read_frame
from django.http import JsonResponse
from rest_framework.views import APIView
from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.decorators import api_view
from .models import Supplier, Grade, Customer, TypeOfMaterial, MaterialType
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView

# Import the function at the top of your views.py file

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ensure the user is authenticated via JWT
def create_raw_material(request):
    if request.method == 'POST':
        serializer = RawMaterialSerializer(data=request.data)

        if serializer.is_valid():
            # Access user data directly if authenticated via JWT
            user_full_name = f"{request.user.first_name} {request.user.last_name}"
            serializer.save(verified_by=user_full_name)

            # Store the raw material data in the session (optional)
            request.session['raw_material_data'] = serializer.data

            # Return the created raw material data
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RawMaterialListCreateView(generics.ListCreateAPIView):
    queryset = RawMaterial.objects.all()
    serializer_class = RawMaterialSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.save()


@api_view(['GET'])
def supplier_suggestions(request):
    query = request.GET.get('q', '')
    suggestions = Supplier.objects.filter(name__icontains=query)[:10]  # Limit to 10 results
    return Response([supplier.name for supplier in suggestions])

@api_view(['GET'])
def grade_suggestions(request):
    query = request.GET.get('q', '')
    suggestions = Grade.objects.filter(name__icontains=query)[:10]
    return Response([grade.name for grade in suggestions])

@api_view(['GET'])
def customer_suggestions(request):
    query = request.GET.get('q', '')
    suggestions = Customer.objects.filter(name__icontains=query)[:10]
    return Response([customer.name for customer in suggestions])

@api_view(['GET'])
def type_of_material_suggestions(request):
    query = request.GET.get('q', '')
    suggestions = TypeOfMaterial.objects.filter(name__icontains=query)[:10]
    return Response([material.name for material in suggestions])

@api_view(['GET'])
def material_type_suggestions(request):
    query = request.GET.get('q', '')
    suggestions = MaterialType.objects.filter(name__icontains=query)[:10]
    return Response([material.name for material in suggestions])

# views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Masterlist
from .serializers import ComponentSerializer

@api_view(['GET'])
def component_suggestion(request):
    # Get search parameters from the query string
    component_query = request.query_params.get('component', None)
    customer_query = request.query_params.get('customer', None)
    part_name_query = request.query_params.get('part_name', None)

    # Filtering logic based on available query params
    queryset = Masterlist.objects.all()

    if component_query:
        queryset = queryset.filter(component__icontains=component_query)
    if customer_query:
        queryset = queryset.filter(customer__icontains=customer_query)
    if part_name_query:
        queryset = queryset.filter(part_name__icontains=part_name_query)

    # Serialize only the component field
    serializer = ComponentSerializer(queryset, many=True)

    # Extract the 'component' values from the serialized data and return it in a list
    components = [item['component'] for item in serializer.data]

    return Response(components)



class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)
    
class BalanceAfterHold(APIView):
    def get(self, request):
        # Step 1: Read the data from the Django models into pandas DataFrames
        raw_materials = RawMaterial.objects.all()
        batch_tracking = Blockmt.objects.all()
        rm_from_yard = rmreciveinbatch.objects.all()
        issu_weight= BatchTracking.objects.all()
        df_rm = read_frame(raw_materials)
        df_bt = read_frame(batch_tracking)
        recive_yard = read_frame(rm_from_yard)
        issue_from_yard = read_frame(issu_weight)

        # Filter to keep only the approved rows
        

        # Step 2: Convert 'date' column in df_rm to datetime
        df_rm['date'] = pd.to_datetime(df_rm['date'])

        # Step 3: Sort the raw materials DataFrame by date
        df_rm_sorted = df_rm.sort_values(by='date', ascending=True)
        # Filter rows where the heat number is 50162
        


        # Step 4: Convert all string data in the DataFrames to lowercase
        df_rm_sorted = df_rm_sorted.apply(lambda col: col.str.lower() if col.dtype == 'object' and col.apply(lambda x: isinstance(x, str)).all() else col)

        df_bt = df_bt.apply(lambda col: col.str.lower() if col.dtype == 'object' and col.apply(lambda x: isinstance(x, str)).all() else col)

        recive_yard = recive_yard.apply(lambda col: col.str.lower() if col.dtype == 'object' and col.apply(lambda x: isinstance(x, str)).all() else col)
        issue_from_yard = issue_from_yard.apply(lambda col: col.str.lower() if col.dtype == 'object' and col.apply(lambda x: isinstance(x, str)).all() else col)

        # Step 4: Extract the specified fields from both DataFrames
        df_rm_extracted = df_rm_sorted[['date', 'supplier', 'grade', 'heatno', 'dia', 'weight', 'rack_no', 'customer', 'standerd','type_of_material','approval_status']]
        df_bt_extracted = df_bt[['block_mt_id', 'supplier','component', 'customer', 'grade', 'standerd', 'heatno', 'dia', 'rack_no','weight']]
        recive_yard_extracted = recive_yard[['block_mt_id', 'heatno', 'dia', 'rack_no','weight']]
        issue_from_yard_extracted = issue_from_yard[['block_mt_id', 'heat_no', 'bardia', 'rack_no','kg_qty','customer']]
        recive_yard_extracted_grouped = recive_yard_extracted.groupby([ 'block_mt_id']).sum().reset_index()
        issue_from_yard_extracted_grouped = issue_from_yard_extracted.groupby([ 'block_mt_id','heat_no','customer','rack_no']).sum().reset_index()

        # Merge DataFrames on block_mt_id
        merged_df_rciv = df_bt_extracted.merge(recive_yard_extracted_grouped, on='block_mt_id', suffixes=('', '_received'), how='left')
        merged_df_issu = issue_from_yard_extracted_grouped.merge(recive_yard_extracted_grouped, on='block_mt_id', suffixes=('', '_received'), how='left')
        
        

        # Subtract weights, fill NaN with original weight
        merged_df_rciv['weight'] = merged_df_rciv['weight'] - merged_df_rciv['weight_received'].fillna(0)

        merged_df_issu['weight_r'] = merged_df_issu['kg_qty'] - merged_df_issu['weight'].fillna(0)
        merged_df_issu_grouped = merged_df_issu.groupby([ 'block_mt_id','heat_no','customer','rack_no']).sum().reset_index()
        # Define the batch ID you want to print
        # batch_id_to_print = 'pp-20240928-da-02'  # Change this to the desired block_mt_id

        # # Filter the DataFrame to get the specific row
        # specific_row = recive_yard_extracted[recive_yard_extracted['block_mt_id'] == batch_id_to_print]

        # # Print the specific row
        # if not specific_row.empty:
        #     print(specific_row)
        # else:
        #     print(f"No entry found for block_mt_id: {batch_id_to_print}")

        # Drop the extra columns used for merging
        final_df = merged_df_rciv.drop(columns=['weight_received', 'heatno_received', 'dia_received', 'rack_no_received'])
        final_df1 = merged_df_issu_grouped.drop(columns=['weight', 'heatno', 'dia', 'rack_no_received'])
        final_df1_grouped = final_df1.groupby([ 'heat_no','customer','rack_no']).sum().reset_index()

        
        # Convert to numeric, handling errors by converting non-numeric values to NaN
        df_rm_extracted['weight'] = pd.to_numeric(df_rm_extracted['weight'], errors='coerce')

        # Fill NaN values with a default value (e.g., 0) or drop them
        df_rm_extracted['weight'] = df_rm_extracted['weight'].fillna(0).astype(int)

        # Convert to numeric, handling errors by converting non-numeric values to NaN
        final_df['weight'] = pd.to_numeric(final_df['weight'], errors='coerce')

        # Fill NaN values with a default value (e.g., 0) or drop them
        final_df['weight'] = final_df['weight'].fillna(0).astype(int)

        # Renaming columns to match for grouping
        final_df = final_df.rename(columns={
            'weight': 'weight1',
        })
        
        # Step 5: Group both DataFrames by the specified fields and sum the weight
        # Grouping and aggregating
        df_rm_grouped = df_rm_extracted.groupby(
            ['supplier', 'grade', 'heatno', 'dia', 'rack_no', 'customer', 'standerd', 'type_of_material','approval_status'],
            as_index=False
        ).agg(
            date=('date', 'first'),
            weight=('weight', 'sum')
        )
        df_bt_grouped = final_df.groupby(['customer', 'supplier', 'grade', 'standerd', 'heatno', 'dia', 'rack_no'], as_index=False)['weight1'].sum()

        


        # Step 7: Merge the two grouped DataFrames on specified columns with a left join
        merged_df = pd.merge(df_rm_grouped, df_bt_grouped, 
                            left_on=['supplier', 'grade', 'heatno', 'dia', 'rack_no', 'customer'], 
                            right_on=['supplier', 'grade', 'heatno', 'dia', 'rack_no', 'customer' ],
                            how='left',  # Left join to keep all rows from df_rm_grouped
                            suffixes=('_rm', '_bt'))
        final_df1_grouped = final_df1_grouped.rename(columns={
            'heat_no': 'heatno',
        })
        merged_df1 = pd.merge(merged_df, final_df1_grouped, 
                            left_on=['heatno', 'rack_no', 'customer'], 
                            right_on=['heatno','rack_no','customer' ],
                            how='left',  # Left join to keep all rows from df_rm_grouped
                            suffixes=('_m1', '_m2'))

        merged_df1['weight1'] = merged_df1['weight1'].fillna(0)
        merged_df1['weight'] = merged_df1['weight'].fillna(0)
        merged_df1['weight_r'] = merged_df1['weight_r'].fillna(0)
        
        # Convert weight columns to float for arithmetic operations
        merged_df1['weight1'] = pd.to_numeric(merged_df1['weight1'], errors='coerce').fillna(0)
        merged_df1['weight'] = pd.to_numeric(merged_df1['weight'], errors='coerce').fillna(0)

        # Step 8: Calculate the weight difference
        merged_df1['weight_diff'] = merged_df1['weight'] - merged_df1['weight1']
        merged_df1['af_issu_weight_diff'] = merged_df1['weight'] - merged_df1['weight_r']


        # Drop rows where weight_diff is less than 100
        filtered_df = merged_df1[merged_df1['af_issu_weight_diff'] >= 100]

        filtered_df = filtered_df.sort_values(by='date', ascending=True)
        # Filter out rows where status is 'approved'
        filtered_df_rack = filtered_df[filtered_df['approval_status'].isin(['rejected', 'under inspection', 'hold'])]
        # Group rack numbers by status and format as a dictionary
        filtered_df_dict1 = {
            status: ', '.join(map(str, racks)) for status, racks in filtered_df_rack.groupby('approval_status')['rack_no'].apply(list).items()
        }
        all_racks = set(map(str, range(1, 69)))  # Racks from '1' to '67'

        # Get the existing rack numbers from the DataFrame
        existing_racks = set(filtered_df['rack_no'])

        # Calculate missing racks
        missing_racks = all_racks - existing_racks

        # Convert to a list or keep as a set
        missing_racks_list = list(missing_racks)


        # Step 6: Add FIFO number based on grade and dia
        filtered_df['fifo_no'] = filtered_df.groupby(['grade', 'dia','customer']).cumcount() + 1
        filtered_df['fifo_no'] = filtered_df['fifo_no'].apply(lambda x: f"f{x}")

        filtered_df['weight_diff'] = filtered_df['weight_diff'].astype(int)
        filtered_df['weight_diff_tons'] = filtered_df['weight_diff'] / 1000
    #//////////////////////////////////
        filtered_sate_df = filtered_df[filtered_df['type_of_material'] == 'sale work']

        # Calculate the sum of the 'weight_diff_tons' column for these filtered rows
        total_Rm = round(filtered_sate_df['weight_diff_tons'].sum(), 3)
    #///////////////////////////
    #//////////////////////////////////
        filtered_job_df = filtered_df[filtered_df['type_of_material'] == 'job work']

        # Calculate the sum of the 'weight_diff_tons' column for these filtered rows
        total_Rm1 = round(filtered_job_df['weight_diff_tons'].sum(), 3)
    #///////////////////////////
        filtered_df_dict = filtered_df.to_dict(orient='records')


        # Optional: Implement filtering or calculation logic based on your needs.
        # For example, filtering batch tracking data to include only those on hold:
        # df_bt_on_hold = df_bt[df_bt['status'] == 'on hold']

        # Prepare the data to be passed to the template
        context = {
            
            'raw_materials_data': df_rm_sorted.to_dict(orient='records'),  # Convert DataFrame to a list of dicts,
            'filtered_df_dict':filtered_df_dict,
            'filtered_df_dict1': filtered_df_dict1,
            'missing_racks': missing_racks_list, 
        }

        return JsonResponse(context)
def balance_after_hold_for_autofill(request=None):
    # Step 1: Read the data from the Django models into pandas DataFrames
    # Step 1: Read the data from the Django models into pandas DataFrames
    raw_materials = RawMaterial.objects.all()
    batch_tracking = Blockmt.objects.all()
    rm_from_yard = rmreciveinbatch.objects.all()
    df_rm = read_frame(raw_materials)
    df_bt = read_frame(batch_tracking)
    recive_yard = read_frame(rm_from_yard)

    df_rm = df_rm[df_rm['approval_status'] == 'Approved']
    # Step 2: Convert 'date' column in df_rm to datetime
    df_rm['date'] = pd.to_datetime(df_rm['date'])

    # Step 3: Sort the raw materials DataFrame by date
    df_rm_sorted = df_rm.sort_values(by='date', ascending=True)

    # Step 4: Convert all string data in the DataFrames to lowercase
    df_rm_sorted = df_rm_sorted.apply(lambda col: col.str.lower() if col.dtype == 'object' and col.apply(lambda x: isinstance(x, str)).all() else col)

    df_bt = df_bt.apply(lambda col: col.str.lower() if col.dtype == 'object' and col.apply(lambda x: isinstance(x, str)).all() else col)

    recive_yard = recive_yard.apply(lambda col: col.str.lower() if col.dtype == 'object' and col.apply(lambda x: isinstance(x, str)).all() else col)

     # Step 4: Extract the specified fields from both DataFrames
    df_rm_extracted = df_rm_sorted[['date', 'supplier', 'grade', 'heatno', 'dia', 'weight', 'rack_no', 'customer', 'standerd', 'type_of_material']]
    df_bt_extracted = df_bt[['block_mt_id', 'supplier','component', 'customer', 'grade', 'standerd', 'heatno', 'dia', 'rack_no','weight']]
    recive_yard_extracted = recive_yard[['block_mt_id', 'heatno', 'dia', 'rack_no','weight']]
    recive_yard_extracted_grouped = recive_yard_extracted.groupby([ 'block_mt_id']).sum().reset_index()

    # Merge DataFrames on block_mt_id
    merged_df_rciv = df_bt_extracted.merge(recive_yard_extracted_grouped, on='block_mt_id', suffixes=('', '_received'), how='left')

    

    # Subtract weights, fill NaN with original weight
    merged_df_rciv['weight'] = merged_df_rciv['weight'] - merged_df_rciv['weight_received'].fillna(0)
    # Define the batch ID you want to print
    # batch_id_to_print = 'pp-20240928-da-02'  # Change this to the desired block_mt_id

    # # Filter the DataFrame to get the specific row
    # specific_row = recive_yard_extracted[recive_yard_extracted['block_mt_id'] == batch_id_to_print]

    # # Print the specific row
    # if not specific_row.empty:
    #     print(specific_row)
    # else:
    #     print(f"No entry found for block_mt_id: {batch_id_to_print}")

    # Drop the extra columns used for merging
    final_df = merged_df_rciv.drop(columns=['weight_received', 'heatno_received', 'dia_received', 'rack_no_received'])

    # Convert to numeric, handling errors by converting non-numeric values to NaN
    df_rm_extracted['weight'] = pd.to_numeric(df_rm_extracted['weight'], errors='coerce')

    # Fill NaN values with a default value (e.g., 0) or drop them
    df_rm_extracted['weight'] = df_rm_extracted['weight'].fillna(0).astype(int)

    # Convert to numeric, handling errors by converting non-numeric values to NaN
    final_df['weight'] = pd.to_numeric(final_df['weight'], errors='coerce')

    # Fill NaN values with a default value (e.g., 0) or drop them
    final_df['weight'] = final_df['weight'].fillna(0).astype(int)

    # Renaming columns to match for grouping
    final_df = final_df.rename(columns={
        'weight': 'weight1',
    })
    # Step 5: Group both DataFrames by the specified fields and sum the weight
    df_rm_grouped = df_rm_extracted.groupby(
        ['supplier', 'grade', 'heatno', 'dia', 'rack_no', 'customer', 'standerd',  'type_of_material'],
        as_index=False
    ).agg(
        date=('date', 'first'),
        weight=('weight', 'sum')
    )
    df_bt_grouped = final_df.groupby(['customer', 'supplier', 'grade', 'standerd', 'heatno', 'dia', 'rack_no'], as_index=False)['weight1'].sum()



    # Step 7: Merge the two grouped DataFrames on specified columns with a left join
    merged_df = pd.merge(df_rm_grouped, df_bt_grouped, 
                         left_on=['supplier', 'grade', 'heatno', 'dia', 'rack_no', 'customer'], 
                         right_on=['supplier', 'grade', 'heatno', 'dia', 'rack_no', 'customer' ],
                         how='left',  # Left join to keep all rows from df_rm_grouped
                         suffixes=('_rm', '_bt'))

    merged_df['weight1'] = merged_df['weight1'].fillna(0)
    merged_df['weight'] = merged_df['weight'].fillna(0)

    # Convert weight columns to float for arithmetic operations
    merged_df['weight1'] = pd.to_numeric(merged_df['weight1'], errors='coerce').fillna(0)
    merged_df['weight'] = pd.to_numeric(merged_df['weight'], errors='coerce').fillna(0)

    # Step 8: Calculate the weight difference
    merged_df['weight_diff'] = merged_df['weight'] - merged_df['weight1']


    # Drop rows where weight_diff is less than 100
    filtered_df = merged_df[merged_df['weight_diff'] >= 100]

    # Sort the filtered DataFrame by date
    filtered_df = filtered_df.sort_values(by='date', ascending=True)

    # Step 6: Add FIFO number based on grade and dia
    filtered_df['fifo_no'] = filtered_df.groupby(['grade', 'dia','customer']).cumcount() + 1
    filtered_df['fifo_no'] = filtered_df['fifo_no'].apply(lambda x: f"f{x}")

    f1 = 'f1'
    result_df = filtered_df[filtered_df['fifo_no'] == f1]

    
    # Convert weight_diff to int and calculate in tons
    result_df['weight_diff'] = result_df['weight_diff'].astype(int)
    result_df['weight_diff_tons'] = result_df['weight_diff'] / 1000

    # Convert the filtered DataFrame to a list of dictionaries
    filtered_df_dict = result_df.to_dict(orient='records')
    
    
    return filtered_df_dict

def get_part_details1(request):
    grades = [grade.strip().lower() for grade in request.GET.get('grade', '').split(',')]
    dias = [dia.strip().lower() for dia in request.GET.get('dia', '').split(',')]
    customer = request.GET.get('customer', '').strip().lower()


    # Get the preprocessed data from the balance_after_hold_for_autofill function
    preprocessed_data = balance_after_hold_for_autofill()

    # Iterate over grades and dias to find the first matching part
    matching_part = None
    for grade in grades:
        for dia in dias:
           
            for part in preprocessed_data:
               
                if (part['grade'].lower() == grade and 
                    str(part['dia']) == str(dia) and 
                    part.get('customer', '').lower() == customer):
                    matching_part = part
                    break
                if matching_part:
                    break
            if matching_part:
                break
        if matching_part:
            break  # Break outer loop if a matching part is found
    

    if matching_part:
        data = {
            'supplier': matching_part['supplier'],
            'heatno': matching_part['heatno'],
            'rack_no': matching_part['rack_no'],  # Adjust based on your needs
            'weight_diff': matching_part['weight_diff'],
            'standerd_rm': matching_part['standerd_rm'],
            'grade':matching_part['grade'],
            'dia':matching_part['dia'],
        }
        return JsonResponse(data)
    else:
        return JsonResponse({'error': 'No matching part found'}, status=404)

def get_operation_target(request):
    component = request.GET.get('component', '').strip().lower()
    setup = request.GET.get('setup', '').strip().upper()  # Setup should be 'I' or 'II'
    
    # Fetch the masterlist entry for the given component
    try:
        masterlist_entry = Masterlist.objects.get(component__iexact=component)
    except Masterlist.DoesNotExist:
        return JsonResponse({'error': 'Component not found'}, status=404)
    
    # Determine the target based on setup type
    if setup == 'I':
        target = masterlist_entry.op_10_target
    elif setup == 'II':
        target = masterlist_entry.op_20_target
    else:
        return JsonResponse({'error': 'Invalid setup value. Use I or II.'}, status=400)
    
    # Prepare response data
    data = {
        'component': masterlist_entry.component,
        'customer': masterlist_entry.customer,
        'drawing_number': masterlist_entry.drawing_number,
        'setup': setup,
        'target': target if target is not None else 'No target available'
    }
    
    return JsonResponse(data)





from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Blockmt
from .serializers import BlockmtSerializer
@api_view(['POST'])
def create_blockmt(request):
    if request.method == 'POST':
        serializer = BlockmtSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Block MT created successfully!', 'block_mt_id': serializer.data['block_mt_id']}, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)  # Log the validation errors
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


def get_part_details(request):
    component = request.GET.get('component')
    part = get_object_or_404(Masterlist, component=component)

    component_cycle_time = (part.op_10_time or 0) + (part.op_20_time or 0) + 10
    data = {
        'customer': part.customer,
        'material_grade':part.material_grade,
        'slug_weight':part.slug_weight,
        'bar_dia':part.bar_dia,
        'standerd':part.standerd,
        'component_cycle_time':component_cycle_time,

    }
    return JsonResponse(data)

from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Schedule,Blockmt
from .serializers import ScheduleSerializer
from datetime import datetime
from collections import defaultdict
from .models import dispatch
from datetime import datetime
from collections import defaultdict
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Schedule, Blockmt, dispatch  # Adjust import as necessary
from .serializers import ScheduleSerializer  # Adjust import as necessary

class ScheduleAPIView(APIView):
    def get(self, request):
        # Get the month filter from query parameters (default: current month)
        month_filter = request.query_params.get("month", datetime.now().strftime("%Y-%m"))
        try:
            # Extract year and month
            year, month = map(int, month_filter.split("-"))
        except ValueError:
            return Response({"error": "Invalid month format. Expected YYYY-MM."}, status=400)

        # Fetch schedules, blockmt data, and dispatch data with database filtering
        all_schedules = Schedule.objects.filter(date1__startswith=f"{year}-{str(month).zfill(2)}")

        all_blockmt_data = Blockmt.objects.filter(block_mt_id__startswith=f"PP-{year}{str(month).zfill(2)}")
        all_dispatch_data = dispatch.objects.filter(date__year=year, date__month=month)

        # Check if there is no data for the selected month
        if not all_schedules and not all_blockmt_data:
            return Response({"message": "No data available for the selected month."}, status=200)

        # Group schedules by component and aggregate pices
        schedule_grouped = defaultdict(lambda: {"total_pices": 0, "total_weight": 0, "schedule": None})
        for schedule in all_schedules:
            schedule_grouped[schedule.component]["total_pices"] += schedule.pices
            schedule_grouped[schedule.component]["total_weight"] += schedule.weight
            schedule_grouped[schedule.component]["schedule"] = schedule

        # Group blockmt data by component and aggregate pices
        blockmt_grouped = defaultdict(int)
        for block in all_blockmt_data:
            blockmt_grouped[block.component] += block.pices

        # Group dispatch data by component and aggregate pices
        dispatch_grouped = defaultdict(int)
        for dispatch_item in all_dispatch_data:
            dispatch_grouped[dispatch_item.component] += dispatch_item.pices

        # Calculate balances and prepare the results
        results = []
        for component, data in schedule_grouped.items():
            total_schedule_pices = data["total_pices"]
            total_schedule_weight = data["total_weight"]
            schedule = data["schedule"]
            blockmt_pices = blockmt_grouped.get(component, 0)
            dispatched = dispatch_grouped.get(component, 0)
            balance = total_schedule_pices - dispatched  # Balance calculation

            schedule_data = ScheduleSerializer(schedule).data
            schedule_data.update({
                "component": component,
                "total_schedule_pices": total_schedule_pices,
                "total_schedule_weight": total_schedule_weight,
                "month": month_filter,
                "blockmt_pices": blockmt_pices,
                "dispatched": dispatched,
                "balance": balance
            })
            results.append(schedule_data)

        return Response(results)
    
    
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import dispatch
from .serializers import DispatchSerializer

class CustomPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

class DispatchListView(APIView):
    pagination_class = CustomPagination
    
    @property
    def paginator(self):
        if not hasattr(self, '_paginator'):
            self._paginator = self.pagination_class()
        return self._paginator
    
    def paginate_queryset(self, queryset):
        return self.paginator.paginate_queryset(queryset, self.request, view=self)
    
    def get_paginated_response(self, data):
        return self.paginator.get_paginated_response(data)
    
    def get(self, request):
        queryset = dispatch.objects.all()
        
        # Apply filters
        date = request.query_params.get('date', None)
        component = request.query_params.get('component', None)
        batch_number = request.query_params.get('batch_number', None)
        heat_no = request.query_params.get('heat_no', None)
        invoiceno = request.query_params.get('invoiceno', None)
        
        if date:
            queryset = queryset.filter(date__icontains=date)
        if component:
            queryset = queryset.filter(component__icontains=component)
        if batch_number:
            queryset = queryset.filter(batch_number__icontains=batch_number)
        if heat_no:
            queryset = queryset.filter(heat_no__icontains=heat_no)
        if invoiceno:
            queryset = queryset.filter(invoiceno__icontains=invoiceno)
        
        # Handle ordering
        ordering = request.query_params.get('ordering', '-date')
        if ordering:
            # Split multiple ordering fields
            order_fields = [field.strip() for field in ordering.split(',')]
            # Validate fields exist in model
            valid_fields = [f.name for f in dispatch._meta.get_fields()]
            valid_order_fields = []
            for field in order_fields:
                # Remove '-' for field check
                field_name = field.lstrip('-')
                if field_name in valid_fields:
                    valid_order_fields.append(field)
            if valid_order_fields:
                queryset = queryset.order_by(*valid_order_fields)
        
        # Paginate the queryset
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DispatchSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = DispatchSerializer(queryset, many=True)
        return Response(serializer.data)

# List all RawMaterials
class RawMaterialListView(ListAPIView):
    queryset = RawMaterial.objects.all()
    serializer_class = RawMaterialSerializer

class RawMaterialDetailView(RetrieveUpdateAPIView):
    queryset = RawMaterial.objects.all()
    serializer_class = RawMaterialSerializer

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True  # Enable partial updates
        return super().update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        try:
            material = self.get_object()  # Get the raw material instance
            material.delete()  # Delete the raw material
            return Response({"message": "Material deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except RawMaterial.DoesNotExist:
            return Response({"error": "Material not found."}, status=status.HTTP_404_NOT_FOUND)
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
import os
from datetime import datetime
from io import BytesIO
import qrcode
from django.conf import settings
from .models import BatchTracking
from .serializers import BatchTrackingSerializer

def generate_batch_tracking_number(customer_name, count):
    current_date = datetime.now()
    year = current_date.year
    month = current_date.month
    day = current_date.day
    year_str = str(year)
    month_str = f"{month:02d}"
    day_str = f"{day:02d}"
    customer_initials = customer_name[:2].upper()
    count_str = f"{count:02d}"
    batch_tracking_number = f"FP-{year_str}{month_str}{day_str}-{customer_initials}-{count_str}"
    return batch_tracking_number

def read_counts(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            return json.load(file)
    else:
        return {}

def write_counts(file_path, counts):
    with open(file_path, 'w') as file:
        json.dump(counts, file)
class GenerateBatchTrackingNumberAPIView(APIView):
    def post(self, request):
        data = request.data

        # Required fields from request
        try:
            block_mt_id = data['block_mt_id']
            customer_name = data['customer']
            standerd = data['standerd']
            component_no = data['component_no']
            heat_no = data['heat_no']
            bardia = data['bardia']
            supplier = data['supplier']
            material_grade = data['material_grade']
            rack_no = data['rack_no']
            bar_qty = data['bar_qty']
            kg_qty = float(data['kg_qty'])
            line = data['line']
            verified_by = data['verified_by'] # Assumes authentication
        except KeyError as e:
            return Response({"error": f"Missing field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate batch number
        count_file = "batch_counts.json"
        current_date = datetime.now().strftime("%Y%m%d")
        counts = read_counts(count_file)

        customer_initials = customer_name[:2].upper()
        key = f"{current_date}_{customer_initials}"
        current_count = counts.get(key, 0) + 1
        counts[key] = current_count
        write_counts(count_file, counts)

        batch_number = generate_batch_tracking_number(customer_name, current_count)

        # Generate QR code data
        qr_data = {
            'block_mt_id': block_mt_id,
            'batch_number': batch_number,
            'component_no': component_no,
            'heat_no': heat_no,
            'supplier': supplier,
            'bardia': bardia,
            'customer': customer_name,
            'material_grade': material_grade,
            'standerd': standerd,
            'rack_no': rack_no,
            'bar_qty': bar_qty,
            'kg_qty': kg_qty,
            'line': line,
            'verified_by':verified_by,
        }

        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)
        img = qr.make_image(fill='black', back_color='white')

        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        qr_code_file = f"{batch_number}.png"
        qr_code_path = os.path.join(settings.MEDIA_ROOT, 'qrcodes', qr_code_file)
        os.makedirs(os.path.dirname(qr_code_path), exist_ok=True)

        # Save QR code to file system
        with open(qr_code_path, 'wb') as f:
            f.write(buffer.getvalue())

        # Save data to the database
        batch_tracking, created = BatchTracking.objects.update_or_create(
            batch_number=batch_number,
            defaults={
                'block_mt_id': block_mt_id,
                'qr_code': os.path.join('qrcodes', qr_code_file),
                'customer': customer_name,
                'standerd': standerd,
                'component_no': component_no,
                'heat_no': heat_no,
                'bardia': bardia,
                'supplier': supplier,
                'material_grade': material_grade,
                'rack_no': rack_no,
                'bar_qty': bar_qty,
                'kg_qty': kg_qty,
                'line': line,
                'verified_by': verified_by
            }
        )

        buffer.close()

        qr_code_url = f"http://192.168.1.199:8001{settings.MEDIA_URL}qrcodes/{qr_code_file}"
        print(qr_code_url)
        return Response({'batch_number': batch_number, 'qr_code_url': qr_code_url, 'qr_code_data': qr_data}, status=status.HTTP_201_CREATED)



@api_view(['GET'])
def block_mt_id_suggestion(request):
    # Get search parameters from the query string
    block_mt_id_query = request.query_params.get('block_mt_id', None)
    
    # Filtering logic based on available query params
    queryset = Blockmt.objects.all()

    if block_mt_id_query:
        queryset = queryset.filter(block_mt_id__icontains=block_mt_id_query)
    
    # Serialize only the component field
    serializer = BatchSerializer(queryset, many=True)

    # Extract the 'component' values from the serialized data and return it in a list
    block_mt_id = [item['block_mt_id'] for item in serializer.data]

    return Response(block_mt_id)


def balance_after_hold_material_use_autofill():
    # Step 1: Read the data from the Django models into pandas DataFrames
    blockmt_df = pd.DataFrame(list(Blockmt.objects.all().values()))
    batch_tracking_df = pd.DataFrame(list(BatchTracking.objects.all().values()))

    # Step 2: Group BatchTracking by block_mt_id and sum the kg_qty
    batch_tracking_grouped = batch_tracking_df.groupby('block_mt_id', as_index=False)['kg_qty'].sum()


    # Step 3: Merge the grouped BatchTracking data with Blockmt on block_mt_id
    merged_df = pd.merge(blockmt_df, batch_tracking_grouped, on='block_mt_id', how='left')

    # Convert 'weight' to float to match the type of 'kg_qty'
    merged_df['remaining'] = merged_df['weight'].astype(float) - merged_df['kg_qty'].fillna(0).astype(float)


    # Step 4: Calculate the remaining weight
    merged_df['remaining'] = merged_df['weight'] - merged_df['kg_qty'].fillna(0)

    # Step 5: Convert the result to a dictionary
    result_dict = merged_df.to_dict(orient='records')

    return result_dict

def balance_after_hold_material_use_autofill22():
    # Read data from Django models into DataFrames
    blockmt_df = pd.DataFrame(list(Blockmt.objects.all().values()))
    batch_tracking_df = pd.DataFrame(list(BatchTracking.objects.all().values()))
    
    # Group BatchTracking by batch_number and aggregate required fields
    batch_tracking_grouped = batch_tracking_df.groupby('block_mt_id', as_index=False).agg({
        
        'heat_no': 'first',
        'rack_no': 'first',
        'component_no': 'first',
        'customer': 'first',
        'material_grade': 'first',
        'bardia': 'first',
        'kg_qty': 'sum'  # Sum up the kg_qty per batch
    })
    
    # Merge with Blockmt data to get the corresponding block_mt_id details
    merged_df = pd.merge(batch_tracking_grouped, blockmt_df, on='block_mt_id', how='left')
    
    # Compute remaining weight
    merged_df['remaining'] = merged_df['weight'].astype(float) - merged_df['kg_qty'].fillna(0).astype(float)
    
    # Select required fields, including target (pcs) from Blockmt
    merged_df = merged_df[['block_mt_id', 'heat_no']]
    
    
    # Convert the result to a dictionary
    result_dict = merged_df.to_dict(orient='records')
    
    return result_dict

def get_part_details3(request):
    block_mt_id = request.GET.get('block_mt_id', '').strip().lower()

    # Get the preprocessed data from the balance_after_hold_material_use_autofill function
    preprocessed_data = balance_after_hold_material_use_autofill()

    # Find the matching part in the preprocessed data
    matching_part = next(
        (part for part in preprocessed_data if part['block_mt_id'].strip().lower() == block_mt_id),
        None
    )

    if matching_part and matching_part['remaining'] > 0:
        data = {
            'component': matching_part['component'],
            'customer': matching_part['customer'],
            'grade': matching_part['grade'],  # Adjust based on your needs
            'standerd': matching_part['standerd'],
            'heatno': matching_part['heatno'],
            'dia': matching_part['dia'],
            'rack_no': matching_part['rack_no'],  # Adjust based on your needs
            'pices': matching_part['pices'],
            'weight': matching_part['weight'],
            'remaining': matching_part['remaining'],
            'supplier': matching_part['supplier'],
            'line': matching_part['line'],
        }
        return JsonResponse(data)
    else:
        return JsonResponse({'error': 'No matching part found or weight is zero'}, status=404)
    
def autocomplete5(request):
    if 'block_mt_id' in request.GET:
        term = request.GET.get('block_mt_id').strip().lower()  # Convert the search term to lowercase and trim spaces

        # Get the preprocessed data
        preprocessed_data = balance_after_hold_material_use_autofill()

        # Filter the data based on the term and weight > 0
        components = [
            part['block_mt_id']
            for part in preprocessed_data
            if part['remaining'] > 0 and term in part['block_mt_id'].strip().lower()
        ]

        # Remove duplicates and sort the list
        unique_components = sorted(set(components))

        return JsonResponse(unique_components, safe=False)
    return JsonResponse([], safe=False)  # Return an empty list if no term is provided


def autocompleteforging(request):
    if 'block_mt_id' in request.GET:
        term = request.GET.get('block_mt_id').strip().lower()  # Convert the search term to lowercase and trim spaces

        # Get the preprocessed data
        preprocessed_data = balance_after_hold_material_use_autofill22()

        # Filter the data based on the term
        components = [
            part['block_mt_id']
            for part in preprocessed_data
            if term in part['block_mt_id'].strip().lower()
        ]

        # Remove duplicates and sort the list
        unique_components = sorted(set(components))

        return JsonResponse(unique_components, safe=False)
    return JsonResponse([], safe=False)  # Return an empty list if no term is provided

def get_part_detailsforging(request):
    block_mt_id = request.GET.get('block_mt_id', '').strip().lower()

    # Get the preprocessed data from the balance_after_hold_material_use_autofill function
    preprocessed_data = balance_after_hold_material_use_autofill()

    # Find the matching part in the preprocessed data
    matching_part = next(
        (part for part in preprocessed_data if part['block_mt_id'].strip().lower() == block_mt_id),
        None
    )

    if matching_part:
        data = {
            'component': matching_part['component'],
            'customer': matching_part['customer'],
            'grade': matching_part['grade'],  # Adjust based on your needs
            'standerd': matching_part['standerd'],
            'heatno': matching_part['heatno'],
            'dia': matching_part['dia'],
            'rack_no': matching_part['rack_no'],  # Adjust based on your needs
            'pices': matching_part['pices'],
            'weight': matching_part['weight'],
            'remaining': matching_part['remaining'],
            'supplier': matching_part['supplier'],
            'line': matching_part['line'],
        }
        return JsonResponse(data)
    else:
        return JsonResponse({'error': 'No matching part found'}, status=404)




from rest_framework import viewsets
from .models import Supplier, Grade, Customer, TypeOfMaterial, MaterialType
from .serializers import SupplierSerializer, GradeSerializer, Customer1Serializer, TypeOfMaterialSerializer, MaterialTypeSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = Customer1Serializer

class TypeOfMaterialViewSet(viewsets.ModelViewSet):
    queryset = TypeOfMaterial.objects.all()
    serializer_class = TypeOfMaterialSerializer

class MaterialTypeViewSet(viewsets.ModelViewSet):
    queryset = MaterialType.objects.all()
    serializer_class = MaterialTypeSerializer


class BatchTrackingListView(APIView):
    def get(self, request):
        # Query all BatchTracking records
        batch_tracking_records = BatchTracking.objects.all()
        
        # Serialize the data
        serializer = BatchTrackingSerializer(batch_tracking_records, many=True)
        
        # Return the serialized data
        return Response(serializer.data, status=status.HTTP_200_OK)
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from itertools import chain
from .models import Blockmt, rmreciveinbatch, BatchTracking
from .serializers import BlockmtSerializer

class BlockmtAPI(APIView):
    def get(self, request, *args, **kwargs):
        queryset = Blockmt.objects.all()

        # Get filter parameters from the GET request
        block_mt_id = request.GET.get('block_mt_id', None)
        grade = request.GET.get('grade', None)
        heatno = request.GET.get('heatno', None)
        component = request.GET.get('component', None)

        # Apply filters based on GET parameters
        if block_mt_id:
            queryset = queryset.filter(block_mt_id__icontains=block_mt_id)
        if component:
            queryset = queryset.filter(component__icontains=component)
        if grade:
            queryset = queryset.filter(grade__icontains=grade)
        if heatno:
            queryset = queryset.filter(heatno__icontains=heatno)

        filtered_data = []

        for block in queryset:
            # Calculate the received weight from rmreciveinbatch for this block_mt_id
            received_weight = rmreciveinbatch.objects.filter(block_mt_id=block.block_mt_id).aggregate(Sum('weight'))['weight__sum'] or 0
            received_pcs = rmreciveinbatch.objects.filter(block_mt_id=block.block_mt_id).aggregate(Sum('pcs'))['pcs__sum'] or 0

            # Calculate remaining weight
            remaining_weight1 = round(block.weight - received_weight, 2)
            remainingpcs = round(block.pices - received_pcs, 2)

            total_batch_weight = BatchTracking.objects.filter(block_mt_id=block.block_mt_id).aggregate(Sum('kg_qty'))['kg_qty__sum'] or 0
            total_batch_weight1 = total_batch_weight - received_weight

            # Ensure total_batch_weight1 is not negative
            if total_batch_weight1 < 0:
                total_batch_weight1 = 0

            remaining_weight = round(remaining_weight1 - total_batch_weight1, 2)

            if remaining_weight > 20:
                received_records = rmreciveinbatch.objects.filter(block_mt_id=block.block_mt_id).values(
                    'created_at', 'verified_by', 'weight', 'pcs', 'rack_no'
                )
                for record in received_records:
                    record['type'] = 'received'

                batch_tracking_records = BatchTracking.objects.filter(block_mt_id=block.block_mt_id).values(
                    'batch_number', 'created_at', 'line', 'kg_qty', 'verified_by'
                )
                for record in batch_tracking_records:
                    record['Issu Id'] = record.pop('batch_number')  # Rename 'batch_number' to 'Issu_Id'
                    record['Issu RM(KG)'] = record.pop('kg_qty')
                    record['Verified By'] = record.pop('verified_by')
                    record['Line'] = record.pop('line')
                    record['type'] = 'Issue'
                    
                # Combine both sets of records
                records = list(chain(received_records, batch_tracking_records))

                # Add block details and records to the response
                block_data = BlockmtSerializer(block).data
                block_data['remaining_weight'] = remaining_weight
                block_data['remainingpcs'] = remainingpcs
                block_data['records'] = records

                filtered_data.append(block_data)

        return Response(filtered_data, status=status.HTTP_200_OK)
    
from django.core.paginator import Paginator
from django.db.models import Sum
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from itertools import chain

from .models import Blockmt, rmreciveinbatch, BatchTracking
from .serializers import BlockmtSerializer


@method_decorator(cache_page(60 * 5), name='dispatch')  # Cache response for 5 minutes
class BlockmtAPI1(APIView):
    def get(self, request, *args, **kwargs):
        queryset = Blockmt.objects.all().select_related().prefetch_related()

        # Get filter parameters from the request
        block_mt_id = request.GET.get('block_mt_id')
        grade = request.GET.get('grade')
        heatno = request.GET.get('heatno')
        component = request.GET.get('component')

        # Apply filters dynamically
        if block_mt_id:
            queryset = queryset.filter(block_mt_id__icontains=block_mt_id)
        if component:
            queryset = queryset.filter(component__icontains=component)
        if grade:
            queryset = queryset.filter(grade__icontains=grade)
        if heatno:
            queryset = queryset.filter(heatno__icontains=heatno)

        # Implement Pagination (20 records per page)
        page_number = request.GET.get('page', 1)
        paginator = Paginator(queryset, 20)
        page_obj = paginator.get_page(page_number)

        filtered_data = []

        for block in page_obj:
            # Get received weight and pieces
            received_data = rmreciveinbatch.objects.filter(block_mt_id=block.block_mt_id).aggregate(
                total_weight=Sum('weight'), total_pcs=Sum('pcs')
            )
            received_weight = received_data['total_weight'] or 0
            received_pcs = received_data['total_pcs'] or 0

            # Calculate remaining weight
            remaining_weight1 = round(block.weight - received_weight, 2)
            remainingpcs = round(block.pices - received_pcs, 2)

            total_batch_weight = BatchTracking.objects.filter(block_mt_id=block.block_mt_id).aggregate(
                total_kg_qty=Sum('kg_qty')
            )['total_kg_qty'] or 0
            total_batch_weight1 = max(total_batch_weight - received_weight, 0)

            remaining_weight = round(remaining_weight1 - total_batch_weight1, 2)

            # Get received records
            received_records = list(
                rmreciveinbatch.objects.filter(block_mt_id=block.block_mt_id).values(
                    'created_at', 'verified_by', 'weight', 'pcs', 'rack_no'
                )
            )
            for record in received_records:
                record['type'] = 'Received'

            # Get batch tracking records
            batch_tracking_records = list(
                BatchTracking.objects.filter(block_mt_id=block.block_mt_id).values(
                    'batch_number', 'created_at', 'line', 'kg_qty', 'verified_by'
                )
            )
            for record in batch_tracking_records:
                record['Issu Id'] = record.pop('batch_number')
                record['Issu RM(KG)'] = record.pop('kg_qty')
                record['Verified By'] = record.pop('verified_by')
                record['Line'] = record.pop('line')
                record['type'] = 'Issue'

            # Combine records
            records = received_records + batch_tracking_records

            # Serialize block data
            block_data = BlockmtSerializer(block).data
            block_data.update({
                'remaining_weight': remaining_weight,
                'remainingpcs': remainingpcs,
                'records': records,
            })

            filtered_data.append(block_data)

        return Response({
            'data': filtered_data,
            'total_pages': paginator.num_pages,
            'current_page': page_number
        }, status=status.HTTP_200_OK)




# ViewSet for the Schedule model
class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import pandas as pd
from cnc.models import machining
from fi.models import Fi
from forging.models import Forging
from heat_treatment.models import HeatTreatment
from marking.models import marking
from pre_mc.models import pre_mc
from shot_blast.models import Shotblast
from visual.models import Visual


class TraceabilityCardView(APIView):
    def post(self, request):
        batch_number = request.data.get('batch_number')
        if not batch_number:
            return Response({"error": "Batch number is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Initialize the response data structure
        response_data = {
            'batch_number': batch_number,
            'component': None,
            'Blockmt_qs': None,
            'batch_tracking_df': None,
            'forging_df': None,
            'total_production_p': None,
            'heat_treatment_df': None,
            'total_production_ht': None,
            'Shotblast_df': None,
            'total_production_sh': None,
            'pre_mc_df': None,
            'total_production_pri': None,
            'marking_df': None,
            'total_production_mr': None,
            'fi_df': None,
            'total_production_fi': None,
            'visual_df': None,
            'total_production_v': None,
            'cnc_df': None,
            'total_production_c': None,
            'dispatch_df': None,
            'total_dispatch_df': None,
        }

        # Fetch data from Blockmt model
        Blockmt_qs = Blockmt.objects.filter(block_mt_id=batch_number)
        if Blockmt_qs.exists():
            Blockmt_df = pd.DataFrame(list(Blockmt_qs.values()))
            response_data['Blockmt_qs'] = Blockmt_df.to_dict(orient='records')
            response_data['component'] = Blockmt_df['component'].unique().tolist()

        # Fetch data from BatchTracking model
        batch_tracking_qs = BatchTracking.objects.filter(block_mt_id=batch_number)
        if batch_tracking_qs.exists():
            batch_tracking_df = pd.DataFrame(list(batch_tracking_qs.values()))
            response_data['batch_tracking_df'] = batch_tracking_df.to_dict(orient='records')

        # Fetch data from Forging model
        forging_qs = Forging.objects.filter(batch_number=batch_number)
        if forging_qs.exists():
            forging_df = pd.DataFrame(list(forging_qs.values()))
            response_data['forging_df'] = forging_df.to_dict(orient='records')
            response_data['total_production_p'] = forging_df['production'].sum()

        # Fetch data from HeatTreatment model
        heat_treatment_qs = HeatTreatment.objects.filter(batch_number=batch_number)
        if heat_treatment_qs.exists():
            heat_treatment_df = pd.DataFrame(list(heat_treatment_qs.values()))
            response_data['heat_treatment_df'] = heat_treatment_df.to_dict(orient='records')
            response_data['total_production_ht'] = heat_treatment_df['production'].sum()

        # Fetch data from Shotblast model
        Shotblast_qs = Shotblast.objects.filter(batch_number=batch_number)
        if Shotblast_qs.exists():
            Shotblast_df = pd.DataFrame(list(Shotblast_qs.values()))
            response_data['Shotblast_df'] = Shotblast_df.to_dict(orient='records')
            response_data['total_production_sh'] = Shotblast_df['no_of_pic'].sum()

        # Fetch data from pre_mc model
        pre_mc_qs = pre_mc.objects.filter(batch_number=batch_number)
        if pre_mc_qs.exists():
            pre_mc_df = pd.DataFrame(list(pre_mc_qs.values()))
            response_data['pre_mc_df'] = pre_mc_df.to_dict(orient='records')
            response_data['total_production_pri'] = pre_mc_df['qty'].sum()

        # Fetch data from marking model
        marking_qs = marking.objects.filter(batch_number=batch_number)
        if marking_qs.exists():
            marking_df = pd.DataFrame(list(marking_qs.values()))
            response_data['marking_df'] = marking_df.to_dict(orient='records')
            response_data['total_production_mr'] = marking_df['qty'].sum()

        # Fetch data from Fi model
        fi_qs = Fi.objects.filter(batch_number=batch_number)
        if fi_qs.exists():
            fi_df = pd.DataFrame(list(fi_qs.values()))
            response_data['fi_df'] = fi_df.to_dict(orient='records')
            response_data['total_production_fi'] = fi_df['production'].sum()

        # Fetch data from Visual model
        visual_qs = Visual.objects.filter(batch_number=batch_number)
        if visual_qs.exists():
            visual_df = pd.DataFrame(list(visual_qs.values()))
            response_data['visual_df'] = visual_df.to_dict(orient='records')
            response_data['total_production_v'] = visual_df['production'].sum()

        # Fetch data from machining model
        cnc_qs = machining.objects.filter(batch_number=batch_number)
        if cnc_qs.exists():
            cnc_df = pd.DataFrame(list(cnc_qs.values()))
            response_data['cnc_df'] = cnc_df.to_dict(orient='records')
            response_data['total_production_c'] = cnc_df[cnc_df['setup'] == 'II']['production'].sum()

        # Fetch data from dispatch model
        dispatch_qs = dispatch.objects.filter(batch_number=batch_number)
        if dispatch_qs.exists():
            dispatch_df = pd.DataFrame(list(dispatch_qs.values()))
            response_data['dispatch_df'] = dispatch_df.to_dict(orient='records')
            response_data['total_dispatch_df'] = dispatch_df['pices'].sum()

        return Response(response_data, status=status.HTTP_200_OK)
    
from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pandas as pd

class TraceabilityCardView2(APIView):
    def post(self, request):
        component_number = request.data.get('component_number')
        days_before = request.data.get('days_before', None)

        if not component_number:
            return Response({"error": "Component number is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Determine the date threshold based on `days_before`
        date_threshold = timezone.now() - timedelta(days=days_before) if days_before else None

        # Initialize the response data structure
        response_data = {
            'component_number': component_number,
            'components': None,
            'Blockmt_qs': None,
            'batch_tracking_df': None,
            'forging_df': None,
            'total_production_p': None,
            'heat_treatment_df': None,
            'total_production_ht': None,
            'Shotblast_df': None,
            'total_production_sh': None,
            'pre_mc_df': None,
            'total_production_pri': None,
            'marking_df': None,
            'total_production_mr': None,
            'fi_df': None,
            'total_production_fi': None,
            'visual_df': None,
            'total_production_v': None,
            'cnc_df': None,
            'total_production_c': None,
            'dispatch_df': None,
            'total_dispatch_df': None,
        }

        # Fetch data from Blockmt model with component_number and date_threshold filter
        Blockmt_qs = Blockmt.objects.filter(component=component_number)
        if date_threshold:
            Blockmt_qs = Blockmt_qs.filter(created_at__gte=date_threshold)  # Adjust `created_at` field as needed
        if Blockmt_qs.exists():
            Blockmt_df = pd.DataFrame(list(Blockmt_qs.values()))
            response_data['Blockmt_qs'] = Blockmt_df.to_dict(orient='records')
            response_data['components'] = Blockmt_df['component'].unique().tolist()

        # Fetch data from BatchTracking model with component_number and date_threshold filter
        batch_tracking_qs = BatchTracking.objects.filter(component_no=component_number)
        if date_threshold:
            batch_tracking_qs = batch_tracking_qs.filter(created_at__gte=date_threshold)
        if batch_tracking_qs.exists():
            batch_tracking_df = pd.DataFrame(list(batch_tracking_qs.values()))
            response_data['batch_tracking_df'] = batch_tracking_df.to_dict(orient='records')

        # Fetch data from Forging model with component_number and date_threshold filter
        forging_qs = Forging.objects.filter(component=component_number)
        if date_threshold:
            forging_qs = forging_qs.filter(date__gte=date_threshold)
        if forging_qs.exists():
            forging_df = pd.DataFrame(list(forging_qs.values()))
            forging_df = forging_df.fillna(0)  # Replace NaN with 0
            forging_df = forging_df.astype(object)  # Convert to object to avoid float errors
            response_data['forging_df'] = forging_df.to_dict(orient='records')
            response_data['total_production_p'] = forging_df['production'].sum(skipna=True) if 'production' in forging_df else 0

        # Fetch data from HeatTreatment model with component_number and date_threshold filter
        heat_treatment_qs = HeatTreatment.objects.filter(component=component_number)
        if date_threshold:
            heat_treatment_qs = heat_treatment_qs.filter(date__gte=date_threshold)
        if heat_treatment_qs.exists():
            heat_treatment_df = pd.DataFrame(list(heat_treatment_qs.values()))
            heat_treatment_df = heat_treatment_df.fillna(0)  # Replace NaN with 0
            heat_treatment_df = heat_treatment_df.astype(object)  # Convert to object to avoid float errors
            response_data['heat_treatment_df'] = heat_treatment_df.to_dict(orient='records')
            response_data['total_production_ht'] = heat_treatment_df['production'].sum(skipna=True) if 'production' in heat_treatment_df else 0

        # Fetch data from Shotblast model with component_number and date_threshold filter
        Shotblast_qs = Shotblast.objects.filter(component=component_number)
        if date_threshold:
            Shotblast_qs = Shotblast_qs.filter(date__gte=date_threshold)
        if Shotblast_qs.exists():
            Shotblast_df = pd.DataFrame(list(Shotblast_qs.values()))
            Shotblast_df = Shotblast_df.fillna(0)  # Replace NaN with 0
            Shotblast_df = Shotblast_df.astype(object)  # Convert to object to avoid float errors
            response_data['Shotblast_df'] = Shotblast_df.to_dict(orient='records')
            response_data['total_production_sh'] = Shotblast_df['no_of_pic'].sum(skipna=True) if 'no_of_pic' in Shotblast_df else 0

        # Fetch data from Pre-machining model with component_number and date_threshold filter
        pre_mc_qs = pre_mc.objects.filter(component=component_number)
        if date_threshold:
            pre_mc_qs = pre_mc_qs.filter(date__gte=date_threshold)
        if pre_mc_qs.exists():
            pre_mc_df = pd.DataFrame(list(pre_mc_qs.values()))
            pre_mc_df = pre_mc_df.fillna(0)  # Replace NaN with 0
            pre_mc_df = pre_mc_df.astype(object)  # Convert to object to avoid float errors
            response_data['pre_mc_df'] = pre_mc_df.to_dict(orient='records')
            response_data['total_production_pri'] = pre_mc_df['qty'].sum(skipna=True) if 'qty' in pre_mc_df else 0

        # Fetch data from Marking model with component_number and date_threshold filter
        marking_qs = marking.objects.filter(component=component_number)
        if date_threshold:
            marking_qs = marking_qs.filter(date__gte=date_threshold)
        if marking_qs.exists():
            marking_df = pd.DataFrame(list(marking_qs.values()))
            marking_df = marking_df.fillna(0)  # Replace NaN with 0
            marking_df = marking_df.astype(object)  # Convert to object to avoid float errors
            response_data['marking_df'] = marking_df.to_dict(orient='records')
            response_data['total_production_mr'] = marking_df['qty'].sum(skipna=True) if 'qty' in marking_df else 0

        # Fetch data from Fi (Final Inspection) model with component_number and date_threshold filter
        fi_qs = Fi.objects.filter(component=component_number)
        if date_threshold:
            fi_qs = fi_qs.filter(date__gte=date_threshold)
        if fi_qs.exists():
            fi_df = pd.DataFrame(list(fi_qs.values()))
            fi_df = fi_df.fillna(0)  # Replace NaN with 0
            fi_df = fi_df.astype(object)  # Convert to object to avoid float errors
            response_data['fi_df'] = fi_df.to_dict(orient='records')
            response_data['total_production_fi'] = fi_df['production'].sum(skipna=True) if 'production' in fi_df else 0

        # Fetch data from Visual Inspection model with component_number and date_threshold filter
        visual_qs = Visual.objects.filter(component=component_number)
        if date_threshold:
            visual_qs = visual_qs.filter(date__gte=date_threshold)
        if visual_qs.exists():
            visual_df = pd.DataFrame(list(visual_qs.values()))
            visual_df = visual_df.fillna(0)  # Replace NaN with 0
            visual_df = visual_df.astype(object)  # Convert to object to avoid float errors
            response_data['visual_df'] = visual_df.to_dict(orient='records')
            response_data['total_production_v'] = visual_df['production'].sum(skipna=True) if 'production' in visual_df else 0

        # Fetch data from Machining model with component_number and date_threshold filter
        cnc_qs = machining.objects.filter(component=component_number)
        if date_threshold:
            cnc_qs = cnc_qs.filter(date__gte=date_threshold)
        if cnc_qs.exists():
            cnc_df = pd.DataFrame(list(cnc_qs.values()))
            cnc_df = cnc_df.fillna(0)  # Replace NaN with 0
            cnc_df = cnc_df.astype(object)  # Convert to object to avoid float errors
            response_data['cnc_df'] = cnc_df.to_dict(orient='records')
            response_data['total_production_c'] = cnc_df[cnc_df['setup'] == 'II']['production'].sum(skipna=True) if 'production' in cnc_df else 0

        # Fetch data from Dispatch model with component_number and date_threshold filter
        dispatch_qs = dispatch.objects.filter(component=component_number)
        if date_threshold:
            dispatch_qs = dispatch_qs.filter(date__gte=date_threshold)
        if dispatch_qs.exists():
            dispatch_df = pd.DataFrame(list(dispatch_qs.values()))
            dispatch_df = dispatch_df.fillna(0)  # Replace NaN with 0
            dispatch_df = dispatch_df.astype(object)  # Convert to object to avoid float errors
            response_data['dispatch_df'] = dispatch_df.to_dict(orient='records')
            response_data['total_dispatch_df'] = dispatch_df['pices'].sum(skipna=True) if 'pices' in dispatch_df else 0

        return Response(response_data, status=status.HTTP_200_OK)




from rest_framework import generics
from .serializers import DispatchSerializer

class DispatchListCreateAPIView(generics.ListCreateAPIView):
    queryset = dispatch.objects.all()
    serializer_class = DispatchSerializer


from rest_framework import viewsets
from .serializers import MasterListSerializer

class MasterListViewSet(viewsets.ModelViewSet):
    queryset = Masterlist.objects.all()
    serializer_class = MasterListSerializer


from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone
from .models import Masterlist, dispatch
import calendar
from datetime import timedelta
from collections import defaultdict

def get_last_7_months():
    today = timezone.now()
    months = []
    for i in range(6, -1, -1):  # Get the last 7 months
        first_day_of_month = today.replace(day=1) - timedelta(days=i * 30)  # Rough estimate
        months.append(first_day_of_month.month)
    return months

def calculate_dispatch_tonnage(request):
    last_7_months = get_last_7_months()  # Get the last 7 months
    # Initialize the result dictionary, using defaultdict to automatically create a dict for each month and customer
    result = defaultdict(lambda: defaultdict(lambda: {'tonnage': 0, 'cost': 0}))

    # Step 1: Loop through dispatches and calculate tonnage and cost for each
    dispatch_entries = dispatch.objects.filter(date__month__in=last_7_months)
    for entry in dispatch_entries:
        # Get the corresponding slug_weight and ring_weight from Masterlist for the component
        try:
            master_entry = Masterlist.objects.get(component=entry.component)
            tonnage = (master_entry.slug_weight * entry.pices) / 1000  # Calculate tonnage
            cost = master_entry.cost * entry.pices  # Calculate cost

            month = entry.date.month
            customer = master_entry.customer  # Get the customer from the Masterlist

            # Ensure result[month][customer] is a dictionary and not a decimal
            result[month][customer]['tonnage'] += tonnage
            result[month][customer]['cost'] += cost
        except Masterlist.DoesNotExist:
            continue  # If there's no matching entry in Masterlist, skip

    # Step 2: Ensure all months are included (even if they have no dispatches)
    response_data = {}
    for month in last_7_months:
        month_name = calendar.month_name[month]  # Get the name of the month
        customer_data = result[month]  # Get the tonnage and cost data for each customer for the month
        response_data[month_name] = customer_data

    return JsonResponse(response_data)


from django.db.models import Count, F


class BatchTrackingView(APIView):
    def get(self, request):
        component_no = request.GET.get("component_no")
        heat_no = request.GET.get("heat_no")
        batch_number = request.GET.get("batch_number")

        # Filtering based on provided parameters
        filters = {}
        if batch_number:
            filters["batch_number__icontains"] = batch_number  # Partial matching
        if component_no:
            filters["component_no__icontains"] = component_no  # Partial matching
        if heat_no:
            filters["heat_no__icontains"] = heat_no  # Partial matching

        # Query with optimization
        queryset = (
            BatchTracking.objects.filter(**filters)
            .values("block_mt_id")
            .annotate(
                customer=F("customer"),
                material_grade=F("material_grade"),
                bardia=F("bardia"),
                component_no=F("component_no"),
                heat_no=F("heat_no"),
                rack_no=F("rack_no"),
                line=F("line"),
            )
            .distinct()
        )

        return Response(queryset)
    
from django.utils.timezone import now
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
# class ForgingQualityReportAPIView(APIView):
#     def get(self, request):
#         # Get filter parameters
#         start_date = request.GET.get("start_date")  # YYYY-MM-DD
#         end_date = request.GET.get("end_date")  # YYYY-MM-DD

#         # Default to current month if no date provided
#         if not start_date and not end_date:
#             today = now()
#             start_date = today.replace(day=1)
#             end_date = today
#         else:
#             try:
#                 start_date = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
#                 end_date = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
#             except ValueError:
#                 return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
#         # Query data with filters
#         forging_qs = Forging.objects.filter(date__range=[start_date, end_date])
#         machining_qs = machining.objects.filter(date__range=[start_date, end_date])
#         fi_qs = Fi.objects.filter(date__range=[start_date, end_date])
#         visual_qs = Visual.objects.filter(date__range=[start_date, end_date])

#         # Get all unique components from both Forging and Machining
#         forging_components = set(forging_qs.values_list("component", flat=True))
#         cnc_components = set(machining_qs.values_list("component", flat=True))
#         all_components = forging_components.union(cnc_components)

#         component_data = {}
#         total_production_sum = 0
#         total_rejection_sum = 0
#         total_forging_rejection_sum = 0
#         total_machining_rejection_sum = 0

#         for component in all_components:
#             total_production = forging_qs.filter(component=component).aggregate(total=Sum("production"))["total"] or 0
#             total_production_sum += total_production

#             # Forging Rejections
#             total_forging_rejection = forging_qs.filter(component=component).aggregate(
#                 total=Sum(F("up_setting") + F("half_piercing") + F("full_piercing") +
#                           F("ring_rolling") + F("sizing") + F("overheat") + F("bar_crack_pcs"))
#             )["total"] or 0
#             forging_fi_rejection = fi_qs.filter(component=component).aggregate(
#                 total=Sum(F("forging_height") + F("forging_od") + F("forging_bore") +
#                           F("forging_crack") + F("forging_dent"))
#             )["total"] or 0
#             forging_visual_rejection = visual_qs.filter(component=component).aggregate(
#                 total=Sum(F("forging_height") + F("forging_od") + F("forging_bore") +
#                           F("forging_crack") + F("forging_dent"))
#             )["total"] or 0
#             overall_forging_rejection = total_forging_rejection + forging_fi_rejection + forging_visual_rejection
#             total_forging_rejection_sum += overall_forging_rejection

#             # CNC Rejections (Handle missing CNC components)
#             total_cnc_rejection = machining_qs.filter(component=component).aggregate(
#                 total=Sum(F("cnc_height") + F("cnc_od") + F("cnc_bore") +
#                           F("cnc_groove") + F("cnc_dent"))
#             )["total"] or 0
#             total_pre_mc_cnc_rejection = machining_qs.filter(component=component).aggregate(
#                 total=Sum(F("pre_mc_bore") + F("pre_mc_od") + F("pre_mc_height") 
#                           )
#             )["total"] or 0
#             cnc_fi_rejection = fi_qs.filter(component=component).aggregate(
#                 total=Sum(F("cnc_height") + F("cnc_od") + F("cnc_bore") +
#                           F("cnc_groove") + F("cnc_dent"))
#             )["total"] or 0
#             total_pre_mc_fi_rejection = fi_qs.filter(component=component).aggregate(
#                 total=Sum(F("pre_mc_bore") + F("pre_mc_od") + F("pre_mc_height") 
#                           )
#             )["total"] or 0
#             cnc_visual_rejection = visual_qs.filter(component=component).aggregate(
#                 total=Sum(F("cnc_height") + F("cnc_od") + F("cnc_bore") +
#                           F("cnc_groove") + F("cnc_dent") + F("cnc_rust"))
#             )["total"] or 0
#             total_pre_mc_visual_rejection = visual_qs.filter(component=component).aggregate(
#                 total=Sum(F("pre_mc_bore") + F("pre_mc_od") + F("pre_mc_height") 
#                           )
#             )["total"] or 0
#             overall_cnc_rejection = total_cnc_rejection + cnc_fi_rejection + cnc_visual_rejection +total_pre_mc_visual_rejection+total_pre_mc_fi_rejection+total_pre_mc_cnc_rejection
#             total_machining_rejection_sum += overall_cnc_rejection

#             # Total Rejection Calculation
#             total_rejection = overall_forging_rejection + overall_cnc_rejection
#             total_rejection_sum += total_rejection
#             rejection_percentage = (total_rejection / total_production * 100) if total_production > 0 else 0
#             rejection_ppm = (total_rejection / total_production * 1_000_000) if total_production > 0 else 0

#             component_data[component] = {
#                 "total_production": total_production,
#                 "forging_rejections": {
#                     "only_forging": total_forging_rejection,
#                     "fi_forging": forging_fi_rejection,
#                     "visual_forging": forging_visual_rejection,
#                     "overall_forging": overall_forging_rejection,
#                 },
#                 "cnc_rejections": {
#                     "only_cnc": total_cnc_rejection,
#                     "fi_cnc": cnc_fi_rejection,
#                     "visual_cnc": cnc_visual_rejection,
#                     "overall_cnc": overall_cnc_rejection,
#                 },
#                 "total_rejection": total_rejection,
#                 "rejection_percentage": round(rejection_percentage, 2),
#                 "rejection_ppm": round(rejection_ppm),
#             }

#         overall_rejection_percentage = (total_rejection_sum / total_production_sum * 100) if total_production_sum > 0 else 0
#         overall_rejection_ppm = (total_rejection_sum / total_production_sum * 1_000_000) if total_production_sum > 0 else 0

#         summary_data = {
#             "total_production": total_production_sum,
#             "total_rejection": total_rejection_sum,
#             "total_forging_rejection": total_forging_rejection_sum,
#             "total_machining_rejection": total_machining_rejection_sum,
#             "overall_rejection_percentage": round(overall_rejection_percentage, 2),
#             "overall_rejection_ppm": round(overall_rejection_ppm),
#         }

#         return Response({"components": component_data, "summary": summary_data}, status=status.HTTP_200_OK)

from django.db.models import Sum, Case, When, F, IntegerField


from django.db.models import Sum, Case, When, F, IntegerField
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from django.db.models import Case, When, F, Value, IntegerField

from django.db.models import Sum, Case, When, Value, IntegerField, F
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
class ForgingQualityReportAPIView(APIView):
    def get(self, request):
        def parse_date(date_str):
            try:
                return datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return None

        def calculate_rejection_percent(rejection, production):
            return round(rejection / production * 100, 2) if production else 0


        def aggregate_data(qs, fields, component_field='component'):
            return qs.values(component_field).annotate(
                total_production=Sum("production"),
                total_target=Sum("target"),
                total_production_day=Sum(Case(When(shift="day", then=F("production")), default=Value(0), output_field=IntegerField())),
                total_target_day=Sum(Case(When(shift="day", then=F("target")), default=Value(0), output_field=IntegerField())),
                total_production_night=Sum(Case(When(shift="night", then=F("production")), default=Value(0), output_field=IntegerField())),
                total_target_night=Sum(Case(When(shift="night", then=F("target")), default=Value(0), output_field=IntegerField())),
                **{f'total_{field}': Sum(field) for field in fields}
            )

        def process_section_data(aggregated_data, masterlist_data, rejection_fields, section_name, qs=None, unique_fields=None):
            section_data = {}
            total_production = 0
            total_target = 0
            total_production_day = 0
            total_production_night = 0
            total_target_day = 0
            total_target_night = 0
            total_rejection = 0
            total_rejection_cost = 0

            for item in aggregated_data:
                component = item['component']
                production = item.get('total_production', 0) or 0
                target = item.get('total_target', 0) or 0
                production_day = item.get('total_production_day', 0) or 0
                production_night = item.get('total_production_night', 0) or 0
                target_day = item.get('total_target_day', 0) or 0
                target_night = item.get('total_target_night', 0) or 0
                cost_per_piece = masterlist_data.get(component, {}).get("cost", 0)

                total_production += production
                total_target += target
                total_production_day += production_day
                total_production_night += production_night
                total_target_day += target_day
                total_target_night += target_night

                rejection_reasons = {field: item.get(f'total_{field}', 0) or 0 for field in rejection_fields}
                total_component_rejection = sum(rejection_reasons.values())
                total_rejection += total_component_rejection

                rejection_cost = total_component_rejection * cost_per_piece
                total_rejection_cost += rejection_cost

                rejection_percent = calculate_rejection_percent(total_component_rejection, production)

                section_data[component] = {
                    "production": production,  # Total production (day + night)
                    "target": target,  # Total target (day + night)
                    "production_day": production_day,
                    "production_night": production_night,
                    "target_day": target_day,
                    "target_night": target_night,
                    f"{section_name}_rejection": total_component_rejection,
                    "rejection_percent": round(rejection_percent, 2),
                    "rejection_cost": rejection_cost,
                    "customer": masterlist_data.get(component, {}).get("customer", "N/A"),
                    "cost_per_piece": cost_per_piece,
                    "rejection_reasons": rejection_reasons,
                }

                # Add unique fields if provided
                if qs and unique_fields:
                    for field in unique_fields:
                        unique_values = list(qs.filter(component=component).values_list(field, flat=True).distinct())
                        section_data[component][f"unique_{field}s"] = unique_values

            return section_data, total_production, total_target, total_production_day, total_production_night, total_target_day, total_target_night, total_rejection, total_rejection_cost

        # Get filter parameters
        start_date = request.GET.get("start_date")  # YYYY-MM-DD
        end_date = request.GET.get("end_date")  # YYYY-MM-DD

        # Default to yesterday if no date provided
        today = now().date()
        start_date = parse_date(start_date) or today - timedelta(days=1)
        end_date = parse_date(end_date) or start_date

        if not start_date or not end_date:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch all relevant data in a single query for each model, applying date filters
        forging_qs = Forging.objects.filter(date__range=[start_date, end_date])
        machining_qs = machining.objects.filter(date__range=[start_date, end_date])
        fi_qs = Fi.objects.filter(date__range=[start_date, end_date])
        visual_qs = Visual.objects.filter(date__range=[start_date, end_date])

        # Fetch masterlist data and store in a dictionary for fast lookup
        masterlist_data = {m.component: {"customer": m.customer, "cost": m.cost} for m in Masterlist.objects.all()}

        # FORGING SECTION
        forging_fields = ['up_setting', 'half_piercing', 'full_piercing', 'ring_rolling', 'sizing', 'overheat', 'bar_crack_pcs']
        forging_aggregated = aggregate_data(forging_qs, forging_fields)
        forging_data, total_forging_production, total_forging_target, total_forging_production_day, total_forging_production_night, total_forging_target_day, total_forging_target_night, total_forging_rejection, total_forging_rejection_cost = process_section_data(
            forging_aggregated, masterlist_data, forging_fields, "forging", qs=forging_qs, unique_fields=["forman", "line"])

        # FI SECTION
        fi_fields = ['cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 'cnc_dent', 'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 'forging_dent', 'pre_mc_bore', 'pre_mc_od', 'pre_mc_height', 'rust']
        fi_aggregated = aggregate_data(fi_qs, fi_fields)
        fi_data, total_fi_production, total_fi_target, total_fi_production_day, total_fi_production_night, total_fi_target_day, total_fi_target_night, total_fi_rejection, total_fi_rejection_cost = process_section_data(
            fi_aggregated, masterlist_data, fi_fields, "fi")

        # VISUAL SECTION
        visual_fields = ['cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 'cnc_dent', 'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 'forging_dent', 'pre_mc_bore', 'pre_mc_od', 'pre_mc_height', 'cnc_rust']
        visual_aggregated = aggregate_data(visual_qs, visual_fields)
        visual_data, total_visual_production, total_visual_target, total_visual_production_day, total_visual_production_night, total_visual_target_day, total_visual_target_night, total_visual_rejection, total_visual_rejection_cost = process_section_data(
            visual_aggregated, masterlist_data, visual_fields, "visual")

        cnc_machining_qs = machining_qs.filter(mc_type='CNC')

        machining_fields = ['cnc_height', 'cnc_od', 'cnc_bore', 'cnc_groove', 'cnc_dent', 
                            'forging_height', 'forging_od', 'forging_bore', 'forging_crack', 
                            'forging_dent', 'pre_mc_bore', 'pre_mc_od', 'pre_mc_height']

        machining_aggregated = cnc_machining_qs.values('component').annotate(
            total_production=Sum(Case(When(setup='II', then=F("production")), default=Value(0), output_field=IntegerField())),
            total_target=Sum(Case(When(setup='II', then=F("target")), default=Value(0), output_field=IntegerField())),
            total_production_day=Sum(Case(When(shift="day", setup='II', then=F("production")), default=Value(0), output_field=IntegerField())),
            total_target_day=Sum(Case(When(shift="day", setup='II', then=F("target")), default=Value(0), output_field=IntegerField())),
            total_production_night=Sum(Case(When(shift="night", setup='II', then=F("production")), default=Value(0), output_field=IntegerField())),
            total_target_night=Sum(Case(When(shift="night", setup='II', then=F("target")), default=Value(0), output_field=IntegerField())),
            **{f'total_{field}': Sum(field) for field in machining_fields}
        )

        machining_data, total_machining_production, total_machining_target, total_machining_production_day, \
        total_machining_production_night, total_machining_target_day, total_machining_target_night, \
        total_machining_rejection, total_machining_rejection_cost = process_section_data(
            machining_aggregated, masterlist_data, machining_fields, "machining", qs=cnc_machining_qs, unique_fields=["machine_no"]
        )
        # Identify components in Visual and FI but not in Machining
        visual_components = set(visual_data.keys())
        fi_components = set(fi_data.keys())
        machining_components = set(machining_data.keys())

        missing_components = (visual_components | fi_components) - machining_components

        # Add missing components to machining_data with production and target set to 0
        for component in missing_components:
            machining_data[component] = {
                "production": 0,
                "target": 0,
                "production_day": 0,
                "production_night": 0,
                "target_day": 0,
                "target_night": 0,
                "machining_rejection": 0,
                "rejection_percent": 0,
                "rejection_cost": 0,
                "customer": masterlist_data.get(component, {}).get("customer", "N/A"),
                "cost_per_piece": masterlist_data.get(component, {}).get("cost", 0),
                "rejection_reasons": {field: 0 for field in machining_fields},
                "unique_machine_nos": ["NA"]
            }

        # Add rejection values from FI and Visual to Machining for each component
        for component in machining_data:
            # Get rejection reasons from FI and Visual for this component
            fi_rejection_reasons = fi_data.get(component, {}).get("rejection_reasons", {})
            visual_rejection_reasons = visual_data.get(component, {}).get("rejection_reasons", {})

            # Add FI and Visual rejection values to Machining
            for field, value in fi_rejection_reasons.items():
                if field in machining_data[component]["rejection_reasons"]:
                    machining_data[component]["rejection_reasons"][field] += value
                else:
                    machining_data[component]["rejection_reasons"][field] = value

            for field, value in visual_rejection_reasons.items():
                if field in machining_data[component]["rejection_reasons"]:
                    machining_data[component]["rejection_reasons"][field] += value
                else:
                    machining_data[component]["rejection_reasons"][field] = value

            # Update total rejection for Machining
            total_component_rejection = sum(machining_data[component]["rejection_reasons"].values())
            machining_data[component]["machining_rejection"] = total_component_rejection
            machining_data[component]["rejection_percent"] = calculate_rejection_percent(total_component_rejection, machining_data[component]["production"])

        # Calculate rejection percentages
        forging_rejection_percent = calculate_rejection_percent(total_forging_rejection, total_forging_production)
        machining_rejection_percent = calculate_rejection_percent(total_machining_rejection, total_machining_production)

        # BROCH SECTION
        broch_aggregated = machining_qs.filter(setup="broch").values('component').annotate(
            total_production=Sum("production"),
            total_target=Sum("target"),
            total_production_day=Sum(Case(When(shift="day", then=F("production")), default=Value(0), output_field=IntegerField())),
            total_target_day=Sum(Case(When(shift="day", then=F("target")), default=Value(0), output_field=IntegerField())),
            total_production_night=Sum(Case(When(shift="night", then=F("production")), default=Value(0), output_field=IntegerField())),
            total_target_night=Sum(Case(When(shift="night", then=F("target")), default=Value(0), output_field=IntegerField())),
            **{f'total_{field}': Sum(field) for field in machining_fields}
        )
        broch_data, total_broch_production, total_broch_target, total_broch_production_day, total_broch_production_night, total_broch_target_day, total_broch_target_night, total_broch_rejection, total_broch_rejection_cost = process_section_data(
            broch_aggregated, masterlist_data, machining_fields, "broch", qs=machining_qs.filter(setup="broch"), unique_fields=["machine_no"])

        # VMC SECTION
        vmv_aggregated = machining_qs.filter(mc_type="vmc").values('component').annotate(
            total_production=Sum("production"),
            total_target=Sum("target"),
            total_production_day=Sum(Case(When(shift="day", then=F("production")), default=Value(0), output_field=IntegerField())),
            total_target_day=Sum(Case(When(shift="day", then=F("target")), default=Value(0), output_field=IntegerField())),
            total_production_night=Sum(Case(When(shift="night", then=F("production")), default=Value(0), output_field=IntegerField())),
            total_target_night=Sum(Case(When(shift="night", then=F("target")), default=Value(0), output_field=IntegerField())),
            **{f'total_{field}': Sum(field) for field in machining_fields}
        )
        vmv_data, total_vmv_production, total_vmv_target, total_vmv_production_day, total_vmv_production_night, total_vmv_target_day, total_vmv_target_night, total_vmv_rejection, total_vmv_rejection_cost = process_section_data(
            vmv_aggregated, masterlist_data, machining_fields, "vmv", qs=machining_qs.filter(mc_type="vmc"), unique_fields=["machine_no"])

        # CF SECTION
        cf_aggregated = machining_qs.filter(mc_type="cf").values('component').annotate(
            total_production=Sum("production"),
            total_target=Sum("target"),
            total_production_day=Sum(Case(When(shift="day", then=F("production")), default=Value(0), output_field=IntegerField())),
            total_target_day=Sum(Case(When(shift="day", then=F("target")), default=Value(0), output_field=IntegerField())),
            total_production_night=Sum(Case(When(shift="night", then=F("production")), default=Value(0), output_field=IntegerField())),
            total_target_night=Sum(Case(When(shift="night", then=F("target")), default=Value(0), output_field=IntegerField())),
            **{f'total_{field}': Sum(field) for field in machining_fields}
        )
        cf_data, total_cf_production, total_cf_target, total_cf_production_day, total_cf_production_night, total_cf_target_day, total_cf_target_night, total_cf_rejection, total_cf_rejection_cost = process_section_data(
            cf_aggregated, masterlist_data, machining_fields, "cf", qs=machining_qs.filter(mc_type="cf"), unique_fields=["machine_no"])

        # Calculate rejection percentages
        forging_rejection_percent = calculate_rejection_percent(total_forging_rejection, total_forging_production)
        machining_rejection_percent = calculate_rejection_percent(total_machining_rejection, total_machining_production)

        # Identify components in Visual and FI but not in Machining
        visual_components = set(visual_data.keys())
        fi_components = set(fi_data.keys())
        machining_components = set(machining_data.keys())

        missing_components = (visual_components | fi_components) - machining_components

        # Add missing components to machining_data with production and target set to 0
        for component in missing_components:
            machining_data[component] = {
                "production": 0,
                "target": 0,
                "production_day": 0,
                "production_night": 0,
                "target_day": 0,
                "target_night": 0,
                "machining_rejection": 0,
                "rejection_percent": 0,
                "rejection_cost": 0,
                "customer": masterlist_data.get(component, {}).get("customer", "N/A"),
                "cost_per_piece": masterlist_data.get(component, {}).get("cost", 0),
                "rejection_reasons": {field: 0 for field in machining_fields},
                "unique_machine_nos": ["NA"]
            }

        return Response({
            "forging": {
                "total_production": total_forging_production,
                "total_target": total_forging_target,
                "total_production_day": total_forging_production_day,
                "total_production_night": total_forging_production_night,
                "total_target_day": total_forging_target_day,
                "total_target_night": total_forging_target_night,
                "total_rejection": total_forging_rejection,
                "total_rejection_cost": total_forging_rejection_cost,
                "rejection_percent": round(forging_rejection_percent, 2),
                "components": forging_data
            },
            "machining": {
                "total_production": total_machining_production,
                "total_target": total_machining_target,
                "total_production_day": total_machining_production_day,
                "total_production_night": total_machining_production_night,
                "total_target_day": total_machining_target_day,
                "total_target_night": total_machining_target_night,
                "total_rejection": total_machining_rejection,
                "rejection_percent": round(machining_rejection_percent, 2),
                "total_rejection_cost": total_machining_rejection_cost,
                "components": machining_data
            },
            "machining1": {
                "components": broch_data
            },
            "machining2": {
                "components": vmv_data
            },
            "machining3": {
                "components": cf_data
            }
        }, status=status.HTTP_200_OK)
    
from django.db.models.functions import Coalesce
from django.db.models import Sum, F, Value as V

from django.db.models import Sum, F, Value as V
from django.db.models.functions import Coalesce
from datetime import datetime
from rest_framework.response import Response
from rest_framework.views import APIView

class FinancialYearTrendsAPIView(APIView):
    def get(self, request, *args, **kwargs):
        # Get financial year from request or use current
        fy_year = int(request.GET.get("fy_year", datetime.today().year))
        fy_year = fy_year if datetime.today().month >= 4 else fy_year - 1

        start_date = datetime(fy_year, 4, 1)
        end_date = datetime(fy_year + 1, 3, 31)

        # Define financial year months
        months = [f"{start_date.year}-{str(i).zfill(2)}" for i in range(4, 13)] + \
                 [f"{end_date.year}-{str(i).zfill(2)}" for i in range(1, 4)]

        # Initialize trends dictionary
        trends = {
            "forging": {month: {"rejection_pieces": 0, "rejection_percent": 0, "rejection_cost": 0, "total_production": 0, "production_ton": 0} for month in months},
            "pre_mc": {month: {"rejection_pieces": 0, "rejection_percent": 0, "rejection_cost": 0, "total_production": 0, "production_ton": 0} for month in months},
            "cnc": {month: {"rejection_pieces": 0, "rejection_percent": 0, "rejection_cost": 0, "total_production": 0, "production_ton": 0} for month in months},
            "overall": {month: {"rejection_pieces": 0, "rejection_percent": 0, "rejection_cost": 0, "total_production": 0, "production_ton": 0} for month in months},
        }

        # Precompute Masterlist cost and weight mappings (Single Query)
        masterlist = Masterlist.objects.values_list("component", "cost", "slug_weight")
        component_costs = {comp: cost for comp, cost, _ in masterlist}
        component_weights = {comp: weight for comp, _, weight in masterlist}

        # Fetch and aggregate Forging Data (Single Query)
        forging_agg = Forging.objects.filter(date__range=(start_date, end_date)) \
            .values("date__year", "date__month", "component") \
            .annotate(
                production=Coalesce(Sum("production"), V(0)),
                rejection_pieces=Coalesce(Sum(F("up_setting") + F("half_piercing") + F("full_piercing") +
                                              F("ring_rolling") + F("sizing") + F("overheat") + F("bar_crack_pcs")), V(0))
            )

        # Store precomputed forging data
        forging_lookup = {}
        for item in forging_agg:
            month_key = f"{item['date__year']}-{str(item['date__month']).zfill(2)}"
            trends["forging"][month_key]["total_production"] += item["production"]
            trends["forging"][month_key]["rejection_pieces"] += item["rejection_pieces"]
            forging_lookup[(item["component"], month_key)] = item

        # Fetch and aggregate CNC Data (Single Query)
        cnc_agg = machining.objects.filter(date__range=(start_date, end_date)) \
            .values("date__year", "date__month", "component") \
            .annotate(
                production=Coalesce(Sum("production"), V(0)),
                rejection_pieces=Coalesce(Sum("cnc_height") + Sum("cnc_od") + Sum("cnc_bore"), V(0))
            )

        # Store precomputed CNC data
        cnc_lookup = {}
        for item in cnc_agg:
            month_key = f"{item['date__year']}-{str(item['date__month']).zfill(2)}"
            trends["cnc"][month_key]["total_production"] += item["production"]
            trends["cnc"][month_key]["rejection_pieces"] += item["rejection_pieces"]
            cnc_lookup[(item["component"], month_key)] = item

        # Fetch and aggregate FI + Visual Data (Single Query)
        fi_visual_agg = Fi.objects.filter(date__range=(start_date, end_date)) \
            .values("date__year", "date__month", "component") \
            .annotate(
                rejection_pieces=Coalesce(Sum("forging_crack") + Sum("forging_dent"), V(0))
            )

        # Merge FI & Visual rejection reasons into CNC
        for item in fi_visual_agg:
            month_key = f"{item['date__year']}-{str(item['date__month']).zfill(2)}"
            trends["cnc"][month_key]["rejection_pieces"] += item["rejection_pieces"]
            if (item["component"], month_key) in cnc_lookup:
                cnc_lookup[(item["component"], month_key)]["rejection_pieces"] += item["rejection_pieces"]

        # Compute Overall Data
        for month in months:
            trends["overall"][month]["total_production"] = trends["forging"][month]["total_production"]
            trends["overall"][month]["rejection_pieces"] = (
                trends["forging"][month]["rejection_pieces"] + trends["cnc"][month]["rejection_pieces"]
            )

        # Compute Rejection Percentages and Costs Efficiently
        for key in ["forging", "cnc", "overall"]:
            for month, data in trends[key].items():
                production = data["total_production"]
                rejections = data["rejection_pieces"]
                data["rejection_percent"] = (rejections / production * 100) if production else 0

                # Use dictionary lookup instead of queries inside the loop
                data["rejection_cost"] = sum(
                    rejections * component_costs.get(comp, 0) for comp in component_costs
                )

                # Compute production in tons using dictionary lookup
                data["production_ton"] = sum(
                    forging_lookup.get((comp, month), {}).get("production", 0) * component_weights.get(comp, 0)
                    for comp in component_weights
                )

        return Response(trends)

from rest_framework.decorators import action
from .serializers import OrderSerializer,HeatNumberSerializer
from .models import Order
from datetime import datetime
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Order,HeatNumber
from .serializers import OrderSerializer

from rest_framework.pagination import PageNumberPagination
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models

class StandardResultsSetPaginationpoorder(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by(
        models.Case(
            models.When(status="Open", then=0),          # Highest priority
            models.When(status="Partially Received", then=1),
            models.When(status="Closed", then=2),        # Lowest priority
            default=3,
            output_field=models.IntegerField()
        ),
        '-po_date'
    )
    serializer_class = OrderSerializer
    pagination_class = StandardResultsSetPaginationpoorder
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {
        'supplier': ['exact'],
        'po_number': ['exact'],
        'rm_grade': ['exact'],
        'bar_dia': ['exact'],
        'status': ['exact'],
    }
    search_fields = ['supplier__name', 'po_number', 'rm_grade', 'bar_dia', 'heat_numbers__heat_no']

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        force_close = request.data.get('force_close', False)
        
        if force_close:
            # Handle force close logic
            instance.status = "Closed"
            instance.force_closed = True
            actual_delivery_date = request.data.get('actual_delivery_date', timezone.now().date())
            
            # Ensure we have a date object
            if isinstance(actual_delivery_date, str):
                actual_delivery_date = datetime.strptime(actual_delivery_date, '%Y-%m-%d').date()
            
            instance.actual_delivery_date = actual_delivery_date
            
            # Calculate delay days
            if instance.delivery_date:
                instance.delay_days = (instance.actual_delivery_date - instance.delivery_date).days
                if instance.delay_days < 0:
                    instance.delay_days = 0
            
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        # Default partial update behavior
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Delete an order and its related heat numbers"""
        order = self.get_object()

        # Check if the order is already closed (optional restriction)
        if order.status == "Closed":
            return Response(
                {"error": "Cannot delete a closed order."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.delete()
        return Response(
            {"message": "Order deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=True, methods=['patch', 'post'])
    def update_delivery(self, request, pk=None):
        """Update delivery information for an order"""
        order = self.get_object()
        heat_no = request.data.get('heat_no')
        received_qty = request.data.get('received_qty')
        received_date_str = request.data.get('received_date')
        delay_reason = request.data.get('delay_reason')

        # Validate required fields
        if not all([heat_no, received_qty, received_date_str]):
            return Response({'error': 'heat_no, received_qty, and received_date are required'}, 
                          status=400)

        try:
            received_date = datetime.strptime(received_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)

        # Create or update heat number
        heat_number, created = HeatNumber.objects.update_or_create(
            order=order,
            heat_no=heat_no,
            defaults={
                'received_qty': received_qty,
                'received_date': received_date,
                'actual_delivery_date': received_date,  # Default to received_date
                'delay_reason': delay_reason
            }
        )

        # Refresh order data
        order.refresh_from_db()
        serializer = self.get_serializer(order)
        
        return Response({
            'status': 'delivery_updated',
            'created': created,
            'heat_number_id': heat_number.id,
            'order': serializer.data
        })

    @action(detail=True, methods=['get'])
    def deliveries(self, request, pk=None):
        """Get all deliveries for an order"""
        order = self.get_object()
        heat_numbers = order.heat_numbers.all().order_by('-received_date')
        serializer = HeatNumberSerializer(heat_numbers, many=True)
        return Response(serializer.data)

from .serializers import MasterlistHistorySerializer

class MasterlistHistoryView(APIView):
    def get(self, request, pk):
        try:
            # Get the Masterlist instance
            masterlist = Masterlist.objects.get(pk=pk)
            
            # Get the history records for this instance
            history = masterlist.history.all()
            
            # Serialize the history records
            serializer = MasterlistHistorySerializer(history, many=True)
            
            # Return the serialized data
            return Response(serializer.data)
        except Masterlist.DoesNotExist:
            return Response({"error": "Masterlist not found"}, status=404)
        


from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Schedule, Blockmt, RawMaterial
class AvailableMaterialView(APIView):
    def get(self, request):
        today = timezone.now().date()
        # Get the first date of the current month
        first_date_of_month = today.replace(day=1)
        next_month = today + timedelta(days=30)

        # Filter RawMaterial to get approved and under inspection materials
        raw_materials = RawMaterial.objects.filter(
            approval_status__in=['Approved', 'Under Inspection']
        ).values('grade', 'dia', 'supplier', 'customer', 'heatno').annotate(
            total_weight=Sum('weight')
        )

        # Normalize RawMaterial values to lowercase
        raw_materials = [
            {k: v.lower() if isinstance(v, str) else v for k, v in rm.items()}
            for rm in raw_materials
        ]

        # Filter Blockmt and group by grade, dia, heatno, supplier, customer
        blocked_materials = Blockmt.objects.values('grade','component', 'dia', 'heatno', 'supplier', 'customer').annotate(
            total_weight=Sum('weight')
        )

        # Normalize Blockmt values to lowercase
        blocked_materials = [
            {k: v.lower() if isinstance(v, str) else v for k, v in bm.items()}
            for bm in blocked_materials
        ]

        # Calculate available RM
        available_materials = []
        for rm in raw_materials:
            for bm in blocked_materials:
                if (rm['grade'] == bm['grade'] and
                    rm['dia'] == bm['dia'] and
                    rm['heatno'] == bm['heatno'] and
                    rm['supplier'] == bm['supplier'] and
                    rm['customer'] == bm['customer']):
                    available_weight = rm['total_weight'] - bm['total_weight']
                    available_materials.append({
                        'grade': rm['grade'],
                        'dia': rm['dia'],
                        'supplier': rm['supplier'],
                        'customer': rm['customer'],
                        'heatno': rm['heatno'],
                        'available_weight': available_weight
                    })

        # Filter Schedule for the next 30 days and group by component, customer, grade, dia
        schedules = Schedule.objects.filter(
            date1__range=[first_date_of_month, next_month]
        ).values('component', 'customer', 'grade', 'dia').annotate(
            total_weight=Sum('weight')
        )

        # Normalize Schedule values to lowercase
        schedules = [
            {k: v.lower() if isinstance(v, str) else v for k, v in schedule.items()}
            for schedule in schedules
        ]

        # Prepare the response data
        response_data = []
        for schedule in schedules:
            # Find available material for this schedule
            available_for_schedule = next(
                (rm for rm in available_materials
                 if rm['grade'] == schedule['grade'] and
                 rm['dia'] == schedule['dia'] and
                 rm['customer'] == schedule['customer']),
                None
            )

            if available_for_schedule:
                available_weight = available_for_schedule['available_weight']
                scheduled_weight = schedule['total_weight']
                required_weight = max(scheduled_weight - available_weight, 0)  # Ensure non-negative

                response_data.append({
                    'grade': schedule['grade'],
                    'dia': schedule['dia'],
                    'customer': schedule['customer'],
                    'component': schedule['component'],
                    'available_weight': available_weight,
                    'scheduled_weight': scheduled_weight,
                    'required_weight': required_weight
                })

        return Response(response_data)
    
from datetime import datetime, timedelta
from django.db.models import Sum, F
from django.http import JsonResponse
from django.db import models

from django.db.models import Sum
from django.utils.timezone import now
from datetime import datetime

def get_remaining_schedule(request=None):
    current_month = now().month
    current_year = now().year
    
    # Filter data for the current month and year using date1 in Schedule
    schedules = Schedule.objects.filter(
        date1__startswith=f"{current_year}-{str(current_month).zfill(2)}"
    )
    
    # Filter data for the current month and year using block_mt_id in Blockmt
    blockmts = Blockmt.objects.filter(
        block_mt_id__regex=f".*-{current_year}{str(current_month).zfill(2)}\\d{{2}}-.*"
    )
    
    # Convert fields to lowercase and group by required fields
    schedules_agg = schedules.values(
        'component', 'customer', 'grade', 'dia'
    ).annotate(
        total_pices=Sum('pices'),
        total_weight=Sum('weight')
    )
    
    blockmts_agg = blockmts.values(
        'component', 'customer', 'grade', 'dia'
    ).annotate(
        total_pices=Sum('pices'),
        total_weight=Sum('weight')
    )
    
    # Convert querysets to dictionaries for easy lookup
    blockmts_dict = {
        (b['component'].lower(), b['customer'].lower(), b['grade'].lower(), b['dia'].lower()): {
            'total_pices': b['total_pices'],
            'total_weight': b['total_weight']
        }
        for b in blockmts_agg
    }
    
    remaining_schedules = []
    
    for s in schedules_agg:
        key = (s['component'].lower(), s['customer'].lower(), s['grade'].lower(), s['dia'].lower())
        blocked_pices = blockmts_dict.get(key, {}).get('total_pices', 0)
        blocked_weight = blockmts_dict.get(key, {}).get('total_weight', 0)
        
        remaining_pices = s['total_pices'] - blocked_pices
        remaining_weight = s['total_weight'] - blocked_weight
        
        remaining_schedules.append({
            'component': s['component'].lower(),
            'customer': s['customer'].lower(),
            'grade': s['grade'].lower(),
            'dia': s['dia'].lower(),
            'remaining_pices': remaining_pices,
            'remaining_weight': remaining_weight
        })
    
    return remaining_schedules


from collections import defaultdict
from decimal import Decimal
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

def group_and_sum_rm(rm_data):
    grouped = defaultdict(Decimal)  # Initialize with Decimal
    for entry in rm_data:
        key = (entry['customer'], entry['grade'], entry['dia'])
        grouped[key] += Decimal(str(entry['weight_diff']))  # Ensure weight_diff is treated as Decimal
    return grouped

def group_and_sum_schedule(schedule_data):
    grouped = defaultdict(Decimal)  # Initialize with Decimal
    for entry in schedule_data:
        key = (entry['customer'], entry['grade'], entry['dia'])
        grouped[key] += Decimal(str(entry['remaining_weight']))  # Ensure remaining_weight is treated as Decimal
    return grouped

def merge_data(rm_grouped, schedule_grouped):
    merged_data = []
    for key, rm_weight in rm_grouped.items():
        customer, grade, dia = key
        schedule_weight = schedule_grouped.get(key, Decimal(0))  # Default to Decimal(0)
        merged_data.append({
            'customer': customer,
            'grade': grade,
            'dia': dia,
            'available_rm': float(rm_weight),  # Convert to float for JSON serialization
            'required_rm': float(schedule_weight)  # Convert to float for JSON serialization
        })
    return merged_data

@require_http_methods(["GET"])
def get_rm_and_schedule(request):
    # Get data from the helper functions
    rm_data = balance_after_hold_for_autofill(request)
    schedule_data = get_remaining_schedule(request)
    print(f'rm_data{rm_data}')
    print(f'schedule_data{schedule_data}')

    # Group and sum the data
    rm_grouped = group_and_sum_rm(rm_data)
    schedule_grouped = group_and_sum_schedule(schedule_data)

    # Merge the data
    merged_data = merge_data(rm_grouped, schedule_grouped)

    # Return the merged data as a JSON response
    return JsonResponse(merged_data, safe=False)

from django.utils.timezone import now
from django.db.models import Sum, F, Value,IntegerField,CharField
from django.db.models.functions import ExtractMonth, ExtractYear, Concat
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import RawMaterial
from rest_framework import status
from django.db.models.functions import Substr

class MonthlyGraphAPIView(APIView):
    def get(self, request, *args, **kwargs):
        # Get the month and year from request parameters, default to current month/year
        month = int(request.GET.get("month", now().month))
        year = int(request.GET.get("year", now().year))

        # Filter data for the given month and year
        raw_materials = RawMaterial.objects.annotate(
            record_month=ExtractMonth("date"),
            record_year=ExtractYear("date")
        ).filter(record_month=month, record_year=year)

        # First graph: Group by supplier, sum the weight, and convert to tonnage
        supplier_data = (
            raw_materials.values("supplier")
            .annotate(total_weight=Sum("weight"))
            .annotate(total_tonnage=F("total_weight") / 1000)  # Convert kg to tonnes
            .values("supplier", "total_tonnage")
        )

        # Second graph: Group by grade and dia, sum the weight, and convert to tonnage
        grade_dia_data = (
            raw_materials.annotate(
                grade_dia=Concat(F("grade"), Value("-"), F("dia"), output_field=models.CharField())  # Fix: Explicit output field
            )
            .values("grade_dia")
            .annotate(total_weight=Sum("weight"))
            .annotate(total_tonnage=F("total_weight") / 1000)  # Convert kg to tonnes
            .values("grade_dia", "total_tonnage")
        )

        response_data = {
            "supplier_graph": list(supplier_data),
            "grade_dia_graph": list(grade_dia_data),
        }

        return Response(response_data, status=status.HTTP_200_OK)

from datetime import datetime, timedelta
from django.utils.timezone import now
from django.db.models.functions import TruncMonth
from django.db.models import Sum
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import RawMaterial
def get_last_12_months():
    """Generate a list of the last 12 months in 'YYYY-MM' format, ensuring correctness."""
    today = datetime.today()
    months = []

    for i in range(12):
        year = (today.year - (1 if today.month - i <= 0 else 0))
        month = (today.month - i) % 12 or 12  # Ensure December remains 12, not 0
        months.append(f"{year}-{month:02d}")

    months.reverse()  # Ensure correct chronological order
    return months


@api_view(['GET'])
def monthly_receiving_trend(request):
    last_12_months = get_last_12_months()
    
    # Query data and aggregate weight per month
    data = (
        RawMaterial.objects
        .filter(date__gte=now() - timedelta(days=365))
        .annotate(month=TruncMonth('date'))
        .values('month')
        .annotate(total_weight=Sum('weight'))
        .order_by('month')
    )
    
    # Convert query results to dictionary
    data_dict = {entry['month'].strftime('%Y-%m'): entry['total_weight'] / 1000 for entry in data}
    
    # Prepare response with missing months filled as 0
    response_data = [
        {'month': month, 'tonnage': data_dict.get(month, 0)}
        for month in last_12_months
    ]
    
    return Response(response_data)

class MonthlyConsumptionGraphAPIView(APIView):
    def get(self, request, *args, **kwargs):
        # Get the month and year from request parameters, default to current month/year
        month = int(request.GET.get("month", now().month))
        year = int(request.GET.get("year", now().year))

        print(f"Filtering for Year: {year}, Month: {month}")  # Debugging

        # Extract year and month from block_mt_id (Format: FP-YYYYMMDD-XX-XX)
        raw_materials = Blockmt.objects.annotate(
            record_year=Substr("block_mt_id", 4, 4),   # Extract YYYY (2025)
            record_month=Substr("block_mt_id", 8, 2)   # Extract MM (03)
        ).filter(
            record_year=str(year),  # Convert year to string
            record_month=str(month).zfill(2)  # Convert month to string & ensure it's '03' not '3'
        )


        if not raw_materials.exists():
            return Response({"message": "No records found for the given month/year"}, status=status.HTTP_404_NOT_FOUND)

        # First graph: Group by supplier, sum the weight, and convert to tonnage
        supplier_data = (
            raw_materials.values("supplier")
            .annotate(total_weight=Sum("weight"))
            .annotate(total_tonnage=F("total_weight") / 1000)  # Convert kg to tonnes
            .values("supplier", "total_tonnage")
        )

        # Second graph: Group by grade and dia, sum the weight, and convert to tonnage
        grade_dia_data = (
            raw_materials.annotate(
                grade_dia=Concat(F("grade"), Value("-"), F("dia"), output_field=CharField())
            )
            .values("grade_dia")
            .annotate(total_weight=Sum("weight"))
            .annotate(total_tonnage=F("total_weight") / 1000)  # Convert kg to tonnes
            .values("grade_dia", "total_tonnage")
        )

        response_data = {
            "supplier_graph": list(supplier_data),
            "grade_dia_graph": list(grade_dia_data),
        }

        return Response(response_data, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def monthly_consumption_trend(request):
    last_12_months = get_last_12_months()

    # Extracting Year and Month as String (Avoiding Cast)
    data = (
        Blockmt.objects
        .annotate(
            record_year=Substr("block_mt_id", 4, 4),  # Extract YYYY as string
            record_month=Substr("block_mt_id", 8, 2)  # Extract MM as string
        )
        .filter(
            record_year__gte=str(datetime.now().year - 1)  # Compare as string
        )
        .annotate(
            formatted_month=Concat(
                F("record_year"), Value("-"), F("record_month"), output_field=CharField()
            )
        )
        .values("formatted_month")
        .annotate(total_weight=Sum("weight"))
        .order_by("formatted_month")
    )

    # Convert query results to dictionary
    data_dict = {entry["formatted_month"]: entry["total_weight"] / 1000 for entry in data}

    # Prepare response with missing months filled as 0
    response_data = [
        {"month": month, "tonnage": data_dict.get(month, 0)}
        for month in last_12_months
    ]

    return Response(response_data)


from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import PurchaseOrder, Goods
from .serializers import PurchaseOrderSerializer, PurchaseOrderCreateSerializer
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from django.http import HttpResponse

class CreatePurchaseOrder(APIView):
    def post(self, request):
        serializer = PurchaseOrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RetrievePurchaseOrder(APIView):
    def get(self, request, po_number):
        purchase_order = get_object_or_404(PurchaseOrder, po_number=po_number)
        serializer = PurchaseOrderSerializer(purchase_order)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GeneratePDF(APIView):
    def get(self, request, po_number):
        po = get_object_or_404(PurchaseOrder, po_number=po_number)
        goods = Goods.objects.filter(purchase_order=po)

        buffer = BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []

        styles = getSampleStyleSheet()
        elements.append(Paragraph(f"Purchase Order: {po.po_number}", styles['Title']))
        elements.append(Paragraph(f"Date: {po.date}", styles['Normal']))
        elements.append(Paragraph(f"Supplier: {po.supplier_name}", styles['Normal']))
        elements.append(Paragraph(f"User: {po.user}", styles['Normal']))  # Include user in the PDF

        data = [['S.No.', 'Item Name', 'Quantity', 'Unit Price', 'Total Price']]
        for index, good in enumerate(goods, start=1):
            data.append([index, good.name, good.quantity, f"${good.unit_price}", f"${good.total_price}"])

        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(table)

        elements.append(Paragraph(f"Grand Total: ${po.total_amount}", styles['Heading2']))

        pdf.build(elements)
        buffer.seek(0)

        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{po.po_number}.pdf"'
        return response
    



from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import MaterialComplaint
from .serializers import MaterialComplaintSerializer
from rest_framework.parsers import MultiPartParser, FormParser

class CreateMaterialComplaintView(generics.CreateAPIView):
    queryset = MaterialComplaint.objects.all()
    serializer_class = MaterialComplaintSerializer
    parser_classes = [MultiPartParser, FormParser]  # Add this line
    
    def perform_create(self, serializer):
        # Handle file saving explicitly if needed
        instance = serializer.save()
        
        # If you need to do additional processing with files:
        Complaint_photo = self.request.FILES.get('Complaint_photo')
        if Complaint_photo:
            instance.Complaint_photo = Complaint_photo
            instance.save()

from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

from django.db.models import Count

class ListMaterialComplaintsView(generics.ListAPIView):
    serializer_class = MaterialComplaintSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['supplier', 'heat', 'grade', 'dia', 'location', 'component']
    search_fields = ['issue']
    ordering_fields = ['complaint_date']

    def get_queryset(self):
        return MaterialComplaint.objects.all().order_by(
            models.Case(
                models.When(status='Open', then=models.Value(1)),
                models.When(status='Closed', then=models.Value(2)),
                default=models.Value(3),
            ),
            '-complaint_date'
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        open_complaints_count = queryset.filter(status="Open").count()

        response = super().list(request, *args, **kwargs)
        response.data["open_complaints_count"] = open_complaints_count  # Add the count to the response
        return response


@api_view(["GET"])
def get_heat_suggestions(request):
    query = request.GET.get("q", "")
    if query:
        heatno = RawMaterial.objects.filter(heatno__icontains=query).values_list("heatno", flat=True).distinct()
        return Response({"heatno": list(heatno)})
    return Response({"heatno": []})

@api_view(["GET"])
def get_heat_details(request, heatno):
    material = RawMaterial.objects.filter(heatno=heatno).order_by("-date").first()
    if material:
        serializer = RawMaterialSerializer(material)
        return Response(serializer.data)
    return Response({"error": "Heat not found"}, status=404)

from rest_framework import generics, permissions
from .models import MaterialComplaint
from .serializers import MaterialComplaintUpdateSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication


class UpdateMaterialComplaintView(generics.UpdateAPIView):
    queryset = MaterialComplaint.objects.all()
    serializer_class = MaterialComplaintUpdateSerializer
    authentication_classes = []  # Remove authentication
    permission_classes = []  # Allow anyone to update

    def get_object(self):
        """Fetch the object using 'pk' from the URL"""
        complaint_id = self.kwargs.get("pk")
        return MaterialComplaint.objects.get(id=complaint_id)
    

class UpcomingDeliveriesList(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = []

    def get_queryset(self):
        # Get orders that are not delivered (actual_delivery_date is null)
        # and delivery_date is in the future or today
        today = timezone.now().date()
        return Order.objects.filter(
            actual_delivery_date__isnull=True,
            delivery_date__gte=today
        ).order_by('delivery_date')  # Limit to 10 upcoming deliveries
    
class OpenComplaintsList(generics.ListAPIView):
    serializer_class = MaterialComplaintSerializer
    permission_classes = []

    def get_queryset(self):
        return MaterialComplaint.objects.filter(
            status='Open'
        ).order_by('-complaint_date') # Get 5 most recent open complaints
    

# views.py
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def dashboard_stats(request):
    # Calculate date ranges
    today = timezone.now().date()
    last_week = today - timedelta(days=7)
    last_month = today - timedelta(days=30)
    yesterday = today - timedelta(days=1)
    
    # Open Complaints
    open_complaints = MaterialComplaint.objects.filter(status='Open').count()
    last_week_open = MaterialComplaint.objects.filter(
        status='Open',
        complaint_date__lte=last_week
    ).count()
    open_complaints_trend = f"↑ {open_complaints - last_week_open}" if open_complaints > last_week_open else f"↓ {last_week_open - open_complaints}"
    
    # Upcoming Deliveries (within next 7 days)
    upcoming_deliveries = Order.objects.filter(
        delivery_date__gte=today,
        delivery_date__lte=today + timedelta(days=7),
        actual_delivery_date__isnull=True
    ).count()
    last_week_upcoming = Order.objects.filter(
        delivery_date__gte=last_week,
        delivery_date__lte=last_week + timedelta(days=30),
        actual_delivery_date__isnull=True
    ).count()
    upcoming_trend = f"↑ {upcoming_deliveries - last_week_upcoming}" if upcoming_deliveries > last_week_upcoming else f"↓ {last_week_upcoming - upcoming_deliveries}"
    
    # Completed Orders (delivered in last 30 days)
    completed_orders = Order.objects.filter(
        actual_delivery_date__gte=last_month,
        actual_delivery_date__lte=today
    ).count()
    prev_month_completed = Order.objects.filter(
        actual_delivery_date__gte=last_month - timedelta(days=30),
        actual_delivery_date__lte=last_month
    ).count()
    completed_trend = f"↑ {round(((completed_orders - prev_month_completed)/prev_month_completed)*100)}%" if completed_orders > prev_month_completed else f"↓ {round(((prev_month_completed - completed_orders)/prev_month_completed)*100)}%"
    
    # Pending Approvals (orders with delivery date passed but not delivered)
    pending_approvals = Order.objects.filter(
        delivery_date__lt=today,
        actual_delivery_date__isnull=True
    ).count()
    yesterday_pending = Order.objects.filter(
        delivery_date__lt=yesterday,
        actual_delivery_date__isnull=True
    ).count()
    pending_trend = f"↑ {pending_approvals - yesterday_pending}" if pending_approvals > yesterday_pending else f"↓ {yesterday_pending - pending_approvals}"
    
    return Response({
        'stats': [
            {
                'title': 'Open Complaints',
                'value': open_complaints,
                'trend': f"{open_complaints_trend} from last week"
            },
            {
                'title': 'Upcoming Deliveries',
                'value': upcoming_deliveries,
                'trend': f"{upcoming_trend} from last week"
            },
            {
                'title': 'Completed Orders',
                'value': completed_orders,
                'trend': f"{completed_trend} from last month"
            },
            {
                'title': 'Due  Deliveries',
                'value': pending_approvals,
                'trend': f"{pending_trend} from yesterday"
            }
        ]
    })
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q, F, ExpressionWrapper, fields
from django.db.models.functions import ExtractMonth, ExtractYear
from datetime import datetime, timedelta
from .models import MaterialComplaint, Order, Supplier
from .serializers import SupplierPerformanceSerializer

class SupplierPerformanceRating(APIView):
    def get(self, request):
        supplier_name = request.query_params.get('supplier')
        year = request.query_params.get('year', datetime.now().year)
        
        try:
            year = int(year)
        except ValueError:
            return Response({"error": "Invalid year format"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            supplier = Supplier.objects.get(name=supplier_name)
        except Supplier.DoesNotExist:
            return Response({"error": "Supplier not found"}, status=status.HTTP_404_NOT_FOUND)
        
        performance_data = self.calculate_performance_metrics(supplier, year)
        serializer = SupplierPerformanceSerializer(performance_data, many=True)
        return Response(serializer.data)
    
    def calculate_quality_score(self, complaints_count, no_order_month=False):
        """Calculate quality score based on complaints count"""
        if no_order_month:
            return 100  # Full score if no orders (nothing to complain about)
        if complaints_count == 0:
            return 100  # Full score if no complaints
        elif complaints_count == 1:
            return 75
        elif complaints_count == 2:
            return 50
        elif complaints_count == 3:
            return 25
        else:
            return 0
    
    def calculate_delivery_score(self, delayed_deliveries, no_order_month=False):
        """Calculate delivery score based on delayed deliveries"""
        if no_order_month:
            return 100  # Full score if no orders (nothing to deliver)
        if delayed_deliveries == 0:
            return 100  # Full score if no delays
        elif delayed_deliveries == 1:
            return 75
        elif delayed_deliveries == 2:
            return 50
        elif delayed_deliveries == 3:
            return 25
        else:
            return 0
    
    def calculate_resolution_score(self, total_complaints, resolved_complaints, no_order_month=False):
        """Calculate resolution score based on resolved complaints"""
        if no_order_month or total_complaints == 0:
            return 100  # Full score if no complaints to resolve
        return (resolved_complaints / total_complaints * 100) if total_complaints > 0 else 100
    
    def calculate_performance_metrics(self, supplier, year):
        current_date = datetime.now().date()
        current_year = current_date.year
        current_month = current_date.month
        
        performance_data = []
        
        for month in range(1, 13):
            month_start = datetime(year, month, 1).date()
            month_end = (datetime(year, month, 1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            month_end = month_end.date()
            
            month_data = {
                'month': month,
                'rating': 0.0,
                'complaints_count': 0,
                'on_time_delivery_percentage': 0.0,
                'complaint_resolution_percentage': 0.0,
                'quality_score': 0.0,
                'delivery_score': 0.0,
                'resolution_score': 0.0,
                'total_deliveries': 0,
                'on_time_deliveries': 0,
                'delayed_deliveries': 0,
                'no_order_month': False,
                'is_future_month': False
            }
            
            # Check if this is a future month
            if (year > current_year) or (year == current_year and month > current_month):
                month_data.update({
                    'is_future_month': True,
                    'rating': 0.0,
                    'quality_score': 0.0,
                    'delivery_score': 0.0,
                    'resolution_score': 0.0,
                    'complaint_resolution_percentage': 0.0
                })
                performance_data.append(month_data)
                continue
            
            # Check if any orders exist for this month
            orders_exist = Order.objects.filter(
                supplier=supplier,
                actual_delivery_date__range=[month_start, month_end],
                actual_delivery_date__isnull=False
            ).exists()

            no_order_month = not orders_exist
            
            if no_order_month:
                month_data.update({
                    'no_order_month': True,
                    'rating': 5.0,
                    'quality_score': 100.0,  # Full quality score for no orders
                    'delivery_score': 100.0,  # Full delivery score for no orders
                    'resolution_score': 100.0,  # Full resolution score for no orders
                    'complaint_resolution_percentage': 100.0  # Full resolution percentage
                })
                performance_data.append(month_data)
                continue
            
            # Calculate delivery metrics
            deliveries = Order.objects.filter(
                supplier=supplier,
                actual_delivery_date__range=[month_start, month_end],
                actual_delivery_date__isnull=False
            ).annotate(
                is_on_time=Case(
                    When(delay_days__lte=0, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField()
                )
            ).values('is_on_time').annotate(count=Count('id'))
            
            total_deliveries = 0
            on_time_deliveries = 0
            
            for delivery in deliveries:
                if delivery['is_on_time'] == 1:
                    on_time_deliveries = delivery['count']
                total_deliveries += delivery['count']
            
            delayed_deliveries = total_deliveries - on_time_deliveries
            
            # Calculate complaint metrics
            complaints = MaterialComplaint.objects.filter(
                supplier=supplier.name,
                complaint_date__range=[month_start, month_end]
            )
            
            total_complaints = complaints.count()
            resolved_complaints = complaints.filter(
                status='Closed',
                d8_report__isnull=False,
                closing_date__lte=F('complaint_date') + timedelta(days=15)
            ).count()
            
            # Calculate scores
            quality_score = self.calculate_quality_score(total_complaints, no_order_month)
            delivery_score = self.calculate_delivery_score(delayed_deliveries, no_order_month)
            resolution_score = self.calculate_resolution_score(total_complaints, resolved_complaints, no_order_month)
            
            # Calculate overall rating
            if no_order_month:
                rating = 0.0  # No rating if no orders
            elif total_deliveries > 0 or total_complaints > 0:
                weighted_score = (0.4 * quality_score + 
                                0.4 * delivery_score + 
                                0.2 * resolution_score)
                rating = weighted_score / 20  # Convert to 1-5 scale
                rating = max(1, min(5, round(rating, 1)))  # Ensure within bounds
            else:
                rating = 0.0
            
            month_data.update({
                'month': month_start.strftime('%B'),  # Convert to month name
                'rating': rating,
                'complaints_count': total_complaints,
                'on_time_delivery_percentage': round((on_time_deliveries / total_deliveries * 100), 1) if total_deliveries > 0 else 100.0,
                'complaint_resolution_percentage': round((resolved_complaints / total_complaints * 100), 1) if total_complaints > 0 else 100.0,
                'quality_score': quality_score,
                'delivery_score': delivery_score,
                'resolution_score': resolution_score,
                'total_deliveries': total_deliveries,
                'on_time_deliveries': on_time_deliveries,
                'delayed_deliveries': delayed_deliveries,
                'no_order_month': no_order_month,
                'is_future_month': False
            })
            
            performance_data.append(month_data)
        
        return performance_data
    
from django.http import HttpResponse
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from num2words import num2words
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import Image
from decimal import Decimal
import hashlib
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from PyPDF2 import PdfReader, PdfWriter
import base64
from cryptography.hazmat.backends import default_backend
import hashlib
import hmac
import PyPDF2, re
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging
logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class OrderViewSet1(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('supplier')
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'supplier': ['exact'],
        'po_number': ['exact', 'icontains'],
        'po_date': ['exact', 'gte', 'lte'],
        'rm_grade': ['exact', 'icontains'],
        'rm_standard': ['exact', 'icontains'],
        'bar_dia': ['exact', 'gte', 'lte'],
        'delivery_date': ['exact', 'gte', 'lte'],
    }
    search_fields = ['po_number', 'rm_grade', 'rm_standard', 'description_of_good']
    ordering_fields = '__all__'
    ordering = ['-po_date']

    @action(detail=False, methods=['post'])
    def verify_po_signature(self, request):
        """Enhanced verification endpoint with detailed error handling"""
        try:
            # 1. Log incoming request details
            logger.info(f"Request received. Method: {request.method}")
            logger.info(f"Content-Type: {request.content_type}")
            logger.info(f"Headers: {dict(request.headers)}")
            logger.info(f"Files: {dict(request.FILES)}")
            logger.info(f"POST data: {dict(request.POST)}")

            # 2. Validate file upload
            if not request.FILES:
                logger.error("No files in request")
                return Response({'error': 'No file uploaded'}, 
                            status=status.HTTP_400_BAD_REQUEST)
            
            if 'po_file' not in request.FILES:
                logger.error("File field 'po_file' missing")
                return Response({'error': 'File field must be named "po_file"'}, 
                            status=status.HTTP_400_BAD_REQUEST)
            
            po_file = request.FILES['po_file']
            logger.info(f"Received file: {po_file.name} ({po_file.size} bytes)")

            # 3. Validate file type
            if not po_file.name.lower().endswith('.pdf'):
                logger.error("Invalid file type")
                return Response({'error': 'Only PDF files are accepted'}, 
                            status=status.HTTP_400_BAD_REQUEST)

            # 4. Verify PDF is readable
            try:
                pdf_reader = PyPDF2.PdfReader(po_file)
                text = "\n".join(page.extract_text() or '' for page in pdf_reader.pages)
                logger.info(f"Extracted text length: {len(text)} characters")
                
                if not text.strip():
                    logger.error("PDF text extraction failed - empty result")
                    return Response({'error': 'PDF text extraction failed'}, 
                                status=status.HTTP_400_BAD_REQUEST)
                
                # Log first 200 characters for debugging
                logger.debug(f"First 200 chars of PDF text:\n{text[:200]}")
            except Exception as e:
                logger.error(f"PDF processing error: {str(e)}")
                return Response({'error': 'Invalid PDF file'}, 
                            status=status.HTTP_400_BAD_REQUEST)

            # 5. Extract verification fields with multiple possible patterns
            patterns = {
                'po_number': [
                    r'Order\s*No\.?\s*:\s*([^\n\r]+)',  # Matches "Order No.: 2024-25N 88"
                    r'PO\s*Number\s*:\s*([^\n\r]+)',    # Alternative pattern
                    r'P\.O\.\s*Number\s*:\s*([^\n\r]+)',# Another alternative
                    r'Purchase\s*Order\s*:\s*([^\n\r]+)' # Another alternative
                ],
                'approved_by': [
                    r'Approved\s*By\s*:\s*([^\n\r]+)',
                    r'Authorized\s*By\s*:\s*([^\n\r]+)',
                    r'Verified\s*By\s*:\s*([^\n\r]+)'
                ],
                'approval_time': [
                    r'Approval\s*Time\s*:\s*([^\n\r]+)',
                    r'Date\s*:\s*([^\n\r]+)',
                    r'Time\s*:\s*([^\n\r]+)'
                ],
                'signature': [
                    r'Signature\s*:\s*([^\n\r]+)',
                    r'Digital\s*Signature\s*:\s*([^\n\r]+)',
                    r'Verification\s*Code\s*:\s*([^\n\r]+)'
                ]
            }
            
            extracted = {}
            for field, field_patterns in patterns.items():
                for pattern in field_patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        extracted[field] = match.group(1).strip()
                        logger.info(f"Extracted {field} using pattern '{pattern}': {extracted[field]}")
                        break
                else:
                    logger.error(f"Missing {field} in document. Tried patterns: {field_patterns}")
                    return Response(
                        {'error': f'Could not find {field.replace("_", " ")} in document'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # 6. Database lookup with cleaned PO number
            try:
                order = Order.objects.get(po_number__iexact=extracted['po_number'])
                logger.info(f"Found order: {order.id} with PO: {order.po_number}")
            except Order.DoesNotExist:
                cleaned_po_number = extracted['roq_po_number']
                logger.error(f"Order not found: {extracted['po_number']} (cleaned: {cleaned_po_number})")
                return Response({
                    'status': 'invalid',
                    'message': 'PO number not found in our records',
                    'searched_number': extracted['po_number'],
                    'cleaned_number': cleaned_po_number
                }, status=status.HTTP_404_NOT_FOUND)

        

            # 7. Signature verification - MODIFIED SECTION
            SECRET_KEY = b"my_super_secret_key_123"
            
            # Normalize all values before signature generation
            po_number = order.po_number.strip()
            approved_by = (order.approved_by or extracted['approved_by']).strip()
            
            # Handle approval time formatting consistently
            if order.approval_time:
                approval_time = order.approval_time.strftime('%Y-%m-%d %H:%M:%S')
            else:
                # Parse and reformat the extracted time to remove microseconds/timezone if present
                try:
                    dt = datetime.strptime(extracted['approval_time'].split('.')[0], '%Y-%m-%d %H:%M:%S')
                    approval_time = dt.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    approval_time = extracted['approval_time'].split('.')[0]  # Fallback to simple truncation

            expected_signature = self.generate_digital_signature(
                SECRET_KEY,
                po_number, 
                approved_by,
                approval_time
            )

            # Normalize the extracted signature by removing any whitespace
            received_signature = extracted['signature'].strip()
            
            is_valid = hmac.compare_digest(expected_signature[:20], received_signature[:20])
            
            # Add detailed comparison logging
            logger.info(f"Signature Comparison Details:")
            logger.info(f"PO Number: '{po_number}'")
            logger.info(f"Approved By: '{approved_by}'")
            logger.info(f"Approval Time: '{approval_time}'")
            logger.info(f"Expected Signature: {expected_signature}")
            logger.info(f"Received Signature: {received_signature}")
            logger.info(f"Match Result: {is_valid}")

            # 8. Prepare response - MODIFIED TO ENSURE CONSISTENCY
            response_data = {
                'status': 'valid' if is_valid else 'invalid',
                'message': 'PO signature is valid' if is_valid else 'PO signature is invalid',
                'po_number': po_number,
                'document_po_number': extracted['po_number'].strip(),
                'document_approved_by': extracted['approved_by'].strip(),
                'document_approval_time': extracted['approval_time'].strip(),
                'signature_match': is_valid,
                'system_approved_by': approved_by,
                'system_approval_time': approval_time,
                'verification_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'signature_compared': {
                    'expected': expected_signature,
                    'received': received_signature,
                    'match': is_valid
                }
            }

            # Add final verification logging
            logger.info(f"Final Verification Result: {'VALID' if is_valid else 'INVALID'}")
            logger.info(f"Response Data: {response_data}")

            return Response(response_data)

        except Exception as e:
            logger.exception("Unexpected error in verification")
            return Response({
                'status': 'error',
                'message': 'Internal server error',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def generate_digital_signature(self, SECRET_KEY ,po_number, approved_by, approval_time):
        """Generates a consistent HMAC-based signature."""
        # Ensure approval_time is properly formatted if it's a datetime object
        if hasattr(approval_time, 'strftime'):
            approval_time = approval_time.strftime('%Y-%m-%d %H:%M:%S')

        po_number = str(po_number).strip()
        approved_by = str(approved_by).strip()
        approval_time = str(approval_time).strip()
        message = f"{po_number}|{approved_by}|{approval_time}".encode()

        # Generate an HMAC signature using SHA-256
        signature = hmac.new(SECRET_KEY, message, hashlib.sha256).digest()

        return base64.b64encode(signature).decode()

    def get_checkmark_image(self):
        """Returns a green checkmark image with transparency"""
        try:
            # You should place a checkmark.png in your media directory
            checkmark_path = os.path.join(settings.MEDIA_ROOT, 'checkmark-512.png')
            print(checkmark_path)
            return Image(checkmark_path, width=40, height=40, hAlign='LEFT')
        except:
            # Fallback to drawing a simple checkmark
            from reportlab.graphics.shapes import Drawing, Line
            d = Drawing(40, 40)
            d.add(Line(5, 15, 15, 25, strokeColor=colors.green, strokeWidth=3))
            d.add(Line(15, 25, 35, 5, strokeColor=colors.green, strokeWidth=3))
            return d

    @action(detail=False, methods=['get'])
    def download_po(self, request):
        # Get the order ID from query params
        order_id = request.query_params.get('order_id')
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        # Create a PDF buffer
        buffer = BytesIO()

        # Create the PDF object with professional layout
        doc = SimpleDocTemplate(buffer, pagesize=letter, 
                            leftMargin=10, rightMargin=10, 
                            topMargin=10, bottomMargin=15)
        elements = []

        # Define styles
        styles = getSampleStyleSheet()
        logo_path = r"C:\Users\ssben\OneDrive\Desktop\Software\company_backend\media\logo.png"

        # Create an image object
        logo = Image(logo_path, width=100, height=40, hAlign='LEFT')
        
        # Custom styles for modern professional look
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=16,
            alignment=1,  # Center
            spaceAfter=12,
            textColor=colors.HexColor('#003366'),  # Dark blue
            fontName='Helvetica-Bold'
        )
        
        company_style = ParagraphStyle(
            'Company',
            parent=styles['Normal'],
            fontSize=10,
            leading=12,
            spaceAfter=0,
            textColor=colors.HexColor('#333333'),
            fontName='Helvetica-Bold'
        )
        
        company_detail_style = ParagraphStyle(
            'CompanyDetail',
            parent=styles['Normal'],
            fontSize=9,
            leading=11,
            spaceAfter=2,
            textColor=colors.HexColor('#555555')
        )
        
        party_title_style = ParagraphStyle(
            'PartyTitle',
            parent=styles['Normal'],
            fontSize=10,
            leading=12,
            spaceAfter=2,
            textColor=colors.HexColor('#003366'),
            fontName='Helvetica-Bold',
            alignment=TA_LEFT  # Left alignment
        )
        
        party_style = ParagraphStyle(
            'Party',
            parent=styles['Normal'],
            fontSize=9,
            leading=11,
            spaceAfter=2,
            textColor=colors.HexColor('#555555'),
            alignment=TA_LEFT,  # Left alignment
            leftIndent=20  # Adjust the indentation as needed
        )
        
        section_title_style = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontSize=11,
            leading=13,
            spaceAfter=6,
            textColor=colors.HexColor('#003366'),
            fontName='Helvetica-Bold',
            underline=True
        )
        
        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.white,
            alignment=1,  # Center
            fontName='Helvetica-Bold',
            backColor=colors.HexColor('#003366')  # Dark blue
        )
        
        table_content_style = ParagraphStyle(
            'TableContent',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#333333'),
            leading=10,
            alignment=1  # Center
        )
        
        terms_style = ParagraphStyle(
            'Terms',
            parent=styles['Normal'],
            fontSize=9,
            leading=11,
            spaceAfter=4,
            textColor=colors.HexColor('#333333')
        )
        terms_style1 = ParagraphStyle(
            'Terms',
            parent=styles['Normal'],
            fontSize=8,
            leading=5,
            spaceAfter=1,
            textColor=colors.HexColor('#333333')
        )
        
        note_style = ParagraphStyle(
            'Note',
            parent=styles['Normal'],
            fontSize=9,
            leading=11,
            spaceAfter=4,
            textColor=colors.HexColor('#555555'),
            backColor=colors.HexColor('#f5f5f5')  # Light gray background
        )

        # Add company header (left aligned)
        company_info = [
            Paragraph("S.S.B. ENGINEERS (P) LTD", company_style),
            Paragraph("133, M.I.A., Alwar-301030 (Rajasthan)-India", company_detail_style),
            Paragraph("CIN : U74899DL1995PTC073457", company_detail_style),
            Paragraph("Tel.: 9829218488 | email: ssb_engineers@yahoo.com", company_detail_style),
            Paragraph("GSTIN : 08AABC55551Q1Z5", company_detail_style),
        ]

        # Get supplier details or use NA if not available
        supplier_address = order.supplier_details or "NA"
        supplier_gstin = order.supplier_gstin or "NA"

        # Add party details (right aligned with more right margin)
        party_details = [
            Paragraph("TO:", party_title_style),
            Paragraph(order.supplier.name, party_style),
            Paragraph(supplier_address, party_style),
            Paragraph(f"GSTIN: {supplier_gstin}", party_style),
            Spacer(1, 8),
            Paragraph(f"<b>Order No.:</b> {order.po_number}", party_style),
            Paragraph(f"<b>Date:</b> {order.po_date.strftime('%d-%m-%Y')}", party_style),
        ]

        elements.append(logo)

        # Add title with horizontal line
        elements.append(Paragraph("PURCHASE ORDER", title_style))

        # Create a table for the header layout with right padding for party details
        header_table = Table([
            [company_info, party_details]
        ], colWidths=[300, 250])
        
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (1, 0), (1, 0), 20),  # Add right padding to party details
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        
        elements.append(header_table)

        # Add horizontal line after title
        elements.append(HRFlowable(width="100%", thickness=1, lineCap='round', 
                                color=colors.HexColor('#003366'), spaceAfter=12))

        # Add item description in a professional table
        item_description = f"""
        <b>Please find below the details of the ordered Raw Material:</b>
        """
        elements.append(Paragraph(item_description, section_title_style))
        elements.append(Spacer(1, 6))

        # Create table data for items
        price = order.price
        amount = order.qty * price
        
        table_data = [
            [
                Paragraph("S.N.", table_header_style),
                Paragraph("Description", table_header_style),
                Paragraph("HSN/SAC", table_header_style),
                Paragraph("Qty.", table_header_style),
                Paragraph("Unit", table_header_style),
                Paragraph("Rate", table_header_style),
                Paragraph("Amount (₹)", table_header_style)
            ],
            [
                Paragraph("1.", table_content_style),
                Paragraph(f"Grade: {order.rm_grade}, Dia: {order.bar_dia}MM Dia <br/>Standard: {order.rm_standard}", table_content_style),
                Paragraph("722830", table_content_style),
                Paragraph(f"{order.qty:,.2f}", table_content_style),
                Paragraph("Kgs.", table_content_style),
                Paragraph(f"₹ {price:,.2f}", table_content_style),
                Paragraph(f"₹ {amount:,.2f}", table_content_style)
            ]
        ]

        # Create item table with modern styling
        item_table = Table(table_data, colWidths=[50, 120, 70, 100, 40, 60, 100])
        item_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),  # Dark blue header
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dddddd')),  # Light gray grid
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(item_table)
        elements.append(Spacer(1, 12))

        # Add tax and total calculations with GST logic
        # In your download_po method, replace the tax calculations with:
        cgst_amount = Decimal('0.00')
        sgst_amount = Decimal('0.00')
        igst_amount = Decimal('0.00')
        if supplier_gstin.startswith('08'):
            # CGST 9% + SGST 9%
            cgst_amount = amount * Decimal('0.09')
            sgst_amount = amount * Decimal('0.09')
            tax_data = [
                [Paragraph(f"<b>Subtotal:</b>", terms_style), 
                Paragraph(f"\u20B9 {amount:,.2f}", terms_style)],
                [Paragraph(f"<b>Add: CGST @ 9%:</b>", terms_style), 
                Paragraph(f"\u20B9 {cgst_amount:,.2f}", terms_style)],
                [Paragraph(f"<b>Add: SGST @ 9%:</b>", terms_style), 
                Paragraph(f"\u20B9 {sgst_amount:,.2f}", terms_style)],
                [Paragraph(f"<b>Grand Total ({order.qty:,.2f} Kgs):</b>", terms_style), 
                Paragraph(f"<b>\u20B9 {(amount + cgst_amount + sgst_amount):,.2f}</b>", terms_style)]
            ]
        else:
            # IGST 18%
            igst_amount = amount * Decimal('0.18')
            tax_data = [
                [Paragraph(f"<b>Subtotal:</b>", terms_style), 
                Paragraph(f"\u20B9 {amount:,.2f}", terms_style)],
                [Paragraph(f"<b>Add: IGST @ 18%:</b>", terms_style), 
                Paragraph(f"\u20B9 {igst_amount:,.2f}", terms_style)],
                [Paragraph(f"<b>Grand Total ({order.qty:,.2f} Kgs):</b>", terms_style), 
                Paragraph(f"<b>\u20B9 {(amount + igst_amount):,.2f}</b>", terms_style)]
            ]
        
        tax_table = Table(tax_data, colWidths=[400, 100])
        tax_table.setStyle(TableStyle([
            ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(tax_table)
        elements.append(Spacer(1, 8))

        # Add amount in words with highlight
        grand_total = amount + (igst_amount if supplier_gstin.startswith('08') else cgst_amount + sgst_amount)
        amount_in_words = num2words(grand_total, lang='en_IN').title()
        elements.append(Paragraph(f"<b>Amount in words:</b> Rupees {amount_in_words} Only", 
                                ParagraphStyle(
                                    name='AmountInWords',
                                    parent=terms_style,
                                    backColor=colors.HexColor('#f5f5f5'),
                                    leftIndent=10,
                                    borderPadding=5,
                                    spaceAfter=12
                                )))

        # Add terms and conditions section
        elements.append(Paragraph("TERMS & CONDITIONS", section_title_style))
        
        terms = [
             f"<b>IDENTIFICATION:</b> One side stickers with Heat No., Grade: {order.rm_grade or 'N/A'}, Dia: {order.bar_dia or 'N/A'} and one side colour coding as per SSB chart<br/><br/>",
             f"<b>Standard:</b> Material should comply with: {order.rm_standard or 'N/A'}<br/><br/>",
             "<b>SUPPLY CONDITION:</b> AS HOT ROLLED<br/><br/>",
              "<b>BAR LENGTH:</b> LENGTH RANGE: MIN. 5.5 MTS TO 6 MTS.<br/><br/>",
            f"<b>PAYMENT TERMS:</b> {order.payment_terms or '30'} DAYS DIRECT CREDIT<br/><br/>",
             "<b>MPI / UT TESTING:</b> 100% INSPECTION DONE BY MPI / UT<br/><br/>",
              "<b>TEST CERTIFICATE:</b> TO BE ENCLOSED ALONG WITH INVOICE<br/><br/>",
              "<b>OE CHANGE:</b> W.E.F. 01/10/2024 of ₹2000/-PMT considered. Any changes after that will be adjusted accordingly.<br/><br/>",
        ]
        
        for term in terms:
            elements.append(Paragraph(f"• {term}", terms_style1))
        
        elements.append(Spacer(1, 12))
        
        # Add declaration section
        elements.append(Paragraph("DECLARATION", section_title_style))
        
        declaration = """
        • In case of rejection due to raw material at any stage (Raw material + Value Addition cost + transportation cost) 
        shall be debited to your account<br/>
        • Material should Adhere to Standard<br/>
        • Gas cutting on bar end is not acceptable<br/>
        • Material Binding should be through Strips only (do not use steel wire)<br/>
        • Max. Weight variation accepted is 30 kg up to 20 MT & 50 kg above 20 MT<br/>
        • Any variation above this will be debited to supplier account
        """
        elements.append(Paragraph(declaration, note_style))
        elements.append(Spacer(1, 52))


        approval_time = order.approval_time if order.approval_time else datetime.now()
        approved_by = order.approved_by or "Authorized Signatory"
        SECRET_KEY = b"my_super_secret_key_123"

        signature = self.generate_digital_signature(
            SECRET_KEY,
            order.po_number, 
            approved_by, 
            approval_time  # Pass the datetime object directly
        )

        checkmark = self.get_checkmark_image()  # Transparent checkmark as background

        # Right side: Released By
        released_by_text = Paragraph(
            f'<b>Released By</b><br/>'
            
            f'<b>{order.verified_by or "Name"}</b><br/>'
            '﹉﹉﹉﹉﹉﹉﹉﹉﹉﹉﹉﹉﹉﹉',
            styles["Normal"]
        )



        # Signature data with checkmark background
        formatted_time = approval_time.strftime("%Y-%m-%d %H:%M:%S")
        signature_data = Table([
            [checkmark, Paragraph(
                f'<font size=8>PO: {order.po_number}<br/>'
                f'Approved By: {approved_by}<br/>'
                f'Approval Time: {formatted_time}<br/>'
                f'Signature: {signature[:20]}...</font>',
                styles['Normal']
            )]
        ], colWidths=[50, 200])

        # Generate QR code
        qr_code = None
        try:
            from reportlab.graphics.barcode import qr
            from reportlab.graphics.shapes import Drawing
            
            verification_data = (
                f"PO Verification\n"
                f"PO Number: {order.po_number}\n"
                f"Approved By: {approved_by}\n"
                f"Approval Time: {approval_time}\n"
                f"Signature: {signature}"
            )
            
            qr_code = qr.QrCodeWidget(verification_data)
            bounds = qr_code.getBounds()
            width, height = bounds[2] - bounds[0], bounds[3] - bounds[1]
            
            d = Drawing(60, 60, transform=[60./width, 0, 0, 60./height, 0, 0])
            d.add(qr_code)
        except ImportError:
            pass

        sign_table_data = [
            [
                released_by_text,  # Left column (Released By)
                signature_data,    # Middle column (Signature)
                d if qr_code else ""  # Right column (QR Code)
            ],
        ]

        # Reduce width of the middle column to bring signature_data closer to QR Code
        sign_table = Table(sign_table_data, colWidths=[400, 180, 1])

        sign_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),     # Align "Released By" text to left
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),    # Align Signature to the right (closer to QR)
            ('ALIGN', (2, 0), (2, -1), 'RIGHT'),    # Align QR Code to right
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), # Ensure vertical alignment
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('LEADING', (0, 0), (-1, -1), 14),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),   # Remove all left padding
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),  # Remove all right padding
            ('TOPPADDING', (0, 0), (-1, -1), 0),    # Remove all top padding
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0), # Remove all bottom padding
        ]))

        # Ensure table aligns properly
        sign_table.hAlign = 'LEFT'  # Adjust to 'RIGHT' if needed




        elements.append(sign_table)
        elements.append(Spacer(1, 15))

        # Build the PDF
        doc.build(elements)

        # File response
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="PO_{order.po_number}.pdf"'
        return response
            
@api_view(['GET'])
def get_supplier_details(request, supplier_id):
    try:
        supplier = Supplier.objects.get(id=supplier_id)
        data = {
            'supplier_details': supplier.supplier_details,
            'supplier_gstin': supplier.supplier_gstin,
            'delivery_days': supplier.delivery_days
        }
        return Response(data)
    except Supplier.DoesNotExist:
        return Response({'error': 'Supplier not found'}, status=404)
    

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Order
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
def pending_po_approvals(request):
    # Get pending orders with essential fields only
    pending_orders = Order.objects.filter(
        approval_status="Pending"
    ).select_related('supplier').only(
        'id',
        'po_number',
        'po_date',
        'supplier',  # Assuming supplier has a 'name' field
        'rm_grade',
        'bar_dia',
        'price',
        'qty',
        'delivery_date',
        'verified_by'
    ).order_by('po_date')[:50]  # Limit to 50 most recent pending orders
    
    # Convert to simple dict format for faster serialization
    data = [{
        'id': order.id,
        'po_number': order.po_number,
        'po_date': order.po_date.strftime('%Y-%m-%d'),
        'supplier': order.supplier.name,
        'grade': order.rm_grade,
        'dia': order.bar_dia,
        'price': order.price,
        'qty': order.qty,
        'delivery_date': order.delivery_date.strftime('%Y-%m-%d') if order.delivery_date else None,
        'verified_by': order.verified_by,
        'days_pending': (timezone.now().date() - order.po_date).days
    } for order in pending_orders]
    
    return Response({'pending_approvals': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ensure user is authenticated
def update_approval_status(request):
    order_id = request.data.get('order_id')
    status = request.data.get('status')  # 'Approved' or 'Rejected'
    approved_by = request.data.get('approved_by')  # Get from frontend
    
    # Validate input data
    if not all([order_id, status, approved_by]) or status not in ['Approved', 'Rejected']:
        return Response(
            {'error': 'Invalid data. Required fields: order_id, status, approved_by'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        order = Order.objects.get(id=order_id)
        
        # Update order fields
        order.approval_status = status
        order.approved_by = approved_by  # Use the full name from frontend
        order.approval_time = timezone.now()
        order.save()
        
        return Response({
            'success': True,
            'message': f'Order {order.po_number} has been {status.lower()}',
            'approval_time': order.approval_time
        })
        
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )