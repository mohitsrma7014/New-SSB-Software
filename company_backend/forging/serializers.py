# serializers.py

from rest_framework import serializers
from .models import Forging

class ForgingSerializer(serializers.ModelSerializer):
    rejection_percentage = serializers.ReadOnlyField()
    production_weight_kg = serializers.ReadOnlyField()
    production_weight_ton = serializers.ReadOnlyField()

    class Meta:
        model = Forging
        fields = '__all__'
