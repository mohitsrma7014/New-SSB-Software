from django.db import models
from django.conf import settings

class Complaint(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('closed', 'Closed'),
    ]
    
    customer_name = models.CharField(max_length=255)
    complaint_date = models.DateField()
    target_submission_date = models.DateField()
    part_number = models.CharField(max_length=255)
    phenomena = models.TextField()
    complaint_description = models.TextField()
    is_repeated = models.BooleanField(default=False)
    invoice_batch_no = models.CharField(max_length=255)
    lot_size = models.IntegerField()
    rejection_qty = models.IntegerField()
    interim_action = models.TextField()
    root_cause = models.TextField()
    corrective_action = models.TextField()
    documents_revised = models.TextField(blank=True, null=True)
    action_complaint_date = models.DateField(blank=True, null=True)
    capa_submission_date = models.DateField(blank=True, null=True)
    effectiveness_review = models.TextField(blank=True, null=True)
    completion_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    complaintfile = models.FileField(upload_to="complaint_documents/complaintfile/",blank=True)
    avidancefile = models.FileField(upload_to="complaint_documents/avidancefile/",blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ComplaintHistory(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name="history")
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    field_changed = models.CharField(max_length=255)
    old_value = models.TextField(blank=True, null=True)  # Allow null for file fields
    new_value = models.TextField(blank=True, null=True)  # Allow null for file fields
