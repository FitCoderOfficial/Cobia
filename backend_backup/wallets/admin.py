from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Wallet, Report, Transaction, Alert

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'telegram_chat_id', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Telegram', {'fields': ('telegram_chat_id',)}),
    )

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('address', 'alias', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('address', 'alias')
    ordering = ('-created_at',)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'risk_score', 'profit_estimate', 'created_at')
    list_filter = ('risk_score', 'created_at')
    search_fields = ('wallet__address', 'summary')
    ordering = ('-created_at',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'type', 'amount', 'token', 'timestamp')
    list_filter = ('type', 'token', 'timestamp')
    search_fields = ('wallet__address', 'hash')
    ordering = ('-timestamp',)

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'wallet', 'type', 'threshold', 'is_active')
    list_filter = ('type', 'is_active')
    search_fields = ('user__username', 'wallet__address')
    ordering = ('-created_at',) 