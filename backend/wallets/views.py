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
from .models import (
    TossPayment, 
    activate_subscription, 
    PendingPayment, 
    Subscription, 
    Wallet, 
    Report,
    BTCTransaction,
    User
)
from .serializers import WalletSerializer, ReportSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from decimal import Decimal
from rest_framework.pagination import LimitOffsetPagination

# Create your views here.

class CustomPagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 100

class WalletViewSet(mixins.CreateModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.ListModelMixin,
                  mixins.DestroyModelMixin,
                  viewsets.GenericViewSet):
    """
    A viewset for viewing and editing user wallets.
    Users can only access their own wallets.
    Only GET, POST, and DELETE methods are allowed.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = WalletSerializer
    queryset = Wallet.objects.all()
    http_method_names = ['get', 'post', 'delete']
    pagination_class = CustomPagination
    
    def get_queryset(self):
        """
        Filter queryset to return only the authenticated user's wallets.
        """
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """
        Set the user when creating a new wallet.
        """
        serializer.save(user=self.request.user)
    
    @swagger_auto_schema(
        tags=['wallets'],
        operation_description="List user's wallets or create a new wallet",
        responses={
            200: WalletSerializer,
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden - Cannot modify other users' wallets",
            405: "Method not allowed"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        tags=['wallets'],
        operation_description="Delete a wallet",
        responses={
            204: "Wallet deleted successfully",
            401: "Unauthorized",
            403: "Forbidden - Cannot delete other users' wallets",
            404: "Wallet not found"
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

class ReportViewSet(mixins.CreateModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.ListModelMixin,
                   viewsets.GenericViewSet):
    """
    A viewset that provides default `create()`, `retrieve()`, and `list()` actions.
    Update and delete operations are not allowed.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ReportSerializer
    queryset = Report.objects.all()
    http_method_names = ['get', 'post']
    pagination_class = CustomPagination
    
    def get_queryset(self):
        return self.queryset.filter(wallet__in=Wallet.objects.filter(user=self.request.user))
    
    def perform_create(self, serializer):
        """
        Validate that the wallet belongs to the user and save the report.
        """
        wallet_id = self.request.data.get('wallet')
        try:
            wallet = Wallet.objects.get(id=wallet_id, user=self.request.user)
            serializer.save(wallet=wallet)
        except Wallet.DoesNotExist:
            raise serializers.ValidationError({"wallet": "Wallet not found or does not belong to user"})
    
    @swagger_auto_schema(
        tags=['reports'],
        operation_description="List user's reports or create a new report",
        responses={
            200: ReportSerializer,
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden - Cannot access reports for other users' wallets",
            405: "Method not allowed"
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
        tags=['payments'],
        operation_description="Confirm a Toss payment and activate subscription",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['paymentKey', 'orderId', 'amount'],
            properties={
                'paymentKey': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Payment key received from Toss Payments',
                    example='5zJ4xY7m0kODPaRp6GrXYR3gqoNbl4v5'
                ),
                'orderId': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Unique order ID generated during payment initiation',
                    example='COBIA-ABC123'
                ),
                'amount': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='Payment amount in KRW',
                    example=99000
                ),
            }
        ),
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                    'message': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example='Payment confirmed successfully'
                    ),
                    'data': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'payment_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                            'amount': openapi.Schema(type=openapi.TYPE_INTEGER, example=99000),
                            'status': openapi.Schema(type=openapi.TYPE_STRING, example='SUCCESS')
                        }
                    )
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'code': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                example='PAYMENT_EXPIRED'
                            ),
                            'message': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                example='Payment session has expired'
                            )
                        }
                    )
                }
            ),
            401: "Unauthorized",
            409: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'code': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                example='DUPLICATE_PAYMENT'
                            ),
                            'message': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                example='Payment already processed'
                            )
                        }
                    )
                }
            ),
            500: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'code': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                example='INTERNAL_SERVER_ERROR'
                            ),
                            'message': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                example='An unexpected error occurred'
                            )
                        }
                    )
                }
            )
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

            # Check for existing payment
            if TossPayment.objects.filter(order_id=order_id).exists():
                return Response({
                    'success': False,
                    'message': 'Payment already processed'
                }, status=status.HTTP_409_CONFLICT)

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

            # Call Toss API to confirm payment
            toss_api_url = "https://api.tosspayments.com/v1/payments/confirm"
            headers = {
                "Authorization": f"Basic {settings.TOSS_SECRET_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "paymentKey": payment_key,
                "orderId": order_id,
                "amount": amount
            }

            response = requests.post(
                toss_api_url,
                headers=headers,
                json=payload
            )

            if response.status_code != 200:
                error_data = response.json()
                return Response({
                    'success': False,
                    'message': error_data.get('message', 'Payment confirmation failed'),
                    'code': error_data.get('code')
                }, status=status.HTTP_400_BAD_REQUEST)

            payment_data = response.json()

            # Validate payment status
            if payment_data.get('status') != 'DONE':
                return Response({
                    'success': False,
                    'message': f"Invalid payment status: {payment_data.get('status')}"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create TossPayment record
            payment = TossPayment.objects.create(
                user=request.user,
                order_id=order_id,
                payment_key=payment_key,
                amount=amount,
                method=payment_data.get('method', 'UNKNOWN'),
                approved_at=timezone.now(),
                status='SUCCESS'
            )

            # Determine subscription tier based on amount
            if amount == 99000:  # Pro tier
                activate_subscription(request.user, 'pro')
            elif amount == 990000:  # Whale tier
                activate_subscription(request.user, 'whale')

            # Clean up pending payment
            pending_payment.delete()

            return Response({
                'success': True,
                'message': 'Payment confirmed successfully',
                'data': {
                    'payment_id': payment.id,
                    'amount': payment.amount,
                    'status': payment.status
                }
            })

        except requests.exceptions.RequestException as e:
            return Response({
                'success': False,
                'message': 'Failed to communicate with payment server'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        tags=['subscriptions'],
        operation_description="Get current user's subscription status",
        responses={
            200: "Subscription status retrieved successfully",
            401: "Unauthorized"
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
        tags=['payments'],
        operation_description="Initiate a Toss payment for subscription",
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
            200: "Payment initiation successful",
            400: "Invalid tier",
            401: "Unauthorized"
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
    pagination_class = CustomPagination
    
    @swagger_auto_schema(
        tags=['admin'],
        operation_description="Get payment history (admin only)",
        manual_parameters=[
            openapi.Parameter(
                'email',
                openapi.IN_QUERY,
                description="Filter by user email",
                type=openapi.TYPE_STRING,
                required=False
            ),
            openapi.Parameter(
                'limit',
                openapi.IN_QUERY,
                description="Number of results to return per page",
                type=openapi.TYPE_INTEGER,
                required=False
            ),
            openapi.Parameter(
                'offset',
                openapi.IN_QUERY,
                description="The initial index from which to return the results",
                type=openapi.TYPE_INTEGER,
                required=False
            )
        ],
        responses={
            200: "Payment history retrieved successfully",
            401: "Unauthorized",
            403: "Forbidden - Admin only"
        }
    )
    def get(self, request):
        try:
            # Get email filter from query params
            email_filter = request.query_params.get('email')
            
            # Start with all payments ordered by approved_at
            payments = TossPayment.objects.select_related('user').order_by('-approved_at')
            
            # Apply email filter if provided
            if email_filter:
                payments = payments.filter(user__email__icontains=email_filter)
            
            # Apply pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(payments, request)
            
            # Format the payment records
            payment_history = [{
                'email': payment.user.email,
                'order_id': payment.order_id,
                'amount': payment.amount,
                'method': payment.get_method_display(),
                'status': payment.get_status_display(),
                'approved_at': payment.approved_at.isoformat() if payment.approved_at else None
            } for payment in page]
            
            return paginator.get_paginated_response({
                'success': True,
                'payments': payment_history
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BTCPaymentConfirmView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        tags=['payments'],
        operation_description="Confirm a Bitcoin payment and activate subscription",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['tx_hash', 'amount', 'user_id'],
            properties={
                'tx_hash': openapi.Schema(type=openapi.TYPE_STRING, description='Bitcoin transaction hash'),
                'amount': openapi.Schema(type=openapi.TYPE_STRING, description='BTC amount'),
                'user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='User ID'),
            }
        ),
        responses={
            200: "Payment confirmed successfully",
            400: "Invalid parameters",
            401: "Unauthorized",
            404: "User not found"
        }
    )
    def post(self, request):
        try:
            # Get and validate parameters
            tx_hash = request.data.get('tx_hash')
            amount = request.data.get('amount')
            user_id = request.data.get('user_id')
            
            if not all([tx_hash, amount, user_id]):
                return Response({
                    'success': False,
                    'message': 'Missing required parameters'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate tx_hash format (should be 64 characters hexadecimal)
            if not len(tx_hash) == 64 or not all(c in '0123456789abcdefABCDEF' for c in tx_hash):
                return Response({
                    'success': False,
                    'message': 'Invalid transaction hash format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Convert amount to Decimal and validate
            try:
                amount = Decimal(amount)
                if amount <= 0:
                    raise ValueError("Amount must be positive")
            except (ValueError, DecimalException):
                return Response({
                    'success': False,
                    'message': 'Invalid amount format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Create BTC transaction record
            transaction = BTCTransaction.objects.create(
                user=user,
                tx_hash=tx_hash,
                amount=amount,
                status='CONFIRMED',
                confirmed_at=timezone.now()
            )
            
            # Determine subscription tier based on BTC amount
            # Example: 0.001 BTC for Pro, 0.01 BTC for Whale
            if amount >= Decimal('0.01'):
                tier = 'whale'
            elif amount >= Decimal('0.001'):
                tier = 'pro'
            else:
                return Response({
                    'success': False,
                    'message': 'Amount too low for subscription'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Activate subscription
            subscription = activate_subscription(user, tier)
            
            return Response({
                'success': True,
                'transaction': {
                    'tx_hash': transaction.tx_hash,
                    'amount': str(transaction.amount),
                    'status': transaction.status
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

class BTCSubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        tags=['subscriptions'],
        operation_description="Get user's BTC payment and subscription status",
        responses={
            200: "Status retrieved successfully",
            401: "Unauthorized",
            404: "No BTC payment found"
        }
    )
    def get(self, request):
        try:
            # Get user's latest BTC transaction
            latest_transaction = BTCTransaction.objects.filter(
                user=request.user
            ).order_by('-created_at').first()
            
            # Get user's subscription
            subscription = Subscription.objects.filter(
                user=request.user
            ).first()
            
            if not latest_transaction:
                return Response({
                    'success': True,
                    'btc_payment': None,
                    'subscription': {
                        'tier': subscription.tier if subscription else 'FREE',
                        'is_active': subscription.is_active if subscription else False,
                        'end_date': subscription.end_date.isoformat() if subscription and subscription.end_date else None
                    }
                })
            
            return Response({
                'success': True,
                'btc_payment': {
                    'confirmed': latest_transaction.status == 'CONFIRMED',
                    'tx_hash': latest_transaction.tx_hash,
                    'amount': str(latest_transaction.amount),
                    'confirmed_at': latest_transaction.confirmed_at.isoformat() if latest_transaction.confirmed_at else None
                },
                'subscription': {
                    'tier': subscription.tier if subscription else 'FREE',
                    'is_active': subscription.is_active if subscription else False,
                    'end_date': subscription.end_date.isoformat() if subscription and subscription.end_date else None
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminSubscriptionListView(APIView):
    permission_classes = [IsAdminUser]
    pagination_class = CustomPagination
    
    @swagger_auto_schema(
        tags=['admin'],
        operation_description="Get subscription list (admin only)",
        manual_parameters=[
            openapi.Parameter(
                'limit',
                openapi.IN_QUERY,
                description="Number of results to return per page",
                type=openapi.TYPE_INTEGER,
                required=False
            ),
            openapi.Parameter(
                'offset',
                openapi.IN_QUERY,
                description="The initial index from which to return the results",
                type=openapi.TYPE_INTEGER,
                required=False
            )
        ],
        responses={
            200: "Subscription list retrieved successfully",
            401: "Unauthorized",
            403: "Forbidden - Admin only"
        }
    )
    def get(self, request):
        try:
            # Get all subscriptions with related user data
            subscriptions = Subscription.objects.select_related('user').all().order_by('-created_at')
            
            # Apply pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(subscriptions, request)
            
            subscription_list = [{
                'email': sub.user.email,
                'tier': sub.tier,
                'is_active': sub.is_active,
                'start_date': sub.start_date.isoformat() if sub.start_date else None,
                'end_date': sub.end_date.isoformat() if sub.end_date else None,
                'created_at': sub.created_at.isoformat(),
                'updated_at': sub.updated_at.isoformat()
            } for sub in page]
            
            return paginator.get_paginated_response({
                'success': True,
                'subscriptions': subscription_list
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
