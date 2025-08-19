from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import Product
from .forms import ProductForm

def index(request):
    return render(request, 'index.html')

def production(request):
    products = Product.objects.all()
    return render(request, "production.html", {"products": products})

def add_product(request):
    if request.method == "POST":
        form = ProductForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("production")
    else:
        form = ProductForm()
    return render(request, "product_form.html", {"form": form, "mode": "add"})

def product_edit(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == "POST":
        form = ProductForm(request.POST, instance=product)
        if form.is_valid():
            form.save()
            return redirect("production")
    else:
        form = ProductForm(instance=product)
    return render(request, "product_form.html", {"form": form, "mode": "edit", "product": product})

def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == "POST":
        name = product.name
        product.delete()
        messages.success(request, f'«{name}» успішно видалено.')
        return redirect("production")  # або твоя назва списку
    # якщо GET — окрема сторінка підтвердження (за бажанням)
    return render(request, "product_confirm_delete.html", {"product": product})



def print_3d(request):
    return render(request, 'print_3d.html')