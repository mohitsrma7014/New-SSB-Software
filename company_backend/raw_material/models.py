from django.db import models
import json
import os
from datetime import datetime
from django.utils import timezone
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Max
from django.db import models
from django.db.models import Max, Sum
from datetime import timedelta, datetime, date

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
    supplier_details = models.CharField(max_length=100, blank=True, null=True)  # No. of days required for delivery
    supplier_gstin = models.CharField(max_length=100, blank=True, null=True)  # No. of days required for delivery

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
from simple_history.models import HistoricalRecords

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
    op_10_time = models.IntegerField(blank=True, null=True)
    op_10_target = models.IntegerField(blank=True, null=True)
    op_20_time = models.IntegerField(blank=True, null=True)
    op_20_target = models.IntegerField(blank=True, null=True)
    cnc_target_remark = models.CharField(max_length=500,blank=True, null=True)
    
    history = HistoricalRecords()

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
    APPROVAL_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]
    STATUS = [
        ("Open", "Open"),
        ("Close", "Close"),
    ]
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    supplier_details = models.CharField(max_length=100, blank=True, null=True)
    supplier_gstin = models.CharField(max_length=100, blank=True, null=True)
    po_number = models.CharField(max_length=100, blank=True, null=True)
    po_date = models.DateField()
    description_of_good = models.CharField(max_length=100, blank=True, null=True)
    rm_grade = models.CharField(max_length=100)
    rm_standard = models.CharField(max_length=100)
    bar_dia = models.FloatField()
    price = models.DecimalField(max_digits=10, decimal_places=3)
    qty = models.IntegerField(blank=True, null=True)
    force_closed = models.BooleanField(default=False)
    
    delivery_date = models.DateField(blank=True, null=True)
    heat_no = models.CharField(max_length=100, blank=True, null=True)

    approval_status = models.CharField(
        max_length=100, choices=APPROVAL_CHOICES, default="Pending"
    )  # D
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    approval_time = models.DateTimeField(blank=True, null=True)  # New Field
    status =  models.CharField(
        max_length=100, choices=STATUS, default="Open"
    )  # D
    actual_delivery_date = models.DateField(blank=True, null=True)
    verified_by = models.CharField(max_length=100, blank=True, null=True)
    delay_days = models.IntegerField(blank=True, null=True)
    completion_date = models.DateField(blank=True, null=True, editable=False)

    class Meta:
        ordering = ['-po_date']
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"

    def __str__(self):
        return f"{self.po_number} - {self.supplier}"

    @property
    def received_qty(self):
        """Calculate total received quantity from all heat numbers"""
        if not self.pk:  # Avoid querying related objects before saving
            return 0
        return self.heat_numbers.aggregate(total=Sum('received_qty'))['total'] or 0

    @property
    def remaining_qty(self):
        """Calculate remaining quantity to be received"""
        return self.qty - self.received_qty

    @property
    def is_complete(self):
        """Check if order is fully received"""
        return self.received_qty >= self.qty

    def calculate_delay_days(self):
        """
        Calculate overall order delay based on:
        - Completion date (date when order was fully received)
        - Original promised delivery_date
        """
        if not self.is_complete or not self.completion_date or not self.delivery_date:
            return 0
            
        delay = (self.completion_date - self.delivery_date).days
        return max(delay, 0)  # Return 0 if delivery was early

    def update_status_and_completion(self):
        """Update order status and completion details"""
        if self.force_closed:
            self.status = "Closed"
            return
            
        if self.is_complete:
            self.status = "Closed"
            # Set completion date to the latest heat number's received date
            last_delivery = self.heat_numbers.order_by('-received_date').first()
            if last_delivery:
                self.completion_date = last_delivery.received_date
        elif self.received_qty > 0:
            self.status = "Partially Received"
        else:
            self.status = "Open"
        
        # Update delay days
        self.delay_days = self.calculate_delay_days()

    def save(self, *args, **kwargs):
        # Set delivery date if not provided
        if not self.delivery_date and self.po_date and hasattr(self, 'supplier'):
            self.delivery_date = self.po_date + timedelta(days=self.supplier.delivery_days)

        # Auto-fill approval time when approved_by is filled
        if self.approved_by and not self.approval_time:
            self.approval_time = datetime.now()

        # Generate PO Number if not already set
        if not self.po_number and self.po_date:
            current_year = self.po_date.year
            current_month = f"{self.po_date.month:02d}"
            last_po = Order.objects.filter(
                po_number__startswith=f"{current_year}-{current_month}-R"
            ).aggregate(Max('po_number'))['po_number__max']

            if last_po:
                last_number = int(last_po.split("-")[-1][1:])
                new_number = last_number + 1
            else:
                new_number = 1
            self.po_number = f"{current_year}-{current_month}-R{new_number:03d}"  # 3-digit format

        # Update status and completion details
        self.update_status_and_completion()
        
        super().save(*args, **kwargs)


class HeatNumber(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='heat_numbers')
    heat_no = models.CharField(max_length=100)
    received_qty = models.IntegerField()
    received_date = models.DateField()
    actual_delivery_date = models.DateField(blank=True, null=True)
    verified_by = models.CharField(max_length=100, blank=True, null=True)
    delay_days = models.IntegerField(blank=True, null=True, editable=False)
    delay_reason = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        ordering = ['-received_date']
        verbose_name = "Heat Number Delivery"
        verbose_name_plural = "Heat Number Deliveries"

    def __str__(self):
        return f"{self.heat_no} - {self.received_qty} units"

    def calculate_delay_days(self):
        """Calculate delay for this specific heat number"""
        if self.actual_delivery_date and self.order.delivery_date:
            delay = (self.actual_delivery_date - self.order.delivery_date).days
            return max(delay, 0)  # Return 0 if delivery was early
        return 0

    def save(self, *args, **kwargs):
        # Set actual delivery date to received date if not provided
        if not self.actual_delivery_date:
            self.actual_delivery_date = self.received_date
        
        # Calculate delay days before saving
        self.delay_days = self.calculate_delay_days()
        
        super().save(*args, **kwargs)
        
        # Update parent order's status and delay days
        self.order.save()

    def delete(self, *args, **kwargs):
        order = self.order
        super().delete(*args, **kwargs)
        # Update parent order after deletion
        order.save()


from django.db import models

class PurchaseOrder(models.Model):
    po_number = models.CharField(max_length=20, unique=True)
    date = models.DateField(auto_now_add=True)
    supplier_name = models.CharField(max_length=255)
    user = models.CharField(max_length=100, blank=True, null=True)  # Store username or user identifier
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    year = models.IntegerField()

    def save(self, *args, **kwargs):
        if not self.po_number:
            last_po = PurchaseOrder.objects.filter(year=self.year).order_by('-po_number').first()
            if last_po:
                last_number = int(last_po.po_number.split('-')[-1])
                self.po_number = f"PO-{self.year}-{str(last_number + 1).zfill(3)}"
            else:
                self.po_number = f"PO-{self.year}-001"
        super().save(*args, **kwargs)

class Goods(models.Model):
    name = models.CharField(max_length=255)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE)



class MaterialComplaint(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Closed', 'Closed'),
    ]

    supplier = models.CharField(max_length=255)
    heat = models.CharField(max_length=100)
    grade = models.CharField(max_length=50)
    dia = models.DecimalField(max_digits=10, decimal_places=2)
    complaint_date = models.DateField()
    closing_date = models.DateField(null=True, blank=True)
    issue = models.TextField()
    location = models.CharField(max_length=255)
    remark = models.TextField(blank=True, null=True)
    component = models.CharField(max_length=100)
    pices = models.IntegerField()
    verified_by = models.CharField(max_length=150, blank=True)
    Complaint_photo = models.FileField(upload_to='RmComplaint/Complaint_photo', null=True, blank=True)
    d8_report = models.FileField(upload_to='RmComplaint/d8_report', null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Open')

    class Meta:
        indexes = [
            models.Index(fields=['supplier']),
            models.Index(fields=['heat']),
            models.Index(fields=['grade']),
            models.Index(fields=['complaint_date']),
        ]

    def __str__(self):
        return f"{self.supplier} - {self.heat} - {self.grade}"

    def save(self, *args, **kwargs):
                # Automatically set closing_date to 15 days after complaint_date if not manually set
        if self.complaint_date and not self.closing_date:
            self.closing_date = self.complaint_date + timedelta(days=15)

        # Automatically set status based on d8_report field
        if self.d8_report:
            self.status = 'Closed'
        else:
            self.status = 'Open'
        super().save(*args, **kwargs)


class SupplierAuditScore(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    month = models.DateField()  # Storing as first day of month
    audit_score = models.DecimalField(max_digits=5, decimal_places=2)  # Percentage score
    
    class Meta:
        unique_together = ('supplier', 'month')
        indexes = [
            models.Index(fields=['supplier', 'month']),
        ]