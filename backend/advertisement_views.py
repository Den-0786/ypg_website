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
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_advertisement(request):
    """Create new advertisement"""
    try:
        data = json.loads(request.body)
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
