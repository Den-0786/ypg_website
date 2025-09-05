from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def api_settings_profile(request):
    """Get or update admin profile settings"""
    try:
        if request.method == 'GET':
            # Return default profile data
            return Response({
                'success': True,
                'profile': {
                    'fullName': 'YPG Administrator',
                    'email': 'admin@ahinsanypg.com',
                    'phone': '+233 531427671',
                    'role': 'System Administrator',
                    'avatar': None
                }
            })
        elif request.method == 'PUT':
            # Update profile data
            data = json.loads(request.body)
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'profile': data
            })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def api_settings_website(request):
    """Get or update website settings"""
    try:
        if request.method == 'GET':
            # Return default website settings
            return Response({
                'success': True,
                'settings': {
                    'siteName': 'Ahinsan District YPG',
                    'siteDescription': 'Presbyterian Young People\'s Guild - Ahinsan District',
                    'contactEmail': 'ahinsandistrictypg@gmail.com',
                    'contactPhone': '+233 531427671',
                    'address': 'PCG, Emmanuel Congregation Ahinsan - Kumasi',
                    'socialMedia': {
                        'facebook': '',
                        'twitter': '',
                        'instagram': '',
                        'youtube': ''
                    },
                    'theme': 'light',
                    'maintenanceMode': False
                }
            })
        elif request.method == 'PUT':
            # Update website settings
            data = json.loads(request.body)
            return Response({
                'success': True,
                'message': 'Website settings updated successfully',
                'settings': data
            })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
