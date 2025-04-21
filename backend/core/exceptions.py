from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from requests.exceptions import RequestException

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the error response format
        error_data = {
            'error': {
                'code': get_error_code(exc),
                'message': str(exc)
            }
        }
        response.data = error_data
    else:
        # Handle unhandled exceptions
        error_data = {
            'error': {
                'code': 'INTERNAL_SERVER_ERROR',
                'message': 'An unexpected error occurred'
            }
        }
        response = Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response

def get_error_code(exception):
    """
    Map exceptions to error codes
    """
    if isinstance(exception, ValidationError):
        return 'VALIDATION_ERROR'
    elif isinstance(exception, IntegrityError):
        return 'INTEGRITY_ERROR'
    elif isinstance(exception, RequestException):
        return 'EXTERNAL_SERVICE_ERROR'
    elif hasattr(exception, 'get_codes'):
        # For DRF exceptions
        codes = exception.get_codes()
        if isinstance(codes, str):
            return codes.upper()
        elif isinstance(codes, dict):
            return 'VALIDATION_ERROR'
        return 'API_ERROR'
    return 'UNKNOWN_ERROR' 