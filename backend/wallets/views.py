from django.shortcuts import render
import json
import requests
import uuid
from django.conf import settings
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from .models import TossPayment, activate_subscription, PendingPayment, Subscription, Wallet, Report
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Create your views here.

class WalletViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Wallet.objects.all()
    
    def get_queryset(self):
        return self.queryset.all()
    
    @swagger_auto_schema(
        operation_description="List all wallets or create a new wallet",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'address': openapi.Schema(type=openapi.TYPE_STRING, description='Wallet address'),
                'alias': openapi.Schema(type=openapi.TYPE_STRING, description='Wallet alias'),
            },
            required=['address']
        ),
        responses={
            200: "Success",
            400: "Bad Request",
            401: "Unauthorized"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class ReportViewSet(mixins.CreateModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.ListModelMixin,
                   viewsets.GenericViewSet):
    """
    A viewset that provides default `create()`, `retrieve()`, and `list()` actions.
    Update and delete operations are not allowed.
    """
    permission_classes = [IsAuthenticated]
    queryset = Report.objects.all()
    
    def get_queryset(self):
        return self.queryset.filter(wallet__in=Wallet.objects.all())
    
    @swagger_auto_schema(
        operation_description="List all reports or create a new report",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'wallet': openapi.Schema(type=openapi.TYPE_INTEGER, description='Wallet ID'),
                'summary': openapi.Schema(type=openapi.TYPE_STRING, description='Report summary'),
                'risk_score': openapi.Schema(type=openapi.TYPE_INTEGER, description='Risk score (0-100)'),
                'profit_estimate': openapi.Schema(type=openapi.TYPE_NUMBER, description='Estimated profit'),
            },
            required=['wallet', 'summary', 'risk_score', 'profit_estimate']
        ),
        responses={
            200: "Success",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden - Update/Delete not allowed"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Updates are not allowed for reports."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    def partial_update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Updates are not allowed for reports."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Deletion is not allowed for reports."},
            status=status.HTTP_403_FORBIDDEN
        )

class TossPaymentConfirmView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Confirm a Toss payment and activate subscription",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['paymentKey', 'orderId', 'amount'],
            properties={
                'paymentKey': openapi.Schema(type=openapi.TYPE_STRING, description='Payment key from Toss'),
                'orderId': openapi.Schema(type=openapi.TYPE_STRING, description='Order ID'),
                'amount': openapi.Schema(type=openapi.TYPE_INTEGER, description='Payment amount'),
            }
        ),
        responses={
            200: openapi.Response(
                description="Payment confirmed successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "payment": {
                            "order_id": "ORDER_123",
                            "amount": 100000,
                            "status": "APPROVED"
                        },
                        "subscription": {
                            "tier": "WHALE",
                            "end_date": "2024-04-20T00:00:00Z"
                        }
                    }
                }
            ),
            400: "Invalid request parameters or payment validation failed",
            500: "Internal server error"
        }
    )
    def post(self, request):
        try:
            payment_key = request.data.get('paymentKey')
            order_id = request.data.get('orderId')
            amount = request.data.get('amount')

            if not all([payment_key, order_id, amount]):
                return Response({
                    'success': False,
                    'message': 'Missing required parameters'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate against PendingPayment
            try:
                pending_payment = PendingPayment.objects.get(
                    order_id=order_id,
                    user=request.user
                )
                
                # Check if payment has expired
                if pending_payment.expires_at < timezone.now():
                    pending_payment.delete()
                    return Response({
                        'success': False,
                        'message': 'Payment session has expired'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Validate amount
                if int(amount) != pending_payment.amount:
                    return Response({
                        'success': False,
                        'message': 'Payment amount does not match'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
            except PendingPayment.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Invalid order ID'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Call Toss Payments API to confirm payment
            toss_api_url = f'https://api.tosspayments.com/v1/payments/{payment_key}'
            headers = {
                'Authorization': f'Basic {settings.TOSS_SECRET_KEY}',
                'Content-Type': 'application/json'
            }
            payload = {
                'orderId': order_id,
                'amount': amount
            }

            response = requests.post(toss_api_url, json=payload, headers=headers)
            payment_data = response.json()

            if response.status_code != 200:
                return Response({
                    'success': False,
                    'message': payment_data.get('message', 'Payment confirmation failed')
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create TossPayment object
            payment = TossPayment.objects.create(
                user=request.user,
                order_id=order_id,
                payment_key=payment_key,
                amount=amount,
                method=payment_data.get('method', ''),
                status='APPROVED',
                approved_at=payment_data.get('approvedAt')
            )

            # Clean up the pending payment
            pending_payment.delete()

            # Determine subscription tier based on amount
            if int(amount) >= 100000:  # 100,000원 이상
                tier = 'whale'
            else:
                tier = 'pro'

            # Activate subscription
            subscription = activate_subscription(request.user, tier)

            return Response({
                'success': True,
                'payment': {
                    'order_id': payment.order_id,
                    'amount': payment.amount,
                    'status': payment.status
                },
                'subscription': {
                    'tier': subscription.tier,
                    'end_date': subscription.end_date
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Get current user's subscription status",
        responses={
            200: openapi.Response(
                description="Subscription status retrieved successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "subscription": {
                            "tier": "PRO",
                            "is_active": True,
                            "end_date": "2024-04-20T00:00:00Z"
                        }
                    }
                }
            ),
            401: "Unauthorized",
            500: "Internal server error"
        }
    )
    def get(self, request):
        try:
            # Get user's subscription
            subscription = Subscription.objects.filter(user=request.user).first()
            
            if not subscription:
                return Response({
                    'success': True,
                    'subscription': {
                        'tier': 'FREE',
                        'is_active': False,
                        'end_date': None
                    }
                })
            
            return Response({
                'success': True,
                'subscription': {
                    'tier': subscription.tier,
                    'is_active': subscription.is_active,
                    'end_date': subscription.end_date.isoformat() if subscription.end_date else None
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TossPaymentInitiateView(APIView):
    permission_classes = [IsAuthenticated]
    
    TIER_AMOUNTS = {
        'pro': 9900,    # ₩9,900
        'whale': 100000  # ₩100,000
    }
    
    @swagger_auto_schema(
        operation_description="Initiate a payment for subscription",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['tier'],
            properties={
                'tier': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Subscription tier (pro or whale)',
                    enum=['pro', 'whale']
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description="Payment initiation successful",
                examples={
                    "application/json": {
                        "success": True,
                        "order_id": "COBIA-1234-5678",
                        "amount": 9900,
                        "tier": "pro"
                    }
                }
            ),
            400: "Invalid tier or other validation error",
            401: "Unauthorized",
            500: "Internal server error"
        }
    )
    def post(self, request):
        try:
            tier = request.data.get('tier', '').lower()
            
            # Validate tier
            if tier not in self.TIER_AMOUNTS:
                return Response({
                    'success': False,
                    'message': 'Invalid tier. Must be either "pro" or "whale".'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate amount based on tier
            amount = self.TIER_AMOUNTS[tier]
            
            # Generate unique order ID
            order_id = f"COBIA-{uuid.uuid4().hex[:8].upper()}"
            
            # Create pending payment record
            PendingPayment.create_pending_payment(
                user=request.user,
                order_id=order_id,
                amount=amount
            )
            
            return Response({
                'success': True,
                'order_id': order_id,
                'amount': amount,
                'tier': tier
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminPaymentHistoryView(APIView):
    permission_classes = [IsAdminUser]
    swagger_schema = None  # Exclude from Swagger documentation
    
    def get(self, request):
        try:
            # Get email filter from query params
            email_filter = request.query_params.get('email')
            
            # Start with all payments ordered by approved_at
            payments = TossPayment.objects.select_related('user').order_by('-approved_at')
            
            # Apply email filter if provided
            if email_filter:
                payments = payments.filter(user__email__icontains=email_filter)
            
            # Format the payment records
            payment_history = [{
                'email': payment.user.email,
                'order_id': payment.order_id,
                'amount': payment.amount,
                'method': payment.get_method_display(),  # Get human-readable method name
                'status': payment.get_status_display(),  # Get human-readable status
                'approved_at': payment.approved_at.isoformat() if payment.approved_at else None
            } for payment in payments]
            
            return Response({
                'success': True,
                'count': len(payment_history),
                'payments': payment_history
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
