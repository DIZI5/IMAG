from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django import forms

from .models import MainGroup, Subsystem, Product
from .forms import MainGroupForm, SubsystemForm, ProductForm
from .utils import serial_sort_key_group, serial_sort_key_product

def index(request):
    return render(request, 'index.html')

def production(request):
    groups = sorted(MainGroup.objects.all(), key=lambda g: serial_sort_key_group(g.serial_number))
    total_sum = sum(group.subsystems_total() for group in groups)
    return render(request, "production.html", {"groups": groups, "total_sum": total_sum})

def add_product(request):
    subsystem_id = request.GET.get("subsystem")
    initial = {}
    if subsystem_id:
        initial["subsystem"] = subsystem_id
    if request.method == "POST":
        form = ProductForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Підпункт успішно додано!")
            return redirect("production")
        else:
            messages.error(request, "Виникла помилка. Перевірте дані.")
    else:
        form = ProductForm(initial=initial)
        if subsystem_id:
            form.fields["subsystem"].widget = forms.HiddenInput()
    return render(request, "product_form.html", {"form": form, "mode": "add"})

def edit_product(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == "POST":
        form = ProductForm(request.POST, instance=product)
        if form.is_valid():
            form.save()
            messages.info(request, "Зміни збережено")
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
        return redirect("production")
    return render(request, "product_confirm_delete.html", {"product": product})


def add_group(request):
    if request.method == "POST":
        form = MainGroupForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Групу успішно додано!")
            return redirect("production")
        else:
            messages.error(request, "Виникла помилка. Перевірте дані.")
    else:
        form = MainGroupForm()
    return render(request, "group_form.html", {"form": form, "mode": "add"})

def edit_group(request, pk):
    group = get_object_or_404(MainGroup, pk=pk)
    if request.method == "POST":
        form = MainGroupForm(request.POST, instance=group)
        if form.is_valid():
            form.save()
            messages.info(request, "Зміни збережено")
            return redirect("production")
        else:
            messages.error(request, "Виникла помилка. Перевірте дані.")
    else:
        form = MainGroupForm(instance=group)
    return render(request, "group_form.html", {"form": form, "mode": "edit", "group": group})

def add_subsystem(request):
    if request.method == "POST":
        form = SubsystemForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Підсистему успішно додано!")
            return redirect("production")
        else:
            messages.error(request, "Виникла помилка. Перевірте дані.")
    else:
        form = SubsystemForm()
    return render(request, "subsystem_form.html", {"form": form, "mode": "add"})

def edit_subsystem(request, pk):
    subsystem = get_object_or_404(Subsystem, pk=pk)
    if request.method == "POST":
        form = SubsystemForm(request.POST, instance=subsystem)
        if form.is_valid():
            form.save()
            messages.success(request, "Підсистему оновлено!")
            return redirect("production")
        else:
            messages.error(request, "Виникла помилка. Перевірте дані.")
    else:
        form = SubsystemForm(instance=subsystem)
    return render(request, "subsystem_form.html", {"form": form, "mode": "edit", "subsystem": subsystem})

def print_3d(request):
    return render(request, 'print.html')