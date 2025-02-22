from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    mobile_no = models.CharField(max_length=15, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    department = models.CharField(max_length=100, choices=[
        ('HR', 'Human Resources'),
        ('Admin', 'Admin'),
        ('qa', 'qa'),
        ('Forging','Forging'),
        ('pre_mc','pre_mc'),
        ('ht','ht'),
        ('Rm', 'Rm'),
        ('visual', 'visual'),
        ('fi', 'fi'),
        ('cnc', 'cnc'),
        ('marking', 'marking'),
        ('shot_blast', 'shot_blast'),
        ('dispatch','dispatch'),
        ('IT', 'Information Technology'),
        ('Finance', 'Finance'),
        ('Marketing', 'Marketing'),
        ('DepartmentPage','DepartmentPage'),
    ], default='DepartmentPage')

    def __str__(self):
        return self.username
