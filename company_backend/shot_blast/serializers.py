# serializers.py

from rest_framework import serializers
from .models import Shotblast

class ShotblastSerializer(serializers.ModelSerializer):

    class Meta:
        model = Shotblast
        fields = '__all__'
