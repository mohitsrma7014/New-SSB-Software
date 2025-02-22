from django.db import models
from django.db.models import F, ExpressionWrapper, DecimalField
from datetime import timedelta

class Forging(models.Model):
    batch_number = models.CharField(max_length=50)
    date = models.DateField()
    shift = models.CharField(max_length=100)
    component = models.CharField(max_length=100)
    customer = models.CharField(max_length=100)
    slug_weight = models.DecimalField(max_digits=10, decimal_places=2)
    rm_grade = models.CharField(max_length=100)
    heat_number = models.CharField(max_length=100)
    line = models.CharField(max_length=100)
    line_incharge = models.CharField(max_length=100)
    forman = models.CharField(max_length=100)
    target = models.IntegerField()
    production = models.IntegerField()
    rework = models.IntegerField()
    up_setting = models.IntegerField()
    half_piercing = models.IntegerField()
    full_piercing = models.IntegerField()
    ring_rolling = models.IntegerField()
    sizing = models.IntegerField()
    overheat = models.IntegerField()
    bar_crack_pcs = models.IntegerField()
    verified_by = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.component

    @property
    def rejection(self):
        total_rejection = (self.up_setting + self.half_piercing + self.full_piercing +
                           self.ring_rolling + self.sizing + self.overheat + self.bar_crack_pcs)
        return total_rejection

    @property
    def rejection_percentage(self):
        total = self.production + self.rejection
        if total == 0:
            return 0
        return (self.rejection / total) * 100

    @property
    def production_weight_kg(self):
        return self.production * self.slug_weight

    @property
    def production_weight_ton(self):
        return self.production_weight_kg / 1000
