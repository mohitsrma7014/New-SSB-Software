from django.db import models
import json
import os
from datetime import datetime
from django.utils import timezone

class RawMaterial(models.Model):
    date = models.DateField()
    supplier = models.CharField(max_length=100)
    grade = models.CharField(max_length=50)
    customer = models.CharField(max_length=100)
    standerd = models.CharField(max_length=100)
    heatno = models.CharField(max_length=50)
    dia = models.CharField(max_length=100)
    weight = models.DecimalField(max_digits=10, decimal_places=2)
    rack_no = models.CharField(max_length=50)
    location = models.CharField(max_length=100)
    type_of_material = models.CharField(max_length=100)
    cost_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    invoice_no = models.CharField(max_length=50)
    milltc = models.FileField(upload_to='reports/MILLTC', null=True, blank=True)
    spectro = models.FileField(upload_to='reports/SPECTRO', null=True, blank=True)
    ssb_inspection_report = models.FileField(upload_to='reports/SSBINSPECTION', null=True, blank=True)

    verified_by = models.CharField(max_length=150, blank=True)
    approval_status = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        choices=[
            ('Under Inspection', 'Under Inspection'),
            ('Hold', 'Hold'),
            ('Approved', 'Approved'),
            ('Rejected', 'Rejected')
        ],
        default=None  # Change from 'Under Inspection' to None
    )
    comments = models.CharField(max_length=300,blank=True, null=True)

    def __str__(self):
        return f"{self.supplier} - {self.grade} - {self.invoice_no} - {self.heatno}"

    def save(self, *args, **kwargs):
        print(f"Before Save - type_of_material: {self.type_of_material}, approval_status: {self.approval_status}")  # Debugging
        if self.approval_status is None or self.approval_status == '':
            if self.type_of_material.strip().upper() == 'JOB WORK':
                self.approval_status = 'Approved'
            else:
                self.approval_status = 'Under Inspection'
        print(f"After Save - approval_status: {self.approval_status}")  # Debugging
        super().save(*args, **kwargs)


    
class Blockmt(models.Model):
    block_mt_id = models.CharField(max_length=100, unique=True, blank=True)
    component = models.CharField(max_length=100)
    customer = models.CharField(max_length=100)
    supplier = models.CharField(max_length=100)
    grade = models.CharField(max_length=50)
    standerd = models.CharField(max_length=100) 
    heatno = models.CharField(max_length=50)
    dia = models.CharField(max_length=100)
    rack_no = models.CharField(max_length=50)
    pices = models.IntegerField()
    weight = models.DecimalField(max_digits=10, decimal_places=2)
    line = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)  # Add this field
    verified_by = models.CharField(max_length=150, blank=True)  # New field to store the username

    def __str__(self):
        return f"{self.block_mt_id} - {self.component} - {self.weight}"

    def save(self, *args, **kwargs):
        if not self.block_mt_id:  # Only generate if not already set
            file_path = 'path_to_count_file.json'  # Specify the correct path
            counts = read_counts(file_path)
            
            customer_name = self.customer
            current_date = datetime.now().strftime("%Y%m%d")
            customer_initials = customer_name[:2].upper()
            key = f"{current_date}_{customer_initials}"
            
            if key in counts:
                current_count = counts[key] + 1
            else:
                current_count = 1
            
            counts[key] = current_count
            self.block_mt_id = generate_mt_block_number(customer_name, current_count)
            
            write_counts(file_path, counts)
        
        super().save(*args, **kwargs)

def generate_mt_block_number(customer_name, count):
    current_date = datetime.now()
    prefix = 'PP'  # Prefix for MT Block ID
    year_str = str(current_date.year)
    month_str = f"{current_date.month:02d}"
    day_str = f"{current_date.day:02d}"
    customer_initials = customer_name[:2].upper()
    count_str = f"{count:02d}"
    
    block_mt_number = f"{prefix}-{year_str}{month_str}{day_str}-{customer_initials}-{count_str}"
    return block_mt_number

def read_counts(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            return json.load(file)
    else:
        return {}

def write_counts(file_path, counts):
    with open(file_path, 'w') as file:
        json.dump(counts, file)

class BatchTracking(models.Model):
    block_mt_id = models.CharField(max_length=100)
    batch_number = models.CharField(max_length=50, unique=True)
    qr_code = models.ImageField(upload_to='qrcodes/', blank=True, null=True)
    customer = models.CharField(max_length=100)
    standerd = models.CharField(max_length=100)
    component_no = models.CharField(max_length=100)
    material_grade = models.CharField(max_length=100)
    bardia = models.CharField(max_length=100)
    heat_no = models.CharField(max_length=100)
    rack_no = models.CharField(max_length=100)
    bar_qty = models.CharField(max_length=100)
    kg_qty = models.DecimalField(max_digits=10, decimal_places=2)
    line = models.CharField(max_length=100)
    supplier = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    verified_by = models.CharField(max_length=150, blank=True)  # New field to store the username

    def __str__(self):
        return self.batch_number
    


class Supplier(models.Model):
    name = models.CharField(max_length=100, unique=True)
    delivery_days = models.IntegerField()  # No. of days required for delivery

    def __str__(self):
        return self.name

class Grade(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Customer(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class TypeOfMaterial(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class MaterialType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    

class rmreciveinbatch(models.Model):
    block_mt_id = models.CharField(max_length=100)
    weight = models.DecimalField(max_digits=10, decimal_places=2)
    heatno = models.CharField(max_length=50)
    dia = models.CharField(max_length=100)
    pcs = models.IntegerField()
    rack_no = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_by = models.CharField(max_length=150, blank=True)
    

    def __str__(self):
        return f"{self.block_mt_id} - {self.weight}"
    

from django.db import models

class Masterlist(models.Model):
    component = models.CharField(max_length=100)
    part_name= models.CharField(max_length=100)
    customer = models.CharField(max_length=100)
    drawing_number = models.IntegerField()
    standerd= models.CharField(max_length=100)
    material_grade= models.CharField(max_length=100)
    slug_weight = models.DecimalField(max_digits=10, decimal_places=2)
    bar_dia = models.CharField(max_length=100)
    process = models.CharField(max_length=100)
    ring_weight = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    component_cycle_time = models.IntegerField()
    

    def __str__(self):
        return f"{self.component} - {self.customer} - {self.drawing_number}"
    

class Schedule(models.Model):
    component = models.CharField(max_length=100)
    customer = models.CharField(max_length=100)
    supplier = models.CharField(max_length=100, blank=True)
    grade = models.CharField(max_length=50)
    standerd = models.CharField(max_length=100, blank=True)
    dia = models.CharField(max_length=100)
    slug_weight=  models.DecimalField(max_digits=10, decimal_places=3)
    pices = models.IntegerField()
    weight = models.DecimalField(max_digits=10, decimal_places=2)
    date1 = models.CharField(max_length=100)
    location = models.CharField(max_length=150, blank=True)
    verified_by = models.CharField(max_length=150, blank=True)  # New field to store the username
    created_at = models.DateTimeField(auto_now_add=True)  # Add this field

    def __str__(self):
        return f"{self.component} - {self.weight}"
    
class dispatch(models.Model):
    date = models.DateField()
    component = models.CharField(max_length=100)
    pices = models.IntegerField()
    invoiceno= models.CharField(max_length=100)
    addpdf=models.FileField(upload_to='reports/', null=True, blank=True)
    verified_by = models.CharField(max_length=150, blank=True)  # New field to store the username
    heat_no = models.CharField(max_length=100)
    # Additional fields to track production values
    target1 = models.IntegerField(default=0)
    total_produced = models.IntegerField(default=0)
    remaining = models.IntegerField(default=0)
    batch_number = models.CharField(max_length=50)
    verified_by = models.CharField(max_length=100, blank=True)  # Allow it to be blank

    def __str__(self):
        return f"{self.component} - {self.invoiceno}"
    

from datetime import timedelta

class Order(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    rm_grade = models.CharField(max_length=100)
    rm_standard = models.CharField(max_length=100)
    bar_dia = models.FloatField()
    qty = models.IntegerField()
    po_date = models.DateField()
    delivery_date = models.DateField(blank=True, null=True)
    heat_no = models.CharField(max_length=100, blank=True, null=True)
    po_number = models.CharField(max_length=100, blank=True, null=True)
    actual_delivery_date = models.DateField(blank=True, null=True)
    verified_by = models.CharField(max_length=100, blank=True, null=True)
    delay_days = models.IntegerField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.delivery_date:
            self.delivery_date = self.po_date + timedelta(days=self.supplier.delivery_days)
        super().save(*args, **kwargs)
