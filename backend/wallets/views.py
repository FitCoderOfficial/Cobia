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
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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
from django.contrib.auth import authenticate

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
        if getattr(self, 'swagger_fake_view', False):
            return Wallet.objects.none()
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """
        Set the user when creating a new wallet.
        """
        serializer.save(user=self.request.user)
    
    @swagger_auto_schema(
        tags=['wallets'],
        operation_summary="List user's wallets",
        operation_description="Retrieve a paginated list of the authenticated user's wallets",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'count': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'next': openapi.Schema(type=openapi.TYPE_STRING, example='http://api.example.org/accounts/?offset=20&limit=20'),
                    'previous': openapi.Schema(type=openapi.TYPE_STRING, example='http://api.example.org/accounts/?offset=0&limit=20'),
                    'results': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                                'name': openapi.Schema(type=openapi.TYPE_STRING, example='My Wallet'),
                                'address': openapi.Schema(type=openapi.TYPE_STRING, example='0x123...'),
                                'created_at': openapi.Schema(type=openapi.TYPE_STRING, example='2024-01-01T00:00:00Z')
                            }
                        )
                    )
                }
            ),
            401: "Unauthorized - Authentication required",
            403: "Forbidden - Cannot access other users' wallets"
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        tags=['wallets'],
        operation_summary="Create a new wallet",
        operation_description="Create a new wallet for the authenticated user",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'address'],
            properties={
                'name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Name of the wallet',
                    example='My Wallet'
                ),
                'address': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Blockchain address of the wallet',
                    example='0x123...'
                )
            }
        ),
        responses={
            201: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'name': openapi.Schema(type=openapi.TYPE_STRING, example='My Wallet'),
                    'address': openapi.Schema(type=openapi.TYPE_STRING, example='0x123...'),
                    'created_at': openapi.Schema(type=openapi.TYPE_STRING, example='2024-01-01T00:00:00Z')
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'code': openapi.Schema(type=openapi.TYPE_STRING, example='INVALID_ADDRESS'),
                            'message': openapi.Schema(type=openapi.TYPE_STRING, example='Invalid wallet address')
                        }
                    )
                }
            ),
            401: "Unauthorized - Authentication required"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        tags=['wallets'],
        operation_summary="Get wallet details",
        operation_description="Retrieve details of a specific wallet",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'name': openapi.Schema(type=openapi.TYPE_STRING, example='My Wallet'),
                    'address': openapi.Schema(type=openapi.TYPE_STRING, example='0x123...'),
                    'created_at': openapi.Schema(type=openapi.TYPE_STRING, example='2024-01-01T00:00:00Z')
                }
            ),
            401: "Unauthorized - Authentication required",
            403: "Forbidden - Cannot access other users' wallets",
            404: "Wallet not found"
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        tags=['wallets'],
        operation_summary="Delete a wallet",
        operation_description="Delete a specific wallet",
        responses={
            204: "Wallet deleted successfully",
            401: "Unauthorized - Authentication required",
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
        if getattr(self, 'swagger_fake_view', False):
            return Report.objects.none()
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
        operation_summary="List user's reports",
        operation_description="Retrieve a paginated list of reports for the authenticated user's wallets",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'count': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'next': openapi.Schema(type=openapi.TYPE_STRING, example='http://api.example.org/reports/?offset=20&limit=20'),
                    'previous': openapi.Schema(type=openapi.TYPE_STRING, example='http://api.example.org/reports/?offset=0&limit=20'),
                    'results': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                                'wallet': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                                'title': openapi.Schema(type=openapi.TYPE_STRING, example='Monthly Report'),
                                'content': openapi.Schema(type=openapi.TYPE_STRING, example='Report content...'),
                                'created_at': openapi.Schema(type=openapi.TYPE_STRING, example='2024-01-01T00:00:00Z')
                            }
                        )
                    )
                }
            ),
            401: "Unauthorized - Authentication required",
            403: "Forbidden - Cannot access reports for other users' wallets"
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        tags=['reports'],
        operation_summary="Create a new report",
        operation_description="Create a new report for one of the authenticated user's wallets",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['wallet', 'title', 'content'],
            properties={
                'wallet': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='ID of the wallet this report belongs to',
                    example=1
                ),
                'title': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Title of the report',
                    example='Monthly Report'
                ),
                'content': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Content of the report',
                    example='Report content...'
                )
            }
        ),
        responses={
            201: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'wallet': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'title': openapi.Schema(type=openapi.TYPE_STRING, example='Monthly Report'),
                    'content': openapi.Schema(type=openapi.TYPE_STRING, example='Report content...'),
                    'created_at': openapi.Schema(type=openapi.TYPE_STRING, example='2024-01-01T00:00:00Z')
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'code': openapi.Schema(type=openapi.TYPE_STRING, example='INVALID_WALLET'),
                            'message': openapi.Schema(type=openapi.TYPE_STRING, example='Wallet not found or does not belong to user')
                        }
                    )
                }
            ),
            401: "Unauthorized - Authentication required"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        tags=['reports'],
        operation_summary="Get report details",
        operation_description="Retrieve details of a specific report",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'wallet': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'title': openapi.Schema(type=openapi.TYPE_STRING, example='Monthly Report'),
                    'content': openapi.Schema(type=openapi.TYPE_STRING, example='Report content...'),
                    'created_at': openapi.Schema(type=openapi.TYPE_STRING, example='2024-01-01T00:00:00Z')
                }
            ),
            401: "Unauthorized - Authentication required",
            403: "Forbidden - Cannot access reports for other users' wallets",
            404: "Report not found"
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        auto_schema=None  # Hide update and delete operations from Swagger
    )
    def update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Updates are not allowed for reports."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    @swagger_auto_schema(
        auto_schema=None  # Hide update and delete operations from Swagger
    )
    def partial_update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Updates are not allowed for reports."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    @swagger_auto_schema(
        auto_schema=None  # Hide update and delete operations from Swagger
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
        operation_summary="Get subscription status",
        operation_description="Retrieve the current user's subscription status and details",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                    'subscription': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'tier': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='Subscription tier',
                                enum=['FREE', 'PRO', 'WHALE'],
                                example='PRO'
                            ),
                            'is_active': openapi.Schema(
                                type=openapi.TYPE_BOOLEAN,
                                description='Whether the subscription is currently active',
                                example=True
                            ),
                            'end_date': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='Subscription end date in ISO format',
                                example='2024-12-31T23:59:59Z'
                            )
                        }
                    )
                }
            ),
            401: "Unauthorized - Authentication required",
            500: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=False),
                    'message': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example='An error occurred while retrieving subscription status'
                    )
                }
            )
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
        operation_summary="Initiate Toss payment",
        operation_description="Initiate a payment process for subscription upgrade using Toss Payments",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['tier'],
            properties={
                'tier': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Subscription tier to upgrade to',
                    enum=['pro', 'whale'],
                    example='pro'
                )
            }
        ),
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                    'order_id': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        description='Unique order ID for the payment',
                        example='COBIA-ABC123'
                    ),
                    'amount': openapi.Schema(
                        type=openapi.TYPE_INTEGER,
                        description='Payment amount in KRW',
                        example=9900
                    ),
                    'tier': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        description='Selected subscription tier',
                        example='pro'
                    )
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=False),
                    'message': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example='Invalid tier. Must be either "pro" or "whale".'
                    )
                }
            ),
            401: "Unauthorized - Authentication required",
            500: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=False),
                    'message': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example='An error occurred while initiating payment'
                    )
                }
            )
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
        operation_summary="Get BTC subscription status",
        operation_description="Retrieve the current user's BTC payment and subscription status",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                    'btc_payment': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'confirmed': openapi.Schema(
                                type=openapi.TYPE_BOOLEAN,
                                description='Whether the BTC payment is confirmed',
                                example=True
                            ),
                            'tx_hash': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='Bitcoin transaction hash',
                                example='a1b2c3d4e5f6...'
                            ),
                            'amount': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='BTC amount',
                                example='0.001'
                            ),
                            'confirmed_at': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='Payment confirmation timestamp in ISO format',
                                example='2024-01-01T00:00:00Z'
                            )
                        }
                    ),
                    'subscription': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'tier': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='Subscription tier',
                                enum=['FREE', 'PRO', 'WHALE'],
                                example='PRO'
                            ),
                            'is_active': openapi.Schema(
                                type=openapi.TYPE_BOOLEAN,
                                description='Whether the subscription is currently active',
                                example=True
                            ),
                            'end_date': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='Subscription end date in ISO format',
                                example='2024-12-31T23:59:59Z'
                            )
                        }
                    )
                }
            ),
            401: "Unauthorized - Authentication required",
            500: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=False),
                    'message': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example='An error occurred while retrieving subscription status'
                    )
                }
            )
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

class RegisterView(APIView):
    permission_classes = []  # Allow unauthenticated access
    
    @swagger_auto_schema(
        tags=['auth'],
        operation_description="Register a new user",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password', 'nickname'],
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User email address',
                    example='user@example.com'
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User password',
                    example='securepassword123'
                ),
                'nickname': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User nickname',
                    example='JohnDoe'
                ),
            }
        ),
        responses={
            201: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                    'message': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example='User registered successfully'
                    ),
                    'data': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'email': openapi.Schema(type=openapi.TYPE_STRING, example='user@example.com'),
                            'nickname': openapi.Schema(type=openapi.TYPE_STRING, example='JohnDoe'),
                            'subscription_tier': openapi.Schema(type=openapi.TYPE_STRING, example='FREE'),
                            'access': openapi.Schema(type=openapi.TYPE_STRING, example='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'),
                            'refresh': openapi.Schema(type=openapi.TYPE_STRING, example='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...')
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
                                example='EMAIL_EXISTS'
                            ),
                            'message': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                example='Email already registered'
                            )
                        }
                    )
                }
            )
        }
    )
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            nickname = request.data.get('nickname')
            
            if not all([email, password, nickname]):
                return Response({
                    'error': {
                        'code': 'MISSING_FIELDS',
                        'message': 'Email, password, and nickname are required'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate email format
            if '@' not in email or '.' not in email.split('@')[1]:
                return Response({
                    'error': {
                        'code': 'INVALID_EMAIL',
                        'message': 'Invalid email format'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if email already exists
            if User.objects.filter(email=email).exists():
                return Response({
                    'error': {
                        'code': 'EMAIL_EXISTS',
                        'message': 'Email already registered'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new user
            user = User.objects.create_user(
                username=email,  # Using email as username
                email=email,
                password=password,
                first_name=nickname,  # Using nickname as first_name
                subscription_tier='FREE'  # Set default subscription tier
            )
            
            # Generate JWT tokens
            tokens = TokenObtainPairSerializer.get_token(user)
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'data': {
                    'email': user.email,
                    'nickname': user.first_name,
                    'subscription_tier': user.subscription_tier,
                    'access': str(tokens.access_token),
                    'refresh': str(tokens)
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': {
                    'code': 'REGISTRATION_ERROR',
                    'message': str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = []  # Allow unauthenticated access

    @swagger_auto_schema(
        tags=['auth'],
        operation_description="Login with email and password",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User email address',
                    example='user@example.com'
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User password',
                    example='securepassword123'
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
                        example='Login successful'
                    ),
                    'data': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'email': openapi.Schema(type=openapi.TYPE_STRING, example='user@example.com'),
                            'nickname': openapi.Schema(type=openapi.TYPE_STRING, example='JohnDoe'),
                            'subscription_tier': openapi.Schema(type=openapi.TYPE_STRING, example='FREE'),
                            'access': openapi.Schema(type=openapi.TYPE_STRING, example='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'),
                            'refresh': openapi.Schema(type=openapi.TYPE_STRING, example='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...')
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
                                example='INVALID_CREDENTIALS'
                            ),
                            'message': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                example='Invalid email or password'
                            )
                        }
                    )
                }
            )
        }
    )
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not all([email, password]):
            return Response({
                'error': {
                    'code': 'MISSING_FIELDS',
                    'message': 'Email and password are required'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get user by email
            user = User.objects.get(email=email)
            
            # Check password
            if user.check_password(password):
                # Generate JWT tokens
                tokens = TokenObtainPairSerializer.get_token(user)
                
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'data': {
                        'email': user.email,
                        'nickname': user.first_name,  # Using first_name as nickname
                        'subscription_tier': user.subscription_tier,
                        'access': str(tokens.access_token),
                        'refresh': str(tokens)
                    }
                }, status=status.HTTP_200_OK)
            else:
                raise User.DoesNotExist
                
        except User.DoesNotExist:
            return Response({
                'error': {
                    'code': 'INVALID_CREDENTIALS',
                    'message': 'Invalid email or password'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
