from django.db import models

class Product(models.Model):
    name  = models.CharField("Виріб", max_length=100)
    price = models.DecimalField("Ціна (євро)", max_digits=10, decimal_places=2)
    stock = models.IntegerField("Кількість")

    description = models.TextField("Опис", blank=True)  # для текстових краще не ставити null=True
    manufacturer = models.CharField("Виробник", max_length=120, blank=True)
    model = models.CharField("Модель", max_length=120, blank=True)

    supplier_contact_person = models.CharField("Контактна особа постачальника", max_length=120, blank=True)

    def __str__(self):
        return self.name