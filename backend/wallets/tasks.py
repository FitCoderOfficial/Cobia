from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Wallet, Report
from telegram import Bot
from django.conf import settings

User = get_user_model()

@shared_task
def send_alert(user_id, wallet_id):
    try:
        # Get user and wallet
        user = User.objects.get(id=user_id)
        wallet = Wallet.objects.get(id=wallet_id)
        
        # Get the latest report for the wallet
        latest_report = Report.objects.filter(wallet=wallet).order_by('-created_at').first()
        
        if not latest_report:
            return f"No report found for wallet {wallet_id}"
            
        # Generate summary message
        message = (
            f"🔔 Wallet Alert for {wallet.name}\n\n"
            f"Summary: {latest_report.summary}\n"
            f"Risk Score: {latest_report.risk_score}/100\n"
            f"Profit Estimate: ${latest_report.profit_estimate}\n"
            f"Generated at: {latest_report.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
        )
        
        # Send to Telegram
        bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
        bot.send_message(
            chat_id=user.telegram_chat_id,
            text=message
        )
        
        return f"Alert sent successfully to user {user_id} for wallet {wallet_id}"
        
    except User.DoesNotExist:
        return f"User {user_id} not found"
    except Wallet.DoesNotExist:
        return f"Wallet {wallet_id} not found"
    except Exception as e:
        return f"Error sending alert: {str(e)}" 