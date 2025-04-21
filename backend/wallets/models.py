from django.db import models
from django.contrib.auth.models import AbstractUser
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    telegram_chat_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'auth_user'

class Wallet(models.Model):
    # ... existing Wallet model code ...

class Report(models.Model):
    wallet = models.ForeignKey('Wallet', on_delete=models.CASCADE, related_name='reports')
    summary = models.TextField()
    risk_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    profit_estimate = models.DecimalField(max_digits=20, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report for {self.wallet} - {self.created_at}" 