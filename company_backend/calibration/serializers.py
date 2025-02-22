from rest_framework import serializers
from .models import CALIBRATION, CALIBRATIONHistory

class ComplaintSerializer(serializers.ModelSerializer):
    add_pdf = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = CALIBRATION
        fields = "__all__"



class ComplaintHistorySerializer(serializers.ModelSerializer):

    changed_by = serializers.CharField(source="changed_by.get_full_name", read_only=True)  # Get name
    class Meta:
        model = CALIBRATIONHistory
        fields = '__all__'

from .models import ID

class IDSerializer(serializers.ModelSerializer):
    class Meta:
        model = ID
        fields = '__all__'
