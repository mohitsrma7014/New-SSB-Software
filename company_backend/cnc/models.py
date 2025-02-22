from django.db import models
import json
import os
from datetime import datetime
from django.conf import settings
class machining(models.Model):
    batch_number = models.CharField(max_length=50)
    date = models.DateField()
    shift = models.CharField(max_length=100)
    component = models.CharField(max_length=100)
    machine_no = models.CharField(max_length=100)
    mc_type = models.CharField(max_length=100)
    operator = models.CharField(max_length=100)
    inspector = models.CharField(max_length=100)
    setup =  models.CharField(max_length=100)
    target = models.IntegerField()
    production = models.IntegerField()
    remark =  models.CharField(max_length=100)
    cnc_height = models.IntegerField()
    cnc_od = models.IntegerField()
    cnc_bore = models.IntegerField()
    cnc_groove = models.IntegerField()
    cnc_dent = models.IntegerField()
    forging_height = models.IntegerField()
    forging_od = models.IntegerField()
    forging_bore = models.IntegerField()
    forging_crack = models.IntegerField() 
    forging_dent = models.IntegerField()
    pre_mc_height = models.IntegerField()
    pre_mc_od = models.IntegerField()
    pre_mc_bore = models.IntegerField()
    rework_height = models.IntegerField()
    rework_od = models.IntegerField()
    rework_bore = models.IntegerField()
    rework_groove = models.IntegerField()
    rework_dent = models.IntegerField()
    verified_by = models.CharField(max_length=100, blank=True)  # Allow it to be blank
    heat_no = models.CharField(max_length=100)
    target1 = models.IntegerField()
    total_produced = models.IntegerField()
    remaining = models.IntegerField(default=0)
    def __str__(self):
        return self.component
    

class Cncplanning(models.Model):
    Cnc_uid = models.CharField(max_length=150, unique=True)
    create_date = models.DateField()
    Target_start_date = models.DateField()
    Target_End_date = models.DateField()
    component = models.CharField(max_length=100)
    customer = models.CharField(max_length=100)
    target = models.IntegerField()
    component_cycle_time = models.IntegerField()
    required_cycle_time = models.IntegerField()
    cnc_line = models.CharField(max_length=100)
    cell = models.CharField(max_length=100, blank=True)
    cell_cycle_time = models.IntegerField( blank=True)
    machine_no = models.CharField(max_length=100, blank=True)
    machine_cycle_time = models.IntegerField( blank=True)
    done =  models.CharField(max_length=100,blank=True)
    how_much_compleate = models.IntegerField(blank=True)
    done_marked_by = models.CharField(max_length=100, blank=True)
    verified_by = models.CharField(max_length=100, blank=True)  # Allow it to be blank
   
    def __str__(self):
        return f"{self.Cnc_uid} - {self.component} - {self.target}"
    
    def save(self, *args, **kwargs):
            if not self.Cnc_uid:  # Only generate if not already set
                file_path = 'path_to_count_cnc.json'  # Specify the correct path
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
                self.Cnc_uid = generate_mt_block_number(customer_name, current_count)
                
                write_counts(file_path, counts)
            
            super().save(*args, **kwargs)

def generate_mt_block_number(customer_name, count):
    current_date = datetime.now()
    prefix = 'CC'  # Prefix for MT Block ID
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



class Cnc_line_master(models.Model):
    line = models.CharField(max_length=50)
    cell = models.CharField(max_length=255)
    machine_no = models.CharField(unique=True,max_length=255)
    machine_cycle_time = models.IntegerField()
    runningstatus = models.CharField(max_length=255)
    remark = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
   
    def __str__(self):
        return self.line

class LineHistory(models.Model):
    complaint = models.ForeignKey(Cnc_line_master, on_delete=models.CASCADE, related_name="history")
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    field_changed = models.CharField(max_length=255)
    old_value = models.TextField()
    new_value = models.TextField()