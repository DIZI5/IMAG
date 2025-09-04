from django import forms
from .models import Product, ProductGroup

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            "group",
            "serial_number",
            "name", "price", "stock",
            "description", "manufacturer", "model",
            "supplier_contact",
        ]
        labels = {
            "serial_number": "Серійний номер",
            "name": "Виріб",
            "price": "Ціна (євро)",
            "stock": "Кількість",
            "description": "Опис (необов’язково)",
            "manufacturer": "Виробник (необов’язково)",
            "model": "Модель (необов’язково)",
            "supplier_contact": "Контактна особа постачальника (необов’язково)",

        }
        widgets = {
            "description": forms.Textarea(attrs={"rows": 3}),
            "supplier_contact": forms.Textarea(attrs={"rows": 1}),
        }

class ProductGroupForm(forms.ModelForm):
    class Meta:
        model = ProductGroup
        fields = ["serial_number", "name", "price"]
