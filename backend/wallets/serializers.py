from rest_framework import serializers
from .models import Wallet, Report

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'address', 'alias', 'created_at']
        read_only_fields = ['id', 'created_at']

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'wallet', 'summary', 'risk_score', 'profit_estimate', 'created_at']
        read_only_fields = ['id', 'created_at', 'wallet'] 