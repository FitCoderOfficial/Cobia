from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Wallet, TossPayment, PendingPayment, Subscription
from unittest.mock import patch
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class WalletViewSetTestCase(TestCase):
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123'
        )
        
        # Create wallets for user1
        self.wallet1 = Wallet.objects.create(
            user=self.user1,
            address='0x1234567890abcdef',
            alias='Test Wallet 1'
        )
        self.wallet2 = Wallet.objects.create(
            user=self.user1,
            address='0xfedcba0987654321',
            alias='Test Wallet 2'
        )
        
        # Create wallet for user2
        self.wallet3 = Wallet.objects.create(
            user=self.user2,
            address='0xabcdef1234567890',
            alias='Test Wallet 3'
        )
        
        # Set up API client
        self.client = APIClient()
        
        # URLs
        self.list_url = reverse('wallet-list')
        self.detail_url = lambda pk: reverse('wallet-detail', kwargs={'pk': pk})

    def test_unauthorized_access(self):
        """Test that unauthorized users receive 401 error"""
        # List wallets
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Create wallet
        response = self.client.post(self.list_url, {
            'address': '0xnewaddress123',
            'alias': 'New Wallet'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Retrieve wallet
        response = self.client.get(self.detail_url(self.wallet1.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Delete wallet
        response = self.client.delete(self.detail_url(self.wallet1.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_create_wallet(self):
        """Test that authenticated users can create wallets"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.post(self.list_url, {
            'address': '0xnewaddress123',
            'alias': 'New Wallet'
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Wallet.objects.count(), 4)
        self.assertEqual(Wallet.objects.last().user, self.user1)
        self.assertEqual(Wallet.objects.last().address, '0xnewaddress123')
        self.assertEqual(Wallet.objects.last().alias, 'New Wallet')

    def test_authenticated_user_can_retrieve_own_wallets(self):
        """Test that authenticated users can retrieve their own wallets"""
        self.client.force_authenticate(user=self.user1)
        
        # List wallets
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # user1 has 2 wallets
        
        # Retrieve specific wallet
        response = self.client.get(self.detail_url(self.wallet1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['address'], self.wallet1.address)
        self.assertEqual(response.data['alias'], self.wallet1.alias)

    def test_authenticated_user_can_delete_own_wallet(self):
        """Test that authenticated users can delete their own wallets"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.delete(self.detail_url(self.wallet1.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Wallet.objects.count(), 2)  # 3 - 1 = 2 wallets remaining

    def test_cannot_access_other_users_wallets(self):
        """Test that users cannot access wallets owned by other users"""
        self.client.force_authenticate(user=self.user1)
        
        # Try to retrieve user2's wallet
        response = self.client.get(self.detail_url(self.wallet3.id))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Try to delete user2's wallet
        response = self.client.delete(self.detail_url(self.wallet3.id))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_wallet_creation_validation(self):
        """Test wallet creation validation"""
        self.client.force_authenticate(user=self.user1)
        
        # Test missing required fields
        response = self.client.post(self.list_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('address', response.data['error']['message'])
        self.assertIn('alias', response.data['error']['message'])
        
        # Test invalid address format
        response = self.client.post(self.list_url, {
            'address': 'invalid_address',
            'alias': 'Invalid Wallet'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test duplicate address
        response = self.client.post(self.list_url, {
            'address': self.wallet1.address,
            'alias': 'Duplicate Wallet'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class TossPaymentConfirmViewTestCase(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        # Set up API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # URLs
        self.payment_url = reverse('toss-payment-confirm')
        
        # Test payment data
        self.payment_key = 'test_payment_key_123'
        self.order_id = 'COBIA-TEST123'
        self.amount = 99000  # Pro tier amount
        
        # Create pending payment
        self.pending_payment = PendingPayment.objects.create(
            user=self.user,
            order_id=self.order_id,
            amount=self.amount,
            expires_at=timezone.now() + timedelta(minutes=30)
        )

    @patch('requests.post')
    def test_successful_payment_confirmation(self, mock_post):
        """Test successful payment confirmation and subscription activation"""
        # Mock successful Toss API response
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'status': 'DONE',
            'method': 'CARD',
            'approvedAt': timezone.now().isoformat()
        }
        
        response = self.client.post(self.payment_url, {
            'paymentKey': self.payment_key,
            'orderId': self.order_id,
            'amount': self.amount
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify payment record was created
        payment = TossPayment.objects.get(order_id=self.order_id)
        self.assertEqual(payment.user, self.user)
        self.assertEqual(payment.amount, self.amount)
        self.assertEqual(payment.status, 'SUCCESS')
        
        # Verify subscription was activated
        subscription = Subscription.objects.get(user=self.user)
        self.assertEqual(subscription.tier, 'pro')
        self.assertTrue(subscription.is_active)
        
        # Verify pending payment was deleted
        self.assertFalse(PendingPayment.objects.filter(order_id=self.order_id).exists())

    @patch('requests.post')
    def test_duplicate_payment(self, mock_post):
        """Test handling of duplicate payment attempts"""
        # Create a successful payment first
        TossPayment.objects.create(
            user=self.user,
            order_id=self.order_id,
            payment_key=self.payment_key,
            amount=self.amount,
            status='SUCCESS'
        )
        
        response = self.client.post(self.payment_url, {
            'paymentKey': self.payment_key,
            'orderId': self.order_id,
            'amount': self.amount
        })
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'DUPLICATE_PAYMENT')

    @patch('requests.post')
    def test_expired_payment(self, mock_post):
        """Test handling of expired payment sessions"""
        # Set pending payment to expired
        self.pending_payment.expires_at = timezone.now() - timedelta(minutes=1)
        self.pending_payment.save()
        
        response = self.client.post(self.payment_url, {
            'paymentKey': self.payment_key,
            'orderId': self.order_id,
            'amount': self.amount
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'PAYMENT_EXPIRED')
        
        # Verify pending payment was deleted
        self.assertFalse(PendingPayment.objects.filter(order_id=self.order_id).exists())

    @patch('requests.post')
    def test_invalid_payment_status(self, mock_post):
        """Test handling of invalid payment status from Toss API"""
        # Mock Toss API response with invalid status
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'status': 'CANCELED',
            'method': 'CARD',
            'approvedAt': timezone.now().isoformat()
        }
        
        response = self.client.post(self.payment_url, {
            'paymentKey': self.payment_key,
            'orderId': self.order_id,
            'amount': self.amount
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'INVALID_PAYMENT_STATUS')

    @patch('requests.post')
    def test_toss_api_error(self, mock_post):
        """Test handling of Toss API errors"""
        # Mock Toss API error response
        mock_post.return_value.status_code = 400
        mock_post.return_value.json.return_value = {
            'code': 'PAYMENT_ERROR',
            'message': 'Payment failed'
        }
        
        response = self.client.post(self.payment_url, {
            'paymentKey': self.payment_key,
            'orderId': self.order_id,
            'amount': self.amount
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'PAYMENT_CONFIRMATION_FAILED')

    def test_missing_required_parameters(self):
        """Test handling of missing required parameters"""
        response = self.client.post(self.payment_url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'MISSING_PARAMETERS')

    def test_amount_mismatch(self):
        """Test handling of amount mismatch with pending payment"""
        response = self.client.post(self.payment_url, {
            'paymentKey': self.payment_key,
            'orderId': self.order_id,
            'amount': 100000  # Different amount
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'AMOUNT_MISMATCH')

    @patch('requests.post')
    def test_whale_tier_subscription(self, mock_post):
        """Test successful payment for Whale tier subscription"""
        # Update pending payment amount for Whale tier
        self.pending_payment.amount = 990000
        self.pending_payment.save()
        
        # Mock successful Toss API response
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'status': 'DONE',
            'method': 'CARD',
            'approvedAt': timezone.now().isoformat()
        }
        
        response = self.client.post(self.payment_url, {
            'paymentKey': self.payment_key,
            'orderId': self.order_id,
            'amount': 990000
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify Whale tier subscription was activated
        subscription = Subscription.objects.get(user=self.user)
        self.assertEqual(subscription.tier, 'whale')
        self.assertTrue(subscription.is_active)

    def test_unauthorized_access(self):
        """Test that unauthorized users cannot confirm payments"""
        self.client.logout()
        
        response = self.client.post(self.payment_url, {
            'paymentKey': self.payment_key,
            'orderId': self.order_id,
            'amount': self.amount
        })
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
