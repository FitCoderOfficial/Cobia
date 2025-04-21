from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WalletViewSet,
    ReportViewSet,
    TossPaymentConfirmView,
    SubscriptionStatusView,
    TossPaymentInitiateView,
    AdminPaymentHistoryView,
    BTCPaymentConfirmView,
    BTCSubscriptionStatusView,
    AdminSubscriptionListView,
    RegisterView
)

# DRF router for ViewSets
router = DefaultRouter()
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'reports', ReportViewSet, basename='report')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    
    # Payment endpoints
    path('payments/initiate/', TossPaymentInitiateView.as_view(), name='payment-initiate'),
    path('payments/confirm/', TossPaymentConfirmView.as_view(), name='payment-confirm'),
    path('payments/btc/confirm/', BTCPaymentConfirmView.as_view(), name='btc-payment-confirm'),
    path('payments/btc/status/', BTCSubscriptionStatusView.as_view(), name='btc-subscription-status'),
    
    # Admin endpoints
    path('admin/payments/', AdminPaymentHistoryView.as_view(), name='admin-payment-history'),
    path('admin/subscriptions/', AdminSubscriptionListView.as_view(), name='admin-subscription-list'),
    
    # Subscription status endpoint
    path('subscriptions/status/', SubscriptionStatusView.as_view(), name='subscription-status'),
] 