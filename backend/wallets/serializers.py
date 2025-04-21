from rest_framework import serializers
from .models import Report, Wallet

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'summary', 'risk_score', 'profit_estimate', 'created_at']
        read_only_fields = ['id', 'created_at']

class WalletSerializer(serializers.ModelSerializer):
    reports = ReportSerializer(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = ['id', 'name', 'address', 'reports']  # Add other Wallet fields as needed
        read_only_fields = ['id'] 