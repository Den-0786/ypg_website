from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Sum
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Supervisor
from .models import (
    Quiz, QuizSubmission, Event, TeamMember, Donation, 
    ContactMessage, MinistryRegistration, BlogPost, 
    Testimonial, GalleryItem, Congregation, Analytics, BranchPresident, Advertisement
)
from .serializers import (
    QuizSerializer, QuizSubmissionSerializer, QuizCreateSerializer, 
    QuizResultsSerializer, EventSerializer, TeamMemberSerializer,
    DonationSerializer, ContactMessageSerializer, MinistryRegistrationSerializer,
    BlogPostSerializer, TestimonialSerializer, GalleryItemSerializer,
    CongregationSerializer, AnalyticsSerializer, AdvertisementSerializer
)
import json

# Authentication API endpoints
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_supervisor_login(request):
    """Supervisor login endpoint"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return Response({
                'success': False,
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Check if user is a supervisor
            try:
                supervisor = Supervisor.objects.get(user=user)
            except Supervisor.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Access denied. Supervisor privileges required.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Log in the user
            login(request, user)
            
            # Update supervisor info
            supervisor.last_login_ip = get_client_ip(request)
            session_token = supervisor.generate_session_token()
            
            return Response({
                'success': True,
                'user': {
                    'username': user.username,
                    'role': 'supervisor',
                    'loginTime': timezone.now().isoformat(),
                    'session_token': session_token
                },
                'message': 'Login successful'
            })
        else:
            return Response({
                'success': False,
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_supervisor_logout(request):
    """Supervisor logout endpoint"""
    try:
        if request.user.is_authenticated:
            try:
                supervisor = Supervisor.objects.get(user=request.user)
                supervisor.clear_session()
            except Supervisor.DoesNotExist:
                pass
            
            logout(request)
        
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_supervisor_status(request):
    """Check supervisor authentication status"""
    try:
        if request.user.is_authenticated:
            try:
                supervisor = Supervisor.objects.get(user=request.user)
                return Response({
                    'success': True,
                    'authenticated': True,
                    'user': {
                        'username': request.user.username,
                        'role': 'supervisor',
                        'loginTime': supervisor.updated_at.isoformat()
                    }
                })
            except Supervisor.DoesNotExist:
                return Response({
                    'success': True,
                    'authenticated': False
                })
        else:
            return Response({
                'success': True,
                'authenticated': False
            })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_supervisor_change_credentials(request):
    """Change supervisor credentials"""
    try:
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            supervisor = Supervisor.objects.get(user=request.user)
        except Supervisor.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Supervisor access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        data = json.loads(request.body)
        current_password = data.get('currentPassword')
        new_username = data.get('newUsername')
        new_password = data.get('newPassword')
        
        if not current_password:
            return Response({
                'success': False,
                'error': 'Current password is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify current password
        if not request.user.check_password(current_password):
            return Response({
                'success': False,
                'error': 'Current password is incorrect'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Update username if provided
        if new_username and new_username.strip():
            # Check if username already exists
            if User.objects.filter(username=new_username.strip()).exclude(id=request.user.id).exists():
                return Response({
                    'success': False,
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            request.user.username = new_username.strip()
        
        # Update password if provided
        if new_password and new_password.strip():
            request.user.set_password(new_password.strip())
        
        request.user.save()
        supervisor.updated_at = timezone.now()
        supervisor.save()
        
        return Response({
            'success': True,
            'message': 'Credentials updated successfully',
            'credentials': {
                'username': request.user.username,
                'hasPassword': True
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

# Quiz API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_active_quiz(request):
    """Get the currently active quiz"""
    try:
        active_quiz = Quiz.objects.filter(
            is_active=True,
            start_time__lte=timezone.now(),
            end_time__gte=timezone.now()
        ).first()
        
        if not active_quiz:
            return Response({
                'success': False,
                'error': 'No active quiz found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = QuizSerializer(active_quiz)
        return Response({
            'success': True,
            'quiz': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_quizzes(request):
    """Get all quizzes"""
    try:
        quizzes = Quiz.objects.all().order_by('-created_at')
        serializer = QuizSerializer(quizzes, many=True)
        return Response({
            'success': True,
            'quizzes': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_submit_quiz(request):
    """Submit a quiz answer"""
    try:
        data = json.loads(request.body)
        quiz_id = data.get('quiz_id')
        name = data.get('name')
        phone_number = data.get('phone_number')
        congregation = data.get('congregation')
        selected_answer = data.get('selected_answer')
        
        if not all([quiz_id, name, phone_number, congregation, selected_answer]):
            return Response({
                'success': False,
                'error': 'All fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        # Check if quiz is active
        if not quiz.is_currently_active:
            return Response({
                'success': False,
                'error': 'Quiz is not currently active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already submitted
        existing_submission = QuizSubmission.objects.filter(
            quiz=quiz,
            phone_number=phone_number
        ).first()
        
        if existing_submission:
            return Response({
                'success': False,
                'error': 'You have already submitted this quiz'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if answer is correct
        is_correct = selected_answer.upper() == quiz.correct_answer.upper()
        
        # Create submission
        submission = QuizSubmission.objects.create(
            quiz=quiz,
            name=name,
            phone_number=phone_number,
            congregation=congregation,
            selected_answer=selected_answer.upper(),
            is_correct=is_correct
        )
        
        message = "Correct answer! Well done!" if is_correct else f"Wrong answer. The correct answer was {quiz.correct_answer}."
        
        return Response({
            'success': True,
            'message': message,
            'is_correct': is_correct,
            'submission_id': submission.id
        })
        
    except Quiz.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Quiz not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_quiz_results(request):
    """Get quiz results"""
    try:
        # Get all quizzes that have ended
        ended_quizzes = Quiz.objects.filter(
            end_time__lt=timezone.now()
        ).order_by('-end_time')
        
        serializer = QuizResultsSerializer(ended_quizzes, many=True)
        return Response({
            'success': True,
            'results': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_quiz(request):
    """Create a new quiz (Admin only)"""
    try:
        data = json.loads(request.body)
        serializer = QuizCreateSerializer(data=data)
        
        if serializer.is_valid():
            quiz = serializer.save()
            return Response({
                'success': True,
                'message': 'Quiz created successfully',
                'quiz_id': quiz.id
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
@api_view(['POST'])
@permission_classes([AllowAny])
def api_end_quiz(request, quiz_id):
    """End a quiz (Admin only)"""
    try:
        quiz = get_object_or_404(Quiz, id=quiz_id)
        quiz.is_active = False
        quiz.save()
        
        return Response({
            'success': True,
            'message': 'Quiz ended successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_quiz(request, quiz_id):
    """Delete a quiz (Admin only)"""
    try:
        quiz = get_object_or_404(Quiz, id=quiz_id)
        quiz.delete()
        
        return Response({
            'success': True,
            'message': 'Quiz deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Events API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_events(request):
    """Get all events with optional filtering"""
    try:
        from django.utils import timezone
        
        events = Event.objects.all()
        
        # Filter by type (upcoming/past)
        event_type = request.GET.get('type')
        if event_type == 'upcoming':
            events = events.filter(start_date__gte=timezone.now())
        elif event_type == 'past':
            events = events.filter(start_date__lt=timezone.now())
        
        # Exclude deleted events
        exclude_deleted = request.GET.get('excludeDeleted')
        if exclude_deleted == 'true':
            events = events.filter(dashboard_deleted=False)
        
        events = events.order_by('-start_date')
        serializer = EventSerializer(events, many=True)
        return Response({
            'success': True,
            'events': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_event_detail(request, event_id):
    """Get event detail"""
    try:
        event = get_object_or_404(Event, id=event_id)
        serializer = EventSerializer(event)
        return Response({
            'success': True,
            'event': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_event(request):
    """Create a new event"""
    try:
        from datetime import datetime
        
        # Handle both JSON and FormData
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            # Handle FormData
            data = {
                'title': request.POST.get('title'),
                'description': request.POST.get('description'),
                'location': request.POST.get('location'),
                'participants': int(request.POST.get('participants', 0)),
                'event_type': 'general',  # Default event type
                'is_featured': False,
                'registration_required': False,
            }
            
            # Handle image upload
            if 'image' in request.FILES:
                data['image'] = request.FILES['image']
            
            # Combine date and time fields
            start_date = request.POST.get('start_date')
            start_time = request.POST.get('start_time')
            end_date = request.POST.get('end_date')
            end_time = request.POST.get('end_time')
            
            if start_date and start_time:
                data['start_date'] = f"{start_date} {start_time}"
            elif start_date:
                data['start_date'] = f"{start_date} 00:00:00"
                
            if end_date and end_time:
                data['end_date'] = f"{end_date} {end_time}"
            elif end_date:
                data['end_date'] = f"{end_date} 23:59:59"
        
        serializer = EventSerializer(data=data)
        
        if serializer.is_valid():
            event = serializer.save()
            return Response({
                'success': True,
                'message': 'Event created successfully',
                'event': serializer.data
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
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_event(request, event_id):
    """Update an event"""
    try:
        event = get_object_or_404(Event, id=event_id)
        
        # Handle both JSON and FormData
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            # Handle FormData
            data = {
                'title': request.POST.get('title'),
                'description': request.POST.get('description'),
                'location': request.POST.get('location'),
                'participants': int(request.POST.get('participants', 0)),
                'event_type': 'general',  # Default event type
                'is_featured': False,
                'registration_required': False,
            }
            
            # Handle image upload
            if 'image' in request.FILES:
                data['image'] = request.FILES['image']
            
            # Combine date and time fields
            start_date = request.POST.get('start_date')
            start_time = request.POST.get('start_time')
            end_date = request.POST.get('end_date')
            end_time = request.POST.get('end_time')
            
            if start_date and start_time:
                data['start_date'] = f"{start_date} {start_time}"
            elif start_date:
                data['start_date'] = f"{start_date} 00:00:00"
                
            if end_date and end_time:
                data['end_date'] = f"{end_date} {end_time}"
            elif end_date:
                data['end_date'] = f"{end_date} 23:59:59"
        
        serializer = EventSerializer(event, data=data, partial=True)
        
        if serializer.is_valid():
            updated_event = serializer.save()
            return Response({
                'success': True,
                'message': 'Event updated successfully',
                'event': serializer.data
            })
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
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_event(request, event_id):
    """Delete an event"""
    try:
        event = get_object_or_404(Event, id=event_id)
        
        # Get delete type from query parameters
        delete_type = request.GET.get('type', 'both')
        
        if delete_type == 'dashboard':
            # Soft delete - mark as deleted from dashboard only
            event.dashboard_deleted = True
            event.save()
            message = 'Event removed from dashboard successfully'
        else:
            # Hard delete - remove completely
            event.delete()
            message = 'Event deleted permanently'
        
        return Response({
            'success': True,
            'message': message
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Team API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_team_members(request):
    """Get all team members"""
    try:
        # Define the hierarchy order
        hierarchy_order = [
            'president',
            "president's rep",
            'secretary',
            'assistant secretary',
            'financial secretary',
            'treasurer'
        ]
        
        team_members = TeamMember.objects.filter(is_active=True)
        
        # Sort by hierarchy first, then by name for same position
        def get_position_order(member):
            position_lower = member.position.lower()
            try:
                return hierarchy_order.index(position_lower)
            except ValueError:
                # If position not in hierarchy, put it after treasurer
                return len(hierarchy_order)
        
        sorted_members = sorted(team_members, key=lambda x: (get_position_order(x), x.name))
        
        serializer = TeamMemberSerializer(sorted_members, many=True)
        return Response({
            'success': True,
            'team': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_council_members(request):
    """Get all council members (same as team members)"""
    try:
        team_members = TeamMember.objects.filter(is_active=True).order_by('order', 'name')
        serializer = TeamMemberSerializer(team_members, many=True)
        return Response({
            'success': True,
            'councilMembers': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_team_member_detail(request, member_id):
    """Get team member detail"""
    try:
        member = get_object_or_404(TeamMember, id=member_id)
        serializer = TeamMemberSerializer(member)
        return Response({
            'success': True,
            'member': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_team_member(request):
    """Create a new team member"""
    try:
        # Handle both JSON and FormData requests
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            # Handle FormData
            data = {
                'name': request.POST.get('name'),
                'position': request.POST.get('position'),
                'congregation': request.POST.get('congregation', ''),
                'quote': request.POST.get('quote', ''),
                'is_active': True,
                'order': 0
            }
            # Handle image upload
            if 'image' in request.FILES:
                data['image'] = request.FILES['image']
        
        serializer = TeamMemberSerializer(data=data)
        
        if serializer.is_valid():
            member = serializer.save()
            return Response({
                'success': True,
                'message': 'District executive created successfully',
                'member': serializer.data
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
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_team_member(request, member_id):
    """Update a team member"""
    try:
        member = get_object_or_404(TeamMember, id=member_id)
        
        # Handle both JSON and FormData requests
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            # Handle FormData
            data = {
                'name': request.POST.get('name'),
                'position': request.POST.get('position'),
                'congregation': request.POST.get('congregation', ''),
                'quote': request.POST.get('quote', ''),
            }
            # Handle image upload
            if 'image' in request.FILES:
                data['image'] = request.FILES['image']
        
        serializer = TeamMemberSerializer(member, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'District executive updated successfully',
                'member': serializer.data
            })
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
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_team_member(request, member_id):
    """Delete a team member"""
    try:
        member = get_object_or_404(TeamMember, id=member_id)
        member.delete()
        
        return Response({
            'success': True,
            'message': 'Team member deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Donations API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_donations(request):
    """Get all donations"""
    try:
        donations = Donation.objects.all().order_by('-created_at')
        serializer = DonationSerializer(donations, many=True)
        return Response({
            'success': True,
            'donations': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_submit_donation(request):
    """Submit a donation"""
    try:
        data = json.loads(request.body)
        serializer = DonationSerializer(data=data)
        
        if serializer.is_valid():
            donation = serializer.save()
            return Response({
                'success': True,
                'message': 'Donation submitted successfully',
                'donation_id': donation.id,
                'receipt_code': donation.receipt_code
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
@api_view(['POST'])
@permission_classes([AllowAny])
def api_verify_donation(request, donation_id):
    """Verify a donation"""
    try:
        donation = get_object_or_404(Donation, id=donation_id)
        donation.payment_status = 'verified'
        donation.verified_at = timezone.now()
        donation.save()
        
        return Response({
            'success': True,
            'message': 'Donation verified successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_donation(request, donation_id):
    """Delete a donation"""
    try:
        donation = get_object_or_404(Donation, id=donation_id)
        donation.delete()
        
        return Response({
            'success': True,
            'message': 'Donation deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Contact API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_contact_messages(request):
    """Get all contact messages"""
    try:
        messages = ContactMessage.objects.all().order_by('-created_at')
        serializer = ContactMessageSerializer(messages, many=True)
        return Response({
            'success': True,
            'messages': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_submit_contact(request):
    """Submit a contact message"""
    try:
        data = json.loads(request.body)
        serializer = ContactMessageSerializer(data=data)
        
        if serializer.is_valid():
            message = serializer.save()
            return Response({
                'success': True,
                'message': 'Contact message submitted successfully',
                'message_id': message.id
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
@api_view(['POST'])
@permission_classes([AllowAny])
def api_mark_contact_read(request, message_id):
    """Mark contact message as read"""
    try:
        message = get_object_or_404(ContactMessage, id=message_id)
        message.is_read = True
        message.save()
        
        return Response({
            'success': True,
            'message': 'Message marked as read'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_contact(request, message_id):
    """Delete a contact message"""
    try:
        message = get_object_or_404(ContactMessage, id=message_id)
        message.delete()
        
        return Response({
            'success': True,
            'message': 'Contact message deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Ministry API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_ministry_registrations(request):
    """Get all ministry registrations"""
    try:
        registrations = MinistryRegistration.objects.all().order_by('-created_at')
        serializer = MinistryRegistrationSerializer(registrations, many=True)
        return Response({
            'success': True,
            'ministry': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_submit_ministry_registration(request):
    """Submit a ministry registration"""
    try:
        data = json.loads(request.body)
        serializer = MinistryRegistrationSerializer(data=data)
        
        if serializer.is_valid():
            registration = serializer.save()
            return Response({
                'success': True,
                'message': 'Ministry registration submitted successfully',
                'registration_id': registration.id
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
@api_view(['POST'])
@permission_classes([AllowAny])
def api_approve_ministry_registration(request, registration_id):
    """Approve a ministry registration"""
    try:
        registration = get_object_or_404(MinistryRegistration, id=registration_id)
        registration.is_approved = True
        registration.save()
        
        return Response({
            'success': True,
            'message': 'Ministry registration approved successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_ministry_registration(request, registration_id):
    """Delete a ministry registration"""
    try:
        registration = get_object_or_404(MinistryRegistration, id=registration_id)
        registration.delete()
        
        return Response({
            'success': True,
            'message': 'Ministry registration deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Blog API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_blog_posts(request):
    """Get all blog posts"""
    try:
        posts = BlogPost.objects.filter(is_published=True).order_by('-published_at')
        serializer = BlogPostSerializer(posts, many=True)
        return Response({
            'success': True,
            'blog': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_blog_post_detail(request, slug):
    """Get blog post detail"""
    try:
        post = get_object_or_404(BlogPost, slug=slug, is_published=True)
        post.views += 1
        post.save()
        serializer = BlogPostSerializer(post)
        return Response({
            'success': True,
            'post': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_blog_post(request):
    """Create a new blog post"""
    try:
        data = json.loads(request.body)
        serializer = BlogPostSerializer(data=data)
        
        if serializer.is_valid():
            post = serializer.save()
            return Response({
                'success': True,
                'message': 'Blog post created successfully',
                'post_id': post.id
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
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_blog_post(request, slug):
    """Update a blog post"""
    try:
        post = get_object_or_404(BlogPost, slug=slug)
        data = json.loads(request.body)
        serializer = BlogPostSerializer(post, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Blog post updated successfully'
            })
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
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_blog_post(request, slug):
    """Delete a blog post"""
    try:
        post = get_object_or_404(BlogPost, slug=slug)
        post.delete()
        
        return Response({
            'success': True,
            'message': 'Blog post deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Testimonials API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_testimonials(request):
    """Get all testimonials"""
    try:
        testimonials = Testimonial.objects.filter(is_active=True).order_by('-created_at')
        serializer = TestimonialSerializer(testimonials, many=True)
        return Response({
            'success': True,
            'testimonials': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_testimonial(request):
    """Create a new testimonial"""
    try:
        data = json.loads(request.body)
        serializer = TestimonialSerializer(data=data)
        
        if serializer.is_valid():
            testimonial = serializer.save()
            return Response({
                'success': True,
                'message': 'Testimonial created successfully',
                'testimonial_id': testimonial.id
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
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_testimonial(request, testimonial_id):
    """Update a testimonial"""
    try:
        testimonial = get_object_or_404(Testimonial, id=testimonial_id)
        data = json.loads(request.body)
        serializer = TestimonialSerializer(testimonial, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Testimonial updated successfully'
            })
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
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_testimonial(request, testimonial_id):
    """Delete a testimonial"""
    try:
        testimonial = get_object_or_404(Testimonial, id=testimonial_id)
        testimonial.delete()
        
        return Response({
            'success': True,
            'message': 'Testimonial deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Gallery API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_gallery_items(request):
    """Get all gallery items"""
    try:
        items = GalleryItem.objects.all().order_by('-created_at')
        serializer = GalleryItemSerializer(items, many=True)
        return Response({
            'success': True,
            'media': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_gallery_item(request):
    """Create a new gallery item"""
    try:
        data = json.loads(request.body)
        serializer = GalleryItemSerializer(data=data)
        
        if serializer.is_valid():
            item = serializer.save()
            return Response({
                'success': True,
                'message': 'Gallery item created successfully',
                'item_id': item.id
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
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_gallery_item(request, item_id):
    """Update a gallery item"""
    try:
        item = get_object_or_404(GalleryItem, id=item_id)
        data = json.loads(request.body)
        serializer = GalleryItemSerializer(item, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Gallery item updated successfully'
            })
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
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_gallery_item(request, item_id):
    """Delete a gallery item"""
    try:
        item = get_object_or_404(GalleryItem, id=item_id)
        item.delete()
        
        return Response({
            'success': True,
            'message': 'Gallery item deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Congregations API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_congregations(request):
    """Get all congregations"""
    try:
        congregations = Congregation.objects.filter(is_active=True).order_by('name')
        serializer = CongregationSerializer(congregations, many=True)
        return Response({
            'success': True,
            'congregations': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_congregation(request):
    """Create a new congregation"""
    try:
        data = json.loads(request.body)
        serializer = CongregationSerializer(data=data)
        
        if serializer.is_valid():
            congregation = serializer.save()
            return Response({
                'success': True,
                'message': 'Congregation created successfully',
                'congregation_id': congregation.id
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
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_congregation(request, congregation_id):
    """Update a congregation"""
    try:
        congregation = get_object_or_404(Congregation, id=congregation_id)
        data = json.loads(request.body)
        serializer = CongregationSerializer(congregation, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Congregation updated successfully'
            })
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
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_congregation(request, congregation_id):
    """Delete a congregation"""
    try:
        congregation = get_object_or_404(Congregation, id=congregation_id)
        congregation.delete()
        
        return Response({
            'success': True,
            'message': 'Congregation deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Analytics API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_analytics(request):
    """Get analytics data"""
    try:
        # Get today's analytics or create new one
        today = timezone.now().date()
        analytics, created = Analytics.objects.get_or_create(date=today)
        
        # Calculate additional stats
        total_donations = Donation.objects.filter(payment_status='verified').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        total_events = Event.objects.count()
        total_team_members = TeamMember.objects.filter(is_active=True).count()
        total_blog_posts = BlogPost.objects.filter(is_published=True).count()
        total_testimonials = Testimonial.objects.filter(is_active=True).count()
        total_ministry_registrations = MinistryRegistration.objects.count()
        total_contact_messages = ContactMessage.objects.count()
        
        serializer = AnalyticsSerializer(analytics)
        data = serializer.data
        data.update({
            'total_donations': float(total_donations),
            'total_events': total_events,
            'total_team_members': total_team_members,
            'total_blog_posts': total_blog_posts,
            'total_testimonials': total_testimonials,
            'total_ministry_registrations': total_ministry_registrations,
            'total_contact_messages': total_contact_messages,
        })
        
        return Response({
            'success': True,
            'analytics': data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_track_analytics(request):
    """Track analytics event"""
    try:
        data = json.loads(request.body)
        event_type = data.get('event_type', 'page_view')
        
        today = timezone.now().date()
        analytics, created = Analytics.objects.get_or_create(date=today)
        
        if event_type == 'page_view':
            analytics.page_views += 1
        elif event_type == 'unique_visitor':
            analytics.unique_visitors += 1
        elif event_type == 'quiz_participant':
            analytics.quiz_participants += 1
        elif event_type == 'donation':
            analytics.donations_received += 1
        elif event_type == 'contact_submission':
            analytics.contact_submissions += 1
        
        analytics.save()
        
        return Response({
            'success': True,
            'message': 'Analytics tracked successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Branch President API Views
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_branch_presidents(request):
    """Get all branch presidents for main website"""
    try:
        presidents = BranchPresident.objects.filter(is_active=True).order_by('congregation')
        data = []
        for president in presidents:
            data.append({
                'id': president.id,
                'name': president.name,
                'congregation': president.congregation,
                'location': president.location,
                'phone': president.phone,
                'email': president.email,
                'position': president.position,
                'is_active': president.is_active,
                'created_at': president.created_at.isoformat(),
            })
        return Response({
            'success': True,
            'presidents': data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_branch_presidents_admin(request):
    """Get all branch presidents for admin dashboard"""
    try:
        presidents = BranchPresident.objects.all().order_by('congregation')
        data = []
        for president in presidents:
            data.append({
                'id': president.id,
                'name': president.name,
                'congregation': president.congregation,
                'location': president.location,
                'phone': president.phone,
                'email': president.email,
                'position': president.position,
                'is_active': president.is_active,
                'created_at': president.created_at.isoformat(),
                'updated_at': president.updated_at.isoformat(),
            })
        return Response({
            'success': True,
            'presidents': data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_branch_president_create(request):
    """Create new branch president"""
    try:
        data = json.loads(request.body)
        president = BranchPresident.objects.create(
            name=data.get('name'),
            congregation=data.get('congregation'),
            location=data.get('location', ''),
            phone=data.get('phone'),
            email=data.get('email', ''),
            position=data.get('position', 'Branch President'),
            is_active=data.get('is_active', True)
        )
        return Response({
            'success': True,
            'message': 'Branch president created successfully',
            'id': president.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_branch_president_update(request, president_id):
    """Update branch president"""
    try:
        data = json.loads(request.body)
        president = BranchPresident.objects.get(id=president_id)
        president.name = data.get('name', president.name)
        president.congregation = data.get('congregation', president.congregation)
        president.location = data.get('location', president.location)
        president.phone = data.get('phone', president.phone)
        president.email = data.get('email', president.email)
        president.position = data.get('position', president.position)
        president.is_active = data.get('is_active', president.is_active)
        president.save()
        return Response({
            'success': True,
            'message': 'Branch president updated successfully'
        }, status=status.HTTP_200_OK)
    except BranchPresident.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Branch president not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_branch_president_delete(request, president_id):
    """Delete branch president"""
    try:
        president = BranchPresident.objects.get(id=president_id)
        president.delete()
        return Response({
            'success': True,
            'message': 'Branch president deleted successfully'
        }, status=status.HTTP_200_OK)
    except BranchPresident.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Branch president not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
