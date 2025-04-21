from django.db import models
from django.contrib.auth.models import AbstractUser
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    SUBSCRIPTION_TIERS = [
        ('FREE', 'Free'),
        ('PRO', 'Pro'),
        ('WHALE', 'Whale'),
    ]
    
    telegram_chat_id = models.CharField(max_length=100, blank=True, null=True)
    subscription_tier = models.CharField(
        max_length=10,
        choices=SUBSCRIPTION_TIERS,
        default='FREE'
    )

    class Meta:
        db_table = 'auth_user'

def activate_subscription(user, tier):
    """
    Activate or update a user's subscription.
    
    Args:
        user: User object
        tier: string, either 'pro' or 'whale'
    
    Returns:
        Subscription object
    
    Raises:
        ValueError: If tier is not 'pro' or 'whale'
    """
    tier = tier.upper()
    if tier not in ['PRO', 'WHALE']:
        raise ValueError("Tier must be either 'pro' or 'whale'")
    
    # Update user's subscription tier
    user.subscription_tier = tier
    user.save()
    
    # Calculate subscription dates
    start_date = timezone.now()
    end_date = start_date + timedelta(days=30)
    
    # Create or update subscription
    subscription, created = Subscription.objects.update_or_create(
        user=user,
        defaults={
            'tier': tier,
            'start_date': start_date,
            'end_date': end_date,
            'is_active': True
        }
    )
    
    return subscription

class Wallet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallets')
    address = models.CharField(max_length=42, unique=True)
    alias = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'address']  # Prevent duplicate addresses per user

    def __str__(self):
        return f"{self.alias or self.address} ({self.user.email})"

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

class TossPayment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('CANCELED', 'Canceled'),
        ('FAILED', 'Failed'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('CARD', 'Card'),
        ('TRANSFER', 'Bank Transfer'),
        ('VIRTUAL_ACCOUNT', 'Virtual Account'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='toss_payments')
    order_id = models.CharField(max_length=64, unique=True)
    payment_key = models.CharField(max_length=200, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    approved_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.order_id} - {self.amount} ({self.status})"

class Subscription(models.Model):
    TIER_CHOICES = [
        ('FREE', 'Free'),
        ('PRO', 'Pro'),
        ('WHALE', 'Whale'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default='FREE')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.tier} ({self.is_active})"

    @property
    def is_expired(self):
        if self.end_date is None:
            return False
        return self.end_date < timezone.now()

    def save(self, *args, **kwargs):
        if self.is_expired:
            self.is_active = False
        super().save(*args, **kwargs)

class PendingPayment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_id = models.CharField(max_length=64, unique=True)
    amount = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"Pending Payment {self.order_id} for {self.user.username}"

    @classmethod
    def create_pending_payment(cls, user, order_id, amount):
        """
        Create a pending payment record with 30-minute expiration.
        """
        expires_at = timezone.now() + timezone.timedelta(minutes=30)
        return cls.objects.create(
            user=user,
            order_id=order_id,
            amount=amount,
            expires_at=expires_at
        )

class BTCTransaction(models.Model):
    TRANSACTION_STATUS = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('FAILED', 'Failed'),
    ]

    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='btc_transactions')
    tx_hash = models.CharField(max_length=64, unique=True)
    amount = models.DecimalField(max_digits=18, decimal_places=8)  # BTC amount with 8 decimal places
    status = models.CharField(max_length=20, choices=TRANSACTION_STATUS, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"BTC Transaction {self.tx_hash[:8]}... ({self.amount} BTC)"
