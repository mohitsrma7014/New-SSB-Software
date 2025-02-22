# serializers.py
from rest_framework import serializers
from .models import RawMaterial,Schedule

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
