from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import UploadedFile
from django.http.request import QueryDict
from core.models import Advertisement
from core.serializers import AdvertisementSerializer
import json
import os
import uuid

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_advertisements(request):
    """Get all approved advertisements"""
    try:
        ads = Advertisement.objects.filter(status='approved').order_by('-created_at')
        serializer = AdvertisementSerializer(ads, many=True)
        return Response({
            'success': True,
            'advertisements': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_advertisements_admin(request):
    """Get all advertisements for admin dashboard"""
    try:
        ads = Advertisement.objects.all().order_by('-created_at')
        serializer = AdvertisementSerializer(ads, many=True)
        return Response({
            'success': True,
            'advertisements': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
@permission_classes([AllowAny])
def api_create_advertisement(request):
    """Create new advertisement"""
    try:
        parsed = request.data

        # QueryDict (from multipart/form-data) needs .dict() to flatten to single values
        if isinstance(parsed, QueryDict):
            data = parsed.dict()
        else:
            data = dict(parsed)

        # Ensure required fields are present
        data.setdefault('title', '')
        data.setdefault('description', '')
        data.setdefault('category', '')
        data.setdefault('advertiser_name', '')
        data.setdefault('advertiser_contact', '')
        data.setdefault('advertiser_email', None)
        data.setdefault('location', '')
        data['is_member'] = data.get('is_member') in (True, 'true', 'True', '1')
        data.setdefault('member_congregation', None)
        data.setdefault('price_type', 'fixed')
        data.setdefault('price_fixed', None)
        data.setdefault('price_min', None)
        data.setdefault('price_max', None)

        # Handle uploaded images
        images = []
        for key, value in parsed.items():
            if key.startswith('image_') and isinstance(value, UploadedFile):
                images.append(_save_advertisement_image(value))
        data['images'] = images

        data['expires_at'] = timezone.now() + timezone.timedelta(days=30)
        serializer = AdvertisementSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Advertisement submitted successfully. Admin will review and approve.',
                'advertisement': serializer.data
            })
        return Response({
            'success': False,
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def _save_advertisement_image(file):
    """Save an uploaded image and return its metadata."""
    file_extension = os.path.splitext(file.name)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = f"advertisements/{unique_filename}"
    saved_path = default_storage.save(file_path, file)
    file_url = default_storage.url(saved_path)
    return {
        'name': file.name,
        'path': saved_path,
        'url': file_url,
        'size': file.size,
        'content_type': file.content_type
    }


@csrf_exempt
@api_view(['PUT'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
@permission_classes([AllowAny])
def api_update_advertisement(request, ad_id):
    """Update advertisement (admin only)"""
    try:
        ad = Advertisement.objects.get(id=ad_id)
        parsed = request.data

        # QueryDict (from multipart/form-data) needs .dict() to flatten to single values
        if isinstance(parsed, QueryDict):
            data = parsed.dict()
        else:
            data = dict(parsed)

        # Multipart text fields may be missing from request.data; use current values as defaults
        defaults = {
            'title': ad.title,
            'description': ad.description,
            'advertiser_name': ad.advertiser_name,
            'advertiser_contact': ad.advertiser_contact,
            'advertiser_email': ad.advertiser_email,
            'location': ad.location,
            'category': ad.category,
            'price_type': ad.price_type,
            'price_fixed': ad.price_fixed,
            'price_min': ad.price_min,
            'price_max': ad.price_max,
            'admin_notes': ad.admin_notes,
            'status': ad.status,
        }
        for field, default_value in defaults.items():
            data[field] = data.get(field, default_value) or default_value

        # Restore kept images and add newly uploaded ones only when image data is provided
        existing_images_raw = data.get('existing_images') if 'existing_images' in data else None
        has_new_files = any(
            isinstance(value, UploadedFile) for value in parsed.values()
        )

        if existing_images_raw is not None or has_new_files:
            if isinstance(existing_images_raw, str):
                existing_images = json.loads(existing_images_raw)
            else:
                existing_images = existing_images_raw or []
            images = list(existing_images)

            for key, value in parsed.items():
                if key.startswith('image_') and isinstance(value, UploadedFile):
                    images.append(_save_advertisement_image(value))

            data['images'] = images

        serializer = AdvertisementSerializer(ad, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'advertisement': serializer.data
            })
        return Response({
            'success': False,
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Advertisement.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Advertisement not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_advertisement(request, ad_id):
    """Delete advertisement (admin only)"""
    try:
        ad = Advertisement.objects.get(id=ad_id)
        ad.delete()
        return Response({
            'success': True,
            'message': 'Advertisement deleted successfully'
        })
    except Advertisement.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Advertisement not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
