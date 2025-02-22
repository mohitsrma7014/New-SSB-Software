from rest_framework import serializers
from .models import Complaint, ComplaintHistory

class ComplaintSerializer(serializers.ModelSerializer):
    complaintfile = serializers.FileField(required=False, allow_null=True)
    avidancefile = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Complaint
        fields = "__all__"



class ComplaintHistorySerializer(serializers.ModelSerializer):

    changed_by = serializers.CharField(source="changed_by.get_full_name", read_only=True)  # Get name
    class Meta:
        model = ComplaintHistory
        fields = '__all__'
