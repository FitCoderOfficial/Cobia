from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Report
from .serializers import ReportSerializer

class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for viewing reports.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['wallet']
    ordering_fields = ['created_at', 'risk_score', 'profit_estimate']
    ordering = ['-created_at']  # Default ordering 