from django.urls import path
from imagApp import views

urlpatterns = [
    path("", views.index),
    path("production/", views.production, name="production"),
    path("product/add/", views.add_product, name="add_product"),
    path("product/<int:pk>/edit/", views.edit_product, name="edit_product"),
    path("product/<int:pk>/delete/", views.product_delete, name="product_delete"),
    path("print/", views.print_3d, name="print_3d"),
    path("group/add/", views.add_group, name="add_group"),
    path("group/<int:pk>/edit/", views.edit_group, name="edit_group"),
    path("subsystem/add/", views.add_subsystem, name="add_subsystem"),
    path("subsystem/<int:pk>/edit/", views.edit_subsystem, name="edit_subsystem"),
]