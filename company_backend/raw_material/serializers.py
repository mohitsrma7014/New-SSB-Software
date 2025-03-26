# serializers.py
from rest_framework import serializers
from .models import RawMaterial,Schedule,Order

class RawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawMaterial
        fields = '__all__'

    def create(self, validated_data):
        # Remove approval_status if not explicitly provided in the request
        if 'approval_status' not in self.initial_data:
            validated_data.pop('approval_status', None)

        raw_material = RawMaterial(**validated_data)
        raw_material.save()  # Model's save logic will handle approval_status
        return raw_material

    def update(self, instance, validated_data):
        # Handle file uploads explicitly and update the instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


from rest_framework import serializers
from .models import Blockmt

class BlockmtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blockmt
        fields = ['id', 'block_mt_id', 'component', 'customer', 'supplier', 'grade', 'standerd', 
                  'heatno', 'dia', 'rack_no', 'pices', 'weight', 'line', 'created_at', 'verified_by']
        read_only_fields = ['block_mt_id', 'created_at']  # block_mt_id and created_at are auto-generated
# serializers.py
from rest_framework import serializers
from .models import Masterlist

class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Masterlist
        fields = ['component']

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blockmt
        fields = ['block_mt_id']


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'
from .models import dispatch

class DispatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = dispatch
        fields = '__all__'  # Include all fields from the model
from .models import RawMaterial
from .models import BatchTracking

class BatchTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchTracking
        fields = '__all__'

from .models import Supplier, Grade, Customer, TypeOfMaterial, MaterialType
class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'

class Customer1Serializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class TypeOfMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeOfMaterial
        fields = '__all__'

class MaterialTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialType
        fields = '__all__'



class MasterListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Masterlist
        fields = '__all__'


# Serializer
class OrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('delivery_date', 'delay_days')


from .models import Masterlist

class MasterlistHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Masterlist.history.model  # Access the history model
        fields = '__all__'  # Include all fields in the history model


from .models import PurchaseOrder, Goods

class GoodsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goods
        fields = ['id', 'name', 'quantity', 'unit_price', 'total_price', 'purchase_order']
        read_only_fields = ['id', 'purchase_order']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    goods = GoodsSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'po_number', 'date', 'supplier_name', 'user', 'total_amount', 'year', 'goods']
        read_only_fields = ['id', 'po_number', 'date']

class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    goods = GoodsSerializer(many=True)

    class Meta:
        model = PurchaseOrder
        fields = ['supplier_name', 'user', 'total_amount', 'year', 'goods']

    def create(self, validated_data):
        goods_data = validated_data.pop('goods')
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        for good_data in goods_data:
            Goods.objects.create(purchase_order=purchase_order, **good_data)
        return purchase_order
    

from .models import MaterialComplaint

class MaterialComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialComplaint
        fields = '__all__'
        extra_kwargs = {
            'verified_by': {'required': False}  # Since it's set automatically
        }

class MaterialComplaintUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialComplaint
        fields = ['d8_report', 'remark']

    def update(self, instance, validated_data):
        # Check if d8_report is being updated and not empty
        if 'd8_report' in validated_data and validated_data['d8_report']:
            instance.status = 'Closed'  # Change status to Closed

        # Update instance with new data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()  # Explicitly save the instance
        return instance