from django.db import models

class MainGroup(models.Model):
    serial_number = models.CharField("Серійний номер групи", max_length=50, unique=True)
    name = models.CharField("Назва групи", max_length=100)

    def __str__(self):
        return f"{self.serial_number} - {self.name}"

    def subsystems_total(self):
        return sum(subsystem.total_price() for subsystem in self.subsystems.all())

class Subsystem(models.Model):
    main_group = models.ForeignKey(MainGroup, on_delete=models.CASCADE, related_name="subsystems")
    serial_number = models.CharField("Серійний номер підсистеми", max_length=50)
    system = models.CharField("Система", max_length=100, blank=True)
    subsystem = models.CharField("Підсистема", max_length=100, blank=True)

    def __str__(self):
        return f"{self.serial_number} - {self.system} - {self.subsystem}"

    def total_price(self):
        return sum(product.price * (product.stock or 1) for product in self.products.all())

class Product(models.Model):
    subsystem = models.ForeignKey(Subsystem, on_delete=models.CASCADE, related_name="products")
    serial_number = models.CharField("Серійний номер", max_length=50)
    name = models.CharField("Виріб", max_length=100)
    price = models.DecimalField("Ціна (євро)", max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField("Кількість", default=1)
    description = models.TextField("Опис", blank=True, null=True)
    manufacturer = models.CharField("Виробник", max_length=100, blank=True, null=True)
    model = models.CharField("Модель", max_length=100, blank=True, null=True)
    supplier_contact = models.TextField("Контактна особа постачальника", blank=True, null=True)

    def __str__(self):
        return f"{self.serial_number} - {self.name}"