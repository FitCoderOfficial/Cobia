from django.db import models
from django.contrib.auth.models import AbstractUser
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    telegram_chat_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'auth_user'

class Wallet(models.Model):
    address = models.CharField(max_length=42, unique=True)
    alias = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.alias or self.address}"

class Report(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='reports')
    summary = models.TextField()
    risk_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    profit_estimate = models.DecimalField(max_digits=20, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report for {self.wallet} - {self.created_at}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('transfer', 'Transfer'),
        ('swap', 'Swap'),
        ('deposit', 'Deposit'),
        ('withdraw', 'Withdraw'),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    hash = models.CharField(max_length=66, unique=True)
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=30, decimal_places=18)
    token = models.CharField(max_length=20)
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.type} {self.amount} {self.token}"

class Alert(models.Model):
    ALERT_TYPES = [
        ('price', 'Price Alert'),
        ('volume', 'Volume Alert'),
        ('risk', 'Risk Alert'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='alerts')
    type = models.CharField(max_length=20, choices=ALERT_TYPES)
    threshold = models.DecimalField(max_digits=20, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} alert for {self.wallet}" 