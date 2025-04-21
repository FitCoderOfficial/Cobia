from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WalletViewSet,
    ReportViewSet,
    TossPaymentConfirmView,
    SubscriptionStatusView,
    TossPaymentInitiateView,
    AdminPaymentHistoryView
)

# DRF router for ViewSets
router = DefaultRouter()
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'reports', ReportViewSet, basename='report')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Payment endpoints
    path('payments/initiate/', TossPaymentInitiateView.as_view(), name='payment-initiate'),
    path('payments/confirm/', TossPaymentConfirmView.as_view(), name='payment-confirm'),
    path('admin/payments/', AdminPaymentHistoryView.as_view(), name='admin-payment-history'),
    
    # Subscription status endpoint
    path('subscriptions/status/', SubscriptionStatusView.as_view(), name='subscription-status'),
] 