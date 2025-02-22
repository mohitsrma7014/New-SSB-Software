from django.db import models

class Shotblast(models.Model):
    batch_number = models.CharField(max_length=50)
    date = models.DateField()
    shift = models.CharField(max_length=100)
    component = models.CharField(max_length=100)
    machine = models.CharField(max_length=100)
    weight = models.DecimalField(max_digits=10, decimal_places=3)
    no_of_pic = models.IntegerField()
    operator = models.CharField(max_length=100)
    verified_by = models.CharField(max_length=100)
    target = models.IntegerField()
    total_produced = models.IntegerField()
    remaining = models.IntegerField(default=0)
    heat_no = models.CharField(max_length=50)

    def __str__(self):
        return self.component