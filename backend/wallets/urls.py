from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalletViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
] 