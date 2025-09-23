from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from core.models import Advertisement
from core.serializers import AdvertisementSerializer
import json

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
@permission_classes([AllowAny])
def api_create_advertisement(request):
    """Create new advertisement"""
    try:
        # Handle both JSON and FormData
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            # Handle FormData
            data = {
                'title': request.POST.get('title', ''),
                'description': request.POST.get('description', ''),
                'category': request.POST.get('category', ''),
                'advertiser_name': request.POST.get('advertiser_name', ''),
                'advertiser_contact': request.POST.get('advertiser_contact', ''),
                'advertiser_email': request.POST.get('advertiser_email') or None,
                'location': request.POST.get('location', ''),
                'is_member': request.POST.get('is_member') == 'true',
                'member_congregation': request.POST.get('member_congregation') or None,
                'price_type': request.POST.get('price_type', 'fixed'),
                'price_fixed': request.POST.get('price_fixed') or None,
                'price_min': request.POST.get('price_min') or None,
                'price_max': request.POST.get('price_max') or None,
                'images': [],  # Will be handled separately
            }
            
            # Handle uploaded images
            image_files = []
            for key, file in request.FILES.items():
                if key.startswith('image_'):
                    # Save the file to media/advertisements directory
                    import os
                    from django.core.files.storage import default_storage
                    
                    # Create unique filename
                    import uuid
                    file_extension = os.path.splitext(file.name)[1]
                    unique_filename = f"{uuid.uuid4()}{file_extension}"
                    file_path = f"advertisements/{unique_filename}"
                    
                    # Save the file
                    saved_path = default_storage.save(file_path, file)
                    file_url = default_storage.url(saved_path)
                    
                    # Add to images list
                    image_files.append({
                        'name': file.name,
                        'path': saved_path,
                        'url': file_url,
                        'size': file.size,
                        'content_type': file.content_type
                    })
            data['images'] = image_files
        
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

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_advertisement(request, ad_id):
    """Update advertisement (admin only)"""
    try:
        ad = Advertisement.objects.get(id=ad_id)
        data = json.loads(request.body)
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
