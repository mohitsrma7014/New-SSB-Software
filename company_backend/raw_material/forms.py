from django import forms

class ComponentQueryForm(forms.Form):
    component = forms.CharField(label='Component', max_length=100, required=True)
    days = forms.IntegerField(label='Number of Days', min_value=1, required=True)