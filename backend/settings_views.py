from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SETTINGS_FILE = BASE_DIR / 'site_settings.json'
PROFILE_FILE = BASE_DIR / 'profile_settings.json'

DEFAULT_PROFILE = {
    'fullName': 'YPG Administrator',
    'email': 'admin@ahinsanypg.com',
    'phone': '+233 531427671',
    'role': 'System Administrator',
    'avatar': None
}

DEFAULT_WEBSITE = {
    'websiteTitle': 'PCG Ahinsan District YPG',
    'contactEmail': '',
    'phoneNumber': '',
    'address': '',
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
    """Save website settings to JSON file with atomic write."""
    import os
    import tempfile
    
    # Write to a temporary file first, then rename for atomic operation
    temp_file = SETTINGS_FILE.with_suffix('.tmp')
    
    try:
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=2)
            f.flush()  # Ensure data is written to disk
            os.fsync(f.fileno())  # Force write to disk
        
        # Rename temp file to actual file (atomic operation)
        os.replace(temp_file, SETTINGS_FILE)
    except Exception as e:
        # Clean up temp file if something went wrong
        if temp_file.exists():
            os.remove(temp_file)
        raise e


def load_profile_settings():
    """Load profile settings from JSON file, falling back to defaults."""
    if not PROFILE_FILE.exists():
        return DEFAULT_PROFILE.copy()
    try:
        with open(PROFILE_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        merged = DEFAULT_PROFILE.copy()
        merged.update(data)
        return merged
    except Exception:
        return DEFAULT_PROFILE.copy()


def save_profile_settings(settings):
    """Save profile settings to JSON file with atomic write."""
    import os
    
    temp_file = PROFILE_FILE.with_suffix('.tmp')
    
    try:
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=2)
            f.flush()
            os.fsync(f.fileno())
        
        os.replace(temp_file, PROFILE_FILE)
    except Exception as e:
        if temp_file.exists():
            os.remove(temp_file)
        raise e


@csrf_exempt
@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def api_settings_profile(request):
    """Get or update admin profile settings"""
    try:
        if request.method == 'GET':
            profile = load_profile_settings()
            print(f"GET profile settings: {profile}")
            response = Response({
                'success': True,
                'profile': profile
            })
            response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            return response
        elif request.method == 'PUT':
            data = json.loads(request.body)
            print(f"PUT profile request body: {data}")
            current = load_profile_settings()
            print(f"Current profile before update: {current}")
            current.update(data)
            print(f"Profile after update: {current}")
            save_profile_settings(current)
            
            # Verify the save was successful by reading it back
            verification = load_profile_settings()
            print(f"Verification after profile save: {verification}")
            
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'profile': verification
            })
    except Exception as e:
        import traceback
        print(f"Error in api_settings_profile: {str(e)}")
        print(traceback.format_exc())
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
            settings = load_settings()
            print(f"GET website settings: {settings}")
            response = Response({
                'success': True,
                'settings': settings
            })
            response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            return response
        elif request.method == 'PUT':
            data = json.loads(request.body)
            print(f"PUT request body: {data}")
            current = load_settings()
            print(f"Current settings before update: {current}")
            current.update(data)
            print(f"Settings after update: {current}")
            save_settings(current)
            
            # Verify the save was successful by reading it back
            verification = load_settings()
            print(f"Verification after save: {verification}")
            
            return Response({
                'success': True,
                'message': 'Website settings updated successfully',
                'settings': verification
            })
    except Exception as e:
        import traceback
        print(f"Error in api_settings_website: {str(e)}")
        print(traceback.format_exc())
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
