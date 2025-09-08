from django import forms
from .models import MainGroup, Subsystem, Product

class MainGroupForm(forms.ModelForm):
    class Meta:
        model = MainGroup
        fields = ["serial_number", "name"]

class SubsystemForm(forms.ModelForm):
    class Meta:
        model = Subsystem
        fields = ["main_group", "serial_number", "system", "subsystem"]
        labels = {
            "main_group": "Головна група",
            "serial_number": "Серійний номер",
            "system": "Система (необов’язково)",
            "subsystem": "Підсистема (необов’язково)",
        }

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            "subsystem",
            "serial_number",
            "name",
            "price",
            "stock",
            "description",
            "manufacturer",
            "model",
            "supplier_contact",
        ]
