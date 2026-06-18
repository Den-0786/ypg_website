"""
Vision & Mission API endpoints
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login
import json
from .models import VisionMission, Supervisor
from .serializers import VisionMissionSerializer


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_vision_mission(request):
    """Get Vision and Mission content"""
    try:
        vision_mission = VisionMission.get_instance()
        serializer = VisionMissionSerializer(vision_mission, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_vision_mission_update(request):
    """Update Vision and Mission content (Admin only)"""
    try:
        # Check authentication
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        session_token = None
        if auth_header.startswith('Bearer '):
            session_token = auth_header.split(' ')[1]

        if not request.user.is_authenticated and not session_token:
            return Response({
                'success': False,
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Try to authenticate using session token
        if session_token and not request.user.is_authenticated:
            try:
                supervisor = Supervisor.objects.get(session_token=session_token)
                login(request, supervisor.user)
                request.user = supervisor.user
            except Supervisor.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid session token'
                }, status=status.HTTP_401_UNAUTHORIZED)

        try:
            supervisor = Supervisor.objects.get(user=request.user)
        except Supervisor.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Supervisor access required'
            }, status=status.HTTP_403_FORBIDDEN)

        vision_mission = VisionMission.get_instance()

        # Handle FormData for image uploads
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = {
                'mission_text': request.POST.get('mission_text', vision_mission.mission_text),
                'vision_text': request.POST.get('vision_text', vision_mission.vision_text),
                'motto': request.POST.get('motto', vision_mission.motto),
                'theme_title': request.POST.get('theme_title', vision_mission.theme_title),
                'theme_text': request.POST.get('theme_text', vision_mission.theme_text),
            }
            if 'mission_image' in request.FILES:
                vision_mission.mission_image = request.FILES['mission_image']
            if 'vision_image' in request.FILES:
                vision_mission.vision_image = request.FILES['vision_image']
        else:
            # Handle JSON data
            data = json.loads(request.body)

        # Update text fields
        vision_mission.mission_text = data.get('mission_text', vision_mission.mission_text)
        vision_mission.vision_text = data.get('vision_text', vision_mission.vision_text)
        vision_mission.motto = data.get('motto', vision_mission.motto)
        vision_mission.theme_title = data.get('theme_title', vision_mission.theme_title)
        vision_mission.theme_text = data.get('theme_text', vision_mission.theme_text)

        vision_mission.save()

        serializer = VisionMissionSerializer(vision_mission, context={'request': request})
        return Response({
            'success': True,
            'message': 'Vision & Mission updated successfully',
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
