from django.db import models
import json
import os
from datetime import datetime
from django.utils import timezone
from django.conf import settings


# class instrument_po (models.Model):
#     uid = models.CharField(max_length=100, unique=True, blank=True)
#     po_number = models.CharField(max_length=100)
#     catogary = models.CharField(max_length=100)
#     name_of_instrument = models.CharField(max_length=100)
#     type_of_instrument = models.CharField(max_length=100, null=True, blank=True)
#     component = models.CharField(max_length=100)
#     supplier = models.CharField(max_length=50)
#     add_pdf = models.FileField(upload_to='calibration/', null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)  # Add this field
#     verified_by = models.CharField(max_length=150, blank=True)  # New field to store the username

#     def __str__(self):
#         return f"{self.uid} - {self.catogary} - {self.name_of_instrument}"

#     def save(self, *args, **kwargs):
#         if not self.uid:  # Only generate if not already set
#             file_path = 'path_to_count_calibration.json'  # Specify the correct path
#             counts = read_counts(file_path)
            
#             customer_name = self.catogary
#             other_name = self.type_of_instrument
#             current_date = datetime.now().strftime("%Y%m%d")
#             customer_initials = customer_name[:3].upper()
#             other_initials = other_name.upper()
#             key = f"{current_date}_{customer_initials}"
            
#             if key in counts:
#                 current_count = counts[key] + 1
#             else:
#                 current_count = 1
            
#             counts[key] = current_count
#             self.uid = generate_mt_block_number(customer_name, current_count,other_initials)
            
#             write_counts(file_path, counts)
        
#         super().save(*args, **kwargs)

# def generate_mt_block_number(customer_name, count, other_initials):
#     current_date = datetime.now()
#     prefix = 'SSB'  # Prefix for MT Block ID
#     year_str = str(current_date.year)
#     month_str = f"{current_date.month:02d}"
#     day_str = f"{current_date.day:02d}"
#     customer_initials = customer_name[:3].upper()
    
#     # Only add other_initials if it's not empty or None
#     if other_initials:
#         other_initials = f"/{other_initials.upper()}"
#     else:
#         other_initials = ""
    
#     count_str = f"{count:02d}"
    
#     # Construct the block_mt_number
#     block_mt_number = f"{prefix}/{customer_initials}-{count_str}{other_initials}"
    
#     return block_mt_number

# def read_counts(file_path):
#     if os.path.exists(file_path):
#         with open(file_path, 'r') as file:
#             return json.load(file)
#     else:
#         return {}

# def write_counts(file_path, counts):
#     with open(file_path, 'w') as file:
#         json.dump(counts, file)


class CALIBRATION(models.Model):
    po_date = models.CharField(max_length=100, null=True, blank=True)
    name_of_instrument = models.CharField(max_length=100, blank=True)
    uid = models.CharField(max_length=100,unique=True, blank=True)
    catagory = models.CharField(max_length=100, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    supplier = models.CharField(max_length=100, null=True, blank=True)
    CALIBRATION_AGENCY = models.CharField(max_length=100, null=True, blank=True)
    CALIBRATION_DONE_DATE = models.CharField(max_length=100, null=True, blank=True)
    due_date = models.CharField(max_length=100, null=True, blank=True)
    RANGE = models.CharField(max_length=100, null=True, blank=True)
    LEAST_COUNT = models.CharField(max_length=100, null=True, blank=True)
    LOCATION = models.CharField(max_length=50, null=True, blank=True)
    component = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=100, null=True, blank=True)
    remark = models.CharField(max_length=100, null=True, blank=True)
    add_pdf = models.FileField(upload_to='calibration_certificate/', null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    serial_number = models.CharField(max_length=100, null=True, blank=True)

class CALIBRATIONHistory(models.Model):
    complaint = models.ForeignKey(CALIBRATION, on_delete=models.CASCADE, related_name="history")
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    field_changed = models.CharField(max_length=255)
    old_value = models.TextField(blank=True, null=True)  # Allow null for file fields
    new_value = models.TextField(blank=True, null=True)  # Allow null for file fields


class ID(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('received', 'Received'),
        ('canceled', 'Canceled'),
    ]

    category = models.CharField(max_length=100)
    uid = models.CharField(max_length=255, unique=True)
    receiving_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    verified_by = models.CharField(max_length=100, null=True, blank=True)
    supplier = models.CharField(max_length=100, null=True, blank=True)
    name_of_instrument = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.uid} - {self.receiving_status}"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Supplier(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Instrument(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name