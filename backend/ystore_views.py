from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json
import base64
from core.models import YStoreItem
from core.serializers import YStoreItemSerializer

@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_ystore_items(request):
    """Get all Y-Store items or create a new one"""
    try:
        if request.method == 'GET':
            # Check if this is for website display
            for_website = request.GET.get('forWebsite', 'false').lower() == 'true'
            
            if for_website:
                # Only return available items for website
                items = YStoreItem.objects.filter(is_available=True).order_by('-created_at')
            else:
                # Return all items for admin
                items = YStoreItem.objects.all().order_by('-created_at')
            
            serializer = YStoreItemSerializer(items, many=True)
            return Response({
                'success': True,
                'items': serializer.data
            })
        
        elif request.method == 'POST':
            data = request.data.copy()
            
            # Handle image upload
            if 'image' in request.FILES:
                image_file = request.FILES['image']
                data['image'] = image_file
            elif 'image' in data and data['image']:
                # Handle base64 image
                try:
                    image_data = data['image']
                    if isinstance(image_data, str) and image_data.startswith('data:image'):
                        format, imgstr = image_data.split(';base64,')
                        ext = format.split('/')[-1]
                        image_file = ContentFile(base64.b64decode(imgstr), name=f'item.{ext}')
                        data['image'] = image_file
                except Exception as e:
                    return Response({
                        'success': False,
                        'error': f'Invalid image data: {str(e)}'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = YStoreItemSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Y-Store item created successfully',
                    'item': serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
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
@api_view(['PUT', 'DELETE'])
@permission_classes([AllowAny])
def api_ystore_item_detail(request):
    """Update or delete a specific Y-Store item"""
    try:
        item_id = request.GET.get('id')
        if not item_id:
            return Response({
                'success': False,
                'error': 'Item ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            item = YStoreItem.objects.get(id=item_id)
        except YStoreItem.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Item not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'PUT':
            data = request.data.copy()
            
            # Handle image update
            if 'image' in request.FILES:
                image_file = request.FILES['image']
                data['image'] = image_file
            elif 'image' in data and data['image']:
                # Handle base64 image
                try:
                    image_data = data['image']
                    if isinstance(image_data, str) and image_data.startswith('data:image'):
                        format, imgstr = image_data.split(';base64,')
                        ext = format.split('/')[-1]
                        image_file = ContentFile(base64.b64decode(imgstr), name=f'item_{item_id}.{ext}')
                        data['image'] = image_file
                except Exception as e:
                    return Response({
                        'success': False,
                        'error': f'Invalid image data: {str(e)}'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = YStoreItemSerializer(item, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Y-Store item updated successfully',
                    'item': serializer.data
                })
            else:
                return Response({
                    'success': False,
                    'error': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            item.delete()
            return Response({
                'success': True,
                'message': 'Y-Store item deleted successfully'
            })
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
