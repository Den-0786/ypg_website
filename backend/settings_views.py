from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SETTINGS_FILE = BASE_DIR / 'site_settings.json'

DEFAULT_PROFILE = {
    'fullName': 'YPG Administrator',
    'email': 'admin@ahinsanypg.com',
    'phone': '+233 531427671',
    'role': 'System Administrator',
    'avatar': None
}

DEFAULT_WEBSITE = {
    'websiteTitle': 'PCG Ahinsan District YPG',
    'contactEmail': 'ahinsandistrictypg@gmail.com',
    'phoneNumber': '+233 531427671',
    'address': 'PCG, Emmanuel Congregation Ahinsan - Kumasi',
    'description': "Presbyterian Young People's Guild - Ahinsan District",
    'socialMedia': {
        'facebook': '',
        'twitter': '',
        'instagram': '',
        'youtube': ''
    },
    'theme': 'light',
    'maintenanceMode': False
}


def load_settings():
    """Load website settings from JSON file, falling back to defaults."""
    if not SETTINGS_FILE.exists():
        return DEFAULT_WEBSITE.copy()
    try:
        with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        merged = DEFAULT_WEBSITE.copy()
        merged.update(data)
        return merged
    except Exception:
        return DEFAULT_WEBSITE.copy()


def save_settings(settings):
    """Save website settings to JSON file."""
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(settings, f, indent=2)


@csrf_exempt
@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def api_settings_profile(request):
    """Get or update admin profile settings"""
    try:
        if request.method == 'GET':
            return Response({
                'success': True,
                'profile': DEFAULT_PROFILE
            })
        elif request.method == 'PUT':
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
            return Response({
                'success': True,
                'settings': load_settings()
            })
        elif request.method == 'PUT':
            data = json.loads(request.body)
            current = load_settings()
            current.update(data)
            save_settings(current)
            return Response({
                'success': True,
                'message': 'Website settings updated successfully',
                'settings': current
            })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
