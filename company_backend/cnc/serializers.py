# serializers.py

from rest_framework import serializers
from .models import machining,Cnc_line_master,LineHistory

class MachiningSerializer(serializers.ModelSerializer):

    class Meta:
        model = machining
        fields = '__all__'

class LineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cnc_line_master
        fields = '__all__'  # Include all fields

class LineHistorySerializer(serializers.ModelSerializer):

    changed_by = serializers.CharField(source="changed_by.get_full_name", read_only=True)  # Get name
    class Meta:
        model = LineHistory
        fields = '__all__'
