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
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
import re
from datetime import datetime, timedelta
from .models import Supervisor
from .models import (
    Quiz, QuizSubmission, Event, TeamMember, Donation, 
    ContactMessage, MinistryRegistration, BlogPost, 
    Testimonial, GalleryItem, Congregation, Analytics, BranchPresident, Advertisement, PastExecutive,
    Ministry
)
from .serializers import (
    QuizSerializer, QuizSubmissionSerializer, QuizCreateSerializer, 
    QuizResultsSerializer, EventSerializer, TeamMemberSerializer,
    DonationSerializer, ContactMessageSerializer, MinistryRegistrationSerializer,
    BlogPostSerializer, TestimonialSerializer, GalleryItemSerializer,
    CongregationSerializer, AnalyticsSerializer, AdvertisementSerializer,
    MinistrySerializer
)
import json

# Rate limiting decorator
def rate_limit(max_requests=10, window_seconds=60):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            # Get client IP
            client_ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
            if ',' in client_ip:
                client_ip = client_ip.split(',')[0].strip()
            
            # Create cache key
            cache_key = f"rate_limit_{client_ip}_{view_func.__name__}"
            
            # Get current request count
            current_requests = cache.get(cache_key, 0)
            
            if current_requests >= max_requests:
                return Response({
                    'success': False,
                    'data': {
                        'success': False,
                        'error': 'Rate limit exceeded. Please try again later.'
                    }
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Increment counter
            cache.set(cache_key, current_requests + 1, window_seconds)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

# Email notification functions
def send_donation_notifications(donation):
    """Send email notifications for new donations"""
    try:
        # Email to donor
        donor_subject = f"Donation Confirmation - {donation.receipt_code}"
        donor_message = f"""
Dear {donation.donor_name},

Thank you for your generous donation of GHS {donation.amount} to YPG Ministry.

Donation Details:
- Receipt Code: {donation.receipt_code}
- Amount: GHS {donation.amount}
- Purpose: {donation.get_purpose_display()}
- Payment Method: {donation.get_payment_method_display()}
- Date: {donation.created_at.strftime('%B %d, %Y at %I:%M %p')}

Your donation is currently pending verification. You will receive another email once it's verified.

Thank you for supporting our ministry!

YPG Ministry Team
        """
        
        # Email to admin
        admin_subject = f"New Donation - {donation.receipt_code} - GHS {donation.amount}"
        admin_message = f"""
New donation received:

Donor: {donation.donor_name}
Email: {donation.email}
Phone: {donation.phone}
Amount: GHS {donation.amount}
Purpose: {donation.get_purpose_display()}
Payment Method: {donation.get_payment_method_display()}
Receipt Code: {donation.receipt_code}
Date: {donation.created_at.strftime('%B %d, %Y at %I:%M %p')}

Message: {donation.message or 'No message provided'}

Please verify this donation in the admin dashboard.

YPG Donation System
        """
        
        # Send emails (configure SMTP settings in Django settings)
        if hasattr(settings, 'EMAIL_HOST') and settings.EMAIL_HOST:
            send_mail(
                donor_subject,
                donor_message,
                settings.DEFAULT_FROM_EMAIL,
                [donation.email],
                fail_silently=True,
            )
            
            # Send to admin (you can configure admin email in settings)
            admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@ypg.com')
            send_mail(
                admin_subject,
                admin_message,
                settings.DEFAULT_FROM_EMAIL,
                [admin_email],
                fail_silently=True,
            )
    except Exception as e:
        print(f"Error sending donation notifications: {e}")

# Input validation functions
def validate_donation_data(data):
    errors = {}
    
    # Validate donor name
    if not data.get('donor_name') or len(data['donor_name'].strip()) < 2:
        errors['donor_name'] = 'Donor name must be at least 2 characters long'
    
    # Validate email
    email = data.get('email', '')
    if email:
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            errors['email'] = 'Please enter a valid email address'
    
    # Validate phone
    phone = data.get('phone', '')
    if phone:
        phone = phone.replace(' ', '').replace('-', '')
        if not (phone.startswith('0') and len(phone) == 10) and not (phone.startswith('+233') and len(phone) == 13):
            errors['phone'] = 'Phone number must be 10 digits starting with 0 or 13 digits starting with +233'
    
    # Validate amount
    amount = data.get('amount')
    if not amount or float(amount) <= 0:
        errors['amount'] = 'Amount must be greater than 0'
    elif float(amount) > 1000000:  # 1 million limit
        errors['amount'] = 'Amount cannot exceed 1,000,000'
    
    # Validate payment method
    valid_payment_methods = ['momo', 'cash', 'bank', 'card']
    if data.get('payment_method') not in valid_payment_methods:
        errors['payment_method'] = 'Invalid payment method'
    
    # Validate purpose
    valid_purposes = ['general', 'events', 'welfare', 'ministry', 'building', 'education', 'other']
    if data.get('purpose') not in valid_purposes:
        errors['purpose'] = 'Invalid purpose'
    
    return errors

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
@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def api_supervisor_change_credentials(request):
    """Get or change supervisor credentials"""
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
        
        if request.method == 'GET':
            # Return current credentials
            return Response({
                'success': True,
                'credentials': {
                    'username': request.user.username,
                    'email': request.user.email,
                    'hasPassword': bool(request.user.password),
                    'fullName': f"{request.user.first_name} {request.user.last_name}".strip() or 'YPG Administrator',
                    'role': 'System Administrator'
                }
            })
        
        # Handle PUT request for changing credentials
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
        # Use end_date to determine if an event is past; events remain upcoming until they end
        now = timezone.now()
        if event_type == 'upcoming':
            events = events.filter(end_date__gte=now)
        elif event_type == 'past':
            events = events.filter(end_date__lt=now)
        
        # Exclude deleted events
        exclude_deleted = request.GET.get('excludeDeleted')
        if exclude_deleted == 'true':
            events = events.filter(is_deleted=False)
        
        # Order by start date descending (most recent first)
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
        # Fixed hierarchy order
        hierarchy_order = [
            'president',
            "president's rep",
            'secretary',
            'assistant secretary',
            'financial secretary',
            'treasurer',
            'evangelism coordinator',
            'organizer',
            'others',
        ]

        # Synonyms mapping to normalize positions into the hierarchy labels
        synonyms_map = {
            "president's representative": "president's rep",
            'president rep': "president's rep",
            'assistant sec': 'assistant secretary',
            'fin sec': 'financial secretary',
            'financial sec': 'financial secretary',
            'evangelism sec': 'evangelism secretary',
            'evangelism coordinator': 'evangelism coordinator',
            'protocol': 'protocol officer',
            'protocol sec': 'protocol officer',
            'protocol secretary': 'protocol officer',
        }

        team_members = TeamMember.objects.filter(is_active=True, is_council=False)

        def normalize_position(raw_position: str) -> str:
            if not raw_position:
                return ''
            pos = raw_position.strip().lower()
            # normalize unicode quotes/backticks to ASCII apostrophe
            pos = pos.replace('\u2019', "'").replace('\u2018', "'").replace('`', "'")
            # collapse multiple spaces
            pos = ' '.join(pos.split())
            # reduce longer words to mapped short forms when applicable
            if 'representative' in pos and "president" in pos:
                pos = "president's rep"
            # normalize common synonyms
            pos = synonyms_map.get(pos, pos)
            return pos

        # Sort by hierarchy first, then by name for same position
        def get_position_order(member):
            position_key = normalize_position(member.position)
            try:
                return hierarchy_order.index(position_key)
            except ValueError:
                # If position not in hierarchy, put it after listed roles
                return len(hierarchy_order)

        # If position_order present, prefer it; else compute from mapping
        sorted_members = sorted(
            team_members,
            key=lambda x: (
                getattr(x, 'position_order', 999) if getattr(x, 'position_order', 999) != 999 else get_position_order(x),
                x.name
            )
        )
        
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
        team_members = TeamMember.objects.filter(is_active=True, is_council=True).order_by('order', 'name')
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
            member = serializer.save(is_council=False)
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
            serializer.save(is_council=False)
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
# Council API endpoints (separate from team)
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_council_member(request):
    try:
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = {
                'name': request.POST.get('name'),
                'position': request.POST.get('position'),
                'congregation': request.POST.get('congregation', ''),
                'quote': request.POST.get('quote', ''),
                'is_active': True,
                'order': int(request.POST.get('order', 0) or 0)
            }
            if 'image' in request.FILES:
                data['image'] = request.FILES['image']

        serializer = TeamMemberSerializer(data=data)

        if serializer.is_valid():
            member = serializer.save(is_council=True)
            return Response({
                'success': True,
                'message': 'Council member created successfully',
                'member': TeamMemberSerializer(member).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_council_member(request, member_id):
    try:
        member = get_object_or_404(TeamMember, id=member_id, is_council=True)

        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = {
                'name': request.POST.get('name'),
                'position': request.POST.get('position'),
                'congregation': request.POST.get('congregation', ''),
                'quote': request.POST.get('quote', ''),
            }
            if 'image' in request.FILES:
                data['image'] = request.FILES['image']

        serializer = TeamMemberSerializer(member, data=data, partial=True)
        if serializer.is_valid():
            updated = serializer.save(is_council=True)
            return Response({
                'success': True,
                'message': 'Council member updated successfully',
                'member': TeamMemberSerializer(updated).data
            })
        else:
            return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_council_member(request, member_id):
    try:
        member = get_object_or_404(TeamMember, id=member_id, is_council=True)
        member.delete()
        return Response({'success': True, 'message': 'Council member deleted successfully'})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
    """Get all donations with analytics"""
    try:
        from django.db.models import Sum, Count
        from django.utils import timezone
        from datetime import timedelta
        
        donations = Donation.objects.all().order_by('-created_at')
        serializer = DonationSerializer(donations, many=True)
        
        # Analytics data
        total_donations = donations.aggregate(
            total_amount=Sum('amount'),
            total_count=Count('id')
        )
        
        # Monthly donations
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_donations = donations.filter(created_at__gte=thirty_days_ago).aggregate(
            monthly_amount=Sum('amount'),
            monthly_count=Count('id')
        )
        
        # Purpose breakdown
        purpose_breakdown = donations.values('purpose').annotate(
            amount=Sum('amount'),
            count=Count('id')
        ).order_by('-amount')
        
        # Payment method breakdown
        payment_breakdown = donations.values('payment_method').annotate(
            amount=Sum('amount'),
            count=Count('id')
        ).order_by('-amount')
        
        # Status breakdown
        status_breakdown = donations.values('payment_status').annotate(
            amount=Sum('amount'),
            count=Count('id')
        ).order_by('-amount')
        
        return Response({
            'success': True,
            'donations': serializer.data,
            'analytics': {
                'total_amount': total_donations['total_amount'] or 0,
                'total_count': total_donations['total_count'] or 0,
                'monthly_amount': monthly_donations['monthly_amount'] or 0,
                'monthly_count': monthly_donations['monthly_count'] or 0,
                'purpose_breakdown': list(purpose_breakdown),
                'payment_breakdown': list(payment_breakdown),
                'status_breakdown': list(status_breakdown),
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@rate_limit(max_requests=5, window_seconds=300)  # 5 requests per 5 minutes
def api_submit_donation(request):
    """Submit a donation"""
    try:
        data = json.loads(request.body)
        
        # Validate input data
        validation_errors = validate_donation_data(data)
        if validation_errors:
            return Response({
                'success': False,
                'data': {
                    'success': False,
                    'error': 'Validation failed',
                    'details': validation_errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Sanitize input data
        data['donor_name'] = data.get('donor_name', '').strip()[:100]
        data['email'] = data.get('email', '').strip().lower()[:254]
        data['phone'] = data.get('phone', '').strip()[:20]
        data['message'] = data.get('message', '').strip()[:1000]
        
        serializer = DonationSerializer(data=data)
        
        if serializer.is_valid():
            donation = serializer.save()
            
            # Auto-verify certain payment methods
            if donation.payment_method in ['cash', 'bank']:
                donation.payment_status = 'verified'
                donation.verified_at = timezone.now()
                donation.verified_by = 'Auto-Verification'
                donation.save()
            
            # Send email notifications
            send_donation_notifications(donation)
            
            return Response({
                'success': True,
                'data': {
                    'success': True,
                    'message': 'Donation submitted successfully',
                    'donation_id': donation.id,
                    'receipt_code': donation.receipt_code,
                    'donation': DonationSerializer(donation).data
                }
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'data': {
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)
    except json.JSONDecodeError:
        return Response({
            'success': False,
            'data': {
                'success': False,
                'error': 'Invalid JSON data'
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'data': {
                'success': False,
                'error': 'Internal server error'
            }
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
        donation.verified_by = request.data.get('verified_by', 'Admin')
        donation.save()
        
        return Response({
            'success': True,
            'data': {
                'success': True,
                'message': 'Donation verified successfully',
                'donation': DonationSerializer(donation).data
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'data': {
                'success': False,
                'error': str(e)
            }
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
            'data': {
                'success': True,
                'message': 'Donation deleted successfully'
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'data': {
                'success': False,
                'error': str(e)
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_donation_analytics(request):
    """Get donation analytics"""
    try:
        from django.db.models import Sum, Count
        from datetime import datetime, timedelta
        
        # Basic stats
        total_donations = Donation.objects.count()
        total_amount = Donation.objects.aggregate(total=Sum('amount'))['total'] or 0
        verified_amount = Donation.objects.filter(payment_status='verified').aggregate(total=Sum('amount'))['total'] or 0
        
        # Status counts
        pending_count = Donation.objects.filter(payment_status='pending').count()
        verified_count = Donation.objects.filter(payment_status='verified').count()
        failed_count = Donation.objects.filter(payment_status='failed').count()
        
        # Payment method breakdown
        payment_methods = Donation.objects.filter(payment_status='verified').values('payment_method').annotate(
            total_amount=Sum('amount'),
            count=Count('id')
        )
        
        # Purpose breakdown
        purposes = Donation.objects.filter(payment_status='verified').values('purpose').annotate(
            total_amount=Sum('amount'),
            count=Count('id')
        )
        
        # Monthly trends (last 6 months)
        monthly_trends = []
        for i in range(5, -1, -1):
            date = datetime.now() - timedelta(days=30*i)
            month_start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if i == 0:
                month_end = datetime.now()
            else:
                next_month = month_start + timedelta(days=32)
                month_end = next_month.replace(day=1) - timedelta(days=1)
            
            month_amount = Donation.objects.filter(
                payment_status='verified',
                created_at__gte=month_start,
                created_at__lte=month_end
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_trends.append({
                'month': month_start.strftime('%b'),
                'year': month_start.year,
                'amount': float(month_amount)
            })
        
        return Response({
            'success': True,
            'data': {
                'total_donations': total_donations,
                'total_amount': float(total_amount),
                'verified_amount': float(verified_amount),
                'pending_count': pending_count,
                'verified_count': verified_count,
                'failed_count': failed_count,
                'payment_methods': list(payment_methods),
                'purposes': list(purposes),
                'monthly_trends': monthly_trends
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'data': {
                'success': False,
                'error': str(e)
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_impact_statistics(request):
    """Get real impact statistics for the donation page"""
    try:
        from django.db.models import Count, Sum
        from datetime import datetime, timedelta

        # Get real statistics
        total_youth_reached = TeamMember.objects.count() + 450  # Team members + estimated reach
        total_events = Event.objects.filter(status='published').count()
        total_donations = Donation.objects.filter(payment_status='verified').count()
        total_donation_amount = Donation.objects.filter(payment_status='verified').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Calculate community impact percentage based on verified donations
        community_impact = min(100, (total_donations * 2))  # 2% per verified donation, max 100%

        return Response({
            'success': True,
            'data': {
                'youth_reached': total_youth_reached,
                'events_organized': total_events,
                'community_impact': community_impact,
                'total_donations': total_donations,
                'total_amount': float(total_donation_amount)
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'data': {
                'success': False,
                'error': str(e)
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_process_payment(request):
    """Process payment through payment gateway (Paystack integration)"""
    try:
        data = json.loads(request.body)
        donation_id = data.get('donation_id')
        payment_method = data.get('payment_method')
        
        if not donation_id:
            return Response({
                'success': False,
                'data': {
                    'success': False,
                    'error': 'Donation ID is required'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        donation = get_object_or_404(Donation, id=donation_id)
        
        if payment_method == 'card':
            # Simulate payment gateway processing
            # In real implementation, integrate with Paystack, Stripe, etc.
            payment_result = process_card_payment(donation)
            
            if payment_result['success']:
                donation.payment_status = 'verified'
                donation.verified_at = timezone.now()
                donation.verified_by = 'Payment Gateway'
                donation.transaction_id = payment_result['transaction_id']
                donation.save()
                
                # Send verification email
                send_verification_notification(donation)
                
                return Response({
                    'success': True,
                    'data': {
                        'success': True,
                        'message': 'Payment processed successfully',
                        'transaction_id': payment_result['transaction_id'],
                        'donation': DonationSerializer(donation).data
                    }
                })
            else:
                donation.payment_status = 'failed'
                donation.save()
                
                return Response({
                    'success': False,
                    'data': {
                        'success': False,
                        'error': payment_result['error']
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'data': {
                'success': False,
                'error': 'Invalid payment method'
            }
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'success': False,
            'data': {
                'success': False,
                'error': str(e)
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def process_card_payment(donation):
    """Simulate card payment processing"""
    # In real implementation, integrate with payment gateway
    # For now, simulate successful payment
    import uuid
    
    return {
        'success': True,
        'transaction_id': f"TXN_{uuid.uuid4().hex[:12].upper()}",
        'message': 'Payment processed successfully'
    }

def send_verification_notification(donation):
    """Send verification notification to donor"""
    try:
        subject = f"Donation Verified - {donation.receipt_code}"
        message = f"""
Dear {donation.donor_name},

Great news! Your donation of GHS {donation.amount} has been verified and processed.

Donation Details:
- Receipt Code: {donation.receipt_code}
- Amount: GHS {donation.amount}
- Purpose: {donation.get_purpose_display()}
- Transaction ID: {donation.transaction_id}
- Verified Date: {donation.verified_at.strftime('%B %d, %Y at %I:%M %p')}

Thank you for your generous support of our ministry!

YPG Ministry Team
        """
        
        if hasattr(settings, 'EMAIL_HOST') and settings.EMAIL_HOST:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [donation.email],
                fail_silently=True,
            )
    except Exception as e:
        print(f"Error sending verification notification: {e}")

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

# Ministries CRUD
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_ministries(request):
    try:
        items = Ministry.objects.filter(dashboard_deleted=False).order_by('-created_at')
        return Response({'success': True, 'ministries': MinistrySerializer(items, many=True).data})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_ministry(request):
    try:
        data = json.loads(request.body)
        serializer = MinistrySerializer(data=data)
        if serializer.is_valid():
            item = serializer.save()
            return Response({'success': True, 'ministry': MinistrySerializer(item).data}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_ministry(request, ministry_id):
    try:
        item = get_object_or_404(Ministry, id=ministry_id)
        data = json.loads(request.body)
        serializer = MinistrySerializer(item, data=data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({'success': True, 'ministry': MinistrySerializer(updated).data})
        return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_ministry(request, ministry_id):
    try:
        delete_type = request.GET.get('type', 'both')
        item = get_object_or_404(Ministry, id=ministry_id)
        if delete_type == 'dashboard':
            item.dashboard_deleted = True
            item.save()
            return Response({'success': True, 'message': 'Ministry removed from dashboard'})
        item.delete()
        return Response({'success': True, 'message': 'Ministry deleted successfully'})
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
        # Check if this is for the website (published only) or dashboard (all posts)
        for_website = request.GET.get('forWebsite', 'false').lower() == 'true'
        
        if for_website:
            posts = BlogPost.objects.filter(is_published=True).order_by('-created_at')
        else:
            posts = BlogPost.objects.all().order_by('-created_at')
            
        serializer = BlogPostSerializer(posts, many=True)
        return Response({
            'success': True,
            'posts': serializer.data
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
        if request.FILES:
            # Handle file upload
            data = request.data.copy()
            serializer = BlogPostSerializer(data=data)
        else:
            # Handle JSON data
            data = json.loads(request.body)
            serializer = BlogPostSerializer(data=data)
        
        if serializer.is_valid():
            post = serializer.save()
            return Response({
                'success': True,
                'message': 'Blog post created successfully',
                'post': serializer.data
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
        # Check if this is for the main website (only approved testimonials)
        for_website = request.GET.get('forWebsite', 'false').lower() == 'true'
        deleted_only = request.GET.get('deleted', 'false').lower() == 'true'
        
        if for_website:
            testimonials = Testimonial.objects.filter(status='approved', is_active=True, is_deleted=False).order_by('-created_at')
        elif deleted_only:
            testimonials = Testimonial.objects.filter(is_deleted=True).order_by('-deleted_at')
        else:
            # For dashboard, show all non-deleted testimonials
            testimonials = Testimonial.objects.filter(is_deleted=False).order_by('-created_at')
            
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
    """Soft delete a testimonial"""
    try:
        testimonial = get_object_or_404(Testimonial, id=testimonial_id)
        testimonial.is_deleted = True
        testimonial.deleted_at = timezone.now()
        testimonial.save()
        
        return Response({
            'success': True,
            'message': 'Testimonial moved to trash successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_restore_testimonial(request, testimonial_id):
    """Restore a soft deleted testimonial"""
    try:
        testimonial = get_object_or_404(Testimonial, id=testimonial_id)
        testimonial.is_deleted = False
        testimonial.deleted_at = None
        testimonial.save()
        
        return Response({
            'success': True,
            'message': 'Testimonial restored successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_submit_testimonial(request):
    """Submit a testimonial for review (public endpoint)"""
    try:
        # Handle both JSON and FormData
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            # Handle FormData
            data = {
                'name': request.POST.get('name', ''),
                'phone': request.POST.get('phone', ''),
                'congregation': request.POST.get('congregation', ''),
                'content': request.POST.get('content', ''),
            }
            # Handle file upload
            if 'image' in request.FILES:
                data['image'] = request.FILES['image']
        
        serializer = TestimonialSerializer(data=data)
        
        if serializer.is_valid():
            testimonial = serializer.save(status='pending')
            return Response({
                'success': True,
                'message': 'Testimonial submitted successfully and is pending review',
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
@api_view(['POST'])
@permission_classes([AllowAny])
def api_approve_testimonial(request, testimonial_id):
    """Approve a testimonial"""
    try:
        testimonial = get_object_or_404(Testimonial, id=testimonial_id)
        testimonial.status = 'approved'
        testimonial.is_active = True
        testimonial.save()
        
        return Response({
            'success': True,
            'message': 'Testimonial approved successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_deny_testimonial(request, testimonial_id):
    """Deny a testimonial"""
    try:
        data = json.loads(request.body)
        testimonial = get_object_or_404(Testimonial, id=testimonial_id)
        testimonial.status = 'denied'
        testimonial.is_active = False
        testimonial.admin_notes = data.get('admin_notes', '')
        testimonial.save()
        
        return Response({
            'success': True,
            'message': 'Testimonial denied successfully'
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
        if request.FILES:
            # Handle file upload
            data = request.data.copy()
            
            # Handle video files properly
            if data.get('category') == 'video' and 'file' in request.FILES:
                # Move the file from 'file' to 'video' field
                data['video'] = request.FILES['file']
                # Remove image field to avoid conflicts
                if 'image' in data:
                    del data['image']
            elif data.get('category') == 'image' and 'file' in request.FILES:
                # Move the file from 'file' to 'image' field
                data['image'] = request.FILES['file']
                # Remove video field to avoid conflicts
                if 'video' in data:
                    del data['video']
            
            # Ensure we don't have both image and video fields
            if 'image' in data and 'video' in data:
                if data.get('category') == 'video':
                    del data['image']
                else:
                    del data['video']
            
            serializer = GalleryItemSerializer(data=data)
        else:
            # Handle JSON data
            data = json.loads(request.body)
            serializer = GalleryItemSerializer(data=data)
        
        if serializer.is_valid():
            item = serializer.save()
            return Response({
                'success': True,
                'message': 'Gallery item created successfully',
                'media': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        print(f"Error in api_create_gallery_item: {str(e)}")
        print(traceback.format_exc())
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
        # Support both JSON and multipart form updates with files
        if request.FILES:
            data = request.data.copy()
            # Map generic 'file' to the right field based on category
            if data.get('category') == 'video' and 'file' in request.FILES:
                data['video'] = request.FILES['file']
                if 'image' in data:
                    del data['image']
            elif data.get('category') == 'image' and 'file' in request.FILES:
                data['image'] = request.FILES['file']
                if 'video' in data:
                    del data['video']
            # Avoid sending both fields
            if 'image' in data and 'video' in data:
                if data.get('category') == 'video':
                    del data['image']
                else:
                    del data['video']
        else:
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
        presidents = BranchPresident.objects.filter(is_active=True).order_by('created_at')
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
        presidents = BranchPresident.objects.all().order_by('created_at')
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


# Past Executives API Views
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_past_executives(request):
    """Get all past executives"""
    try:
        show_deleted = request.GET.get('deleted', 'false').lower() == 'true'
        
        if show_deleted:
            executives = PastExecutive.objects.all()
        else:
            executives = PastExecutive.objects.filter(is_deleted=False)
        
        # Fixed order using position_order when available, else fallback mapping
        fallback_order = {
            'president': 1,
            "president's rep": 2,
            'secretary': 3,
            'assistant secretary': 4,
            'financial secretary': 5,
            'treasurer': 6,
            'evangelism coordinator': 7,
            'organizer': 8,
            'others': 99,
        }
        executives_list = list(executives)
        executives_list.sort(key=lambda x: (getattr(x, 'position_order', 999) if getattr(x, 'position_order', 999) != 999 else fallback_order.get(getattr(x, 'position', '').lower(), 999), x.name))
        
        data = []
        for executive in executives_list:
            data.append({
                'id': executive.id,
                'name': executive.name,
                'position': executive.position,
                'position_display': executive.get_position_display(),
                'reign_period': executive.reign_period,
                'image': executive.image.url if executive.image else None,
                'is_deleted': executive.is_deleted,
                'created_at': executive.created_at.isoformat(),
                'updated_at': executive.updated_at.isoformat(),
            })
        
        return Response({
            'success': True,
            'pastExecutives': data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_past_executive_create(request):
    """Create new past executive"""
    try:
        # Handle both JSON and FormData requests
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            # Handle FormData
            data = {
                'name': request.POST.get('name'),
                'position': request.POST.get('position', 'other'),
                'reign_period': request.POST.get('reign_period', ''),
            }
            # Handle image upload
            if 'image' in request.FILES:
                data['image'] = request.FILES['image']
        
        executive = PastExecutive.objects.create(
            name=data.get('name'),
            position=data.get('position', 'other'),
            reign_period=data.get('reign_period', ''),
            image=data.get('image')
        )
        
        return Response({
            'success': True,
            'message': 'Past executive created successfully',
            'executive': {
                'id': executive.id,
                'name': executive.name,
                'position': executive.position,
                'position_display': executive.get_position_display(),
                'reign_period': executive.reign_period,
                'image': executive.image.url if executive.image else None,
                'is_deleted': executive.is_deleted,
                'created_at': executive.created_at.isoformat(),
                'updated_at': executive.updated_at.isoformat(),
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_past_executive_update(request, executive_id):
    """Update past executive"""
    try:
        # Handle both JSON and FormData requests
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            # Handle FormData
            data = {
                'name': request.POST.get('name'),
                'position': request.POST.get('position'),
                'reign_period': request.POST.get('reign_period'),
            }
            # Handle image upload
            if 'image' in request.FILES:
                data['image'] = request.FILES['image']
        
        executive = PastExecutive.objects.get(id=executive_id)
        
        executive.name = data.get('name', executive.name)
        executive.position = data.get('position', executive.position)
        executive.reign_period = data.get('reign_period', executive.reign_period)
        if 'image' in data and data['image'] is not None:
            executive.image = data['image']
        executive.save()
        
        return Response({
            'success': True,
            'message': 'Past executive updated successfully',
            'executive': {
                'id': executive.id,
                'name': executive.name,
                'position': executive.position,
                'position_display': executive.get_position_display(),
                'reign_period': executive.reign_period,
                'image': executive.image.url if executive.image else None,
                'is_deleted': executive.is_deleted,
                'created_at': executive.created_at.isoformat(),
                'updated_at': executive.updated_at.isoformat(),
            }
        })
    except PastExecutive.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Past executive not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_past_executive_delete(request, executive_id):
    """Delete past executive (soft delete)"""
    try:
        executive = PastExecutive.objects.get(id=executive_id)
        executive.is_deleted = True
        executive.save()
        
        return Response({
            'success': True,
            'message': 'Past executive deleted successfully'
        })
    except PastExecutive.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Past executive not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
