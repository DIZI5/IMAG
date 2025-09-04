from django.db import models

class ProductGroup(models.Model):
    serial_number = models.CharField("Серійний номер групи", max_length=50, unique=True)
    name = models.CharField("Назва групи", max_length=100)
    price = models.DecimalField("Ціна (євро)", max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.serial_number} - {self.name}"

class Product(models.Model):
    group = models.ForeignKey(ProductGroup, on_delete=models.CASCADE, related_name="products")
    serial_number = models.CharField("Серійний номер", max_length=50)
    name  = models.CharField("Виріб", max_length=100)
    price = models.DecimalField("Ціна (євро)", max_digits=10, decimal_places=2)
    stock = models.IntegerField("Кількість")

    description = models.TextField("Опис", blank=True, default="")  # для текстових краще не ставити null=True
    manufacturer = models.CharField("Виробник", max_length=120, blank=True, default="")
    model = models.CharField("Модель", max_length=120, blank=True, default="")

    supplier_contact = models.CharField("Контактна особа постачальника", max_length=120, blank=True)

    def __str__(self):
        return f"{self.serial_number} - {self.name}"