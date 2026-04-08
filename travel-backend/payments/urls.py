from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreatePaymentView.as_view(), name='payment-create'),
    path('webhook/', views.WebhookIPNView.as_view(), name='payment-webhook'),
    path('retry/', views.RetryPaymentView.as_view(), name='payment-retry'),
]
