from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django import forms

from .models import Product, ProductGroup
from .forms import ProductForm, ProductGroupForm
from .utils import serial_sort_key

def index(request):
    return render(request, 'index.html')

def production(request):
    groups = ProductGroup.objects.all().order_by('serial_number')
    group_list = []
    for group in groups:
        products_sorted = sorted(group.products.all(), key=lambda p: serial_sort_key(p.serial_number))
        group_list.append({
            "group": group,
            "products": products_sorted
        })
    return render(request, "production.html", {"groups": group_list})

def add_product(request):
    group_id = request.GET.get("group")
    initial = {}
    if group_id:
        initial["group"] = group_id
    if request.method == "POST":
        form = ProductForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Товар успішно додано!")
            return redirect("production")
        else:
            messages.error(request, "Виникла помилка. Перевірте дані.")
    else:
        form = ProductForm(initial=initial)
        if group_id:
            form.fields["group"].widget = forms.HiddenInput()
    return render(request, "product_form.html", {"form": form, "mode": "add"})

def product_edit(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == "POST":
        form = ProductForm(request.POST, instance=product)
        if form.is_valid():
            form.save()
            messages.info(request, "Зміни збережено")  # Додаємо повідомлення
            return redirect("production")
        else:
            messages.error(request, "Виникла помилка. Перевірте дані.")
    else:
        form = ProductForm(instance=product)
    return render(request, "product_form.html", {"form": form, "mode": "edit", "product": product})

def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == "POST":
        name = product.name
        product.delete()
        messages.success(request, f'«{name}» успішно видалено')
        return redirect("production")  # або твоя назва списку
    # якщо GET — окрема сторінка підтвердження (за бажанням)
    return render(request, "product_confirm_delete.html", {"product": product})

def print_3d(request):
    return render(request, 'print.html')

def add_group(request):
    if request.method == "POST":
        form = ProductGroupForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Групу успішно додано!")
            return redirect("production")
        else:
            messages.error(request, "Виникла помилка. Перевірте дані.")
    else:
        form = ProductGroupForm()
    return render(request, "group_form.html", {"form": form, "mode": "add"})

def edit_group(request, pk):
    group = get_object_or_404(ProductGroup, pk=pk)
    if request.method == "POST":
        form = ProductGroupForm(request.POST, instance=group)
        if form.is_valid():
            form.save()
            messages.info(request, "Зміни збережено")
            return redirect("production")
        else:
            messages.error(request, "Виникла помилка. Перевірте дані.")
    else:
        form = ProductGroupForm(instance=group)
    return render(request, "group_form.html", {"form": form, "mode": "edit", "group": group})