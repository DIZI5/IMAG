from django import forms
from .models import Product

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            "name", "price", "stock",
            "description", "manufacturer", "model",
            "supplier_contact_person",
        ]
        labels = {
            "name": "Виріб",
            "price": "Ціна (євро)",
            "stock": "Кількість",
            "description": "Опис (необов’язково)",
            "manufacturer": "Виробник (необов’язково)",
            "model": "Модель (необов’язково)",
            "supplier_contact_person": "Контактна особа постачальника (необов’язково)",

        }
        widgets = {
            "description": forms.Textarea(attrs={"rows": 3}),
        }
