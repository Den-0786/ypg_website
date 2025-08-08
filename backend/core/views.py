from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Sum
from .models import (
    Quiz, QuizSubmission, Event, TeamMember, Donation, 
    ContactMessage, MinistryRegistration, BlogPost, 
    Testimonial, GalleryItem, Congregation, Analytics
)
from .serializers import (
    QuizSerializer, QuizSubmissionSerializer, QuizCreateSerializer, 
    QuizResultsSerializer, EventSerializer, TeamMemberSerializer,
    DonationSerializer, ContactMessageSerializer, MinistryRegistrationSerializer,
    BlogPostSerializer, TestimonialSerializer, GalleryItemSerializer,
    CongregationSerializer, AnalyticsSerializer
)
import json

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
    """Get all events"""
    try:
        events = Event.objects.all().order_by('-start_date')
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
        data = json.loads(request.body)
        serializer = EventSerializer(data=data)
        
        if serializer.is_valid():
            event = serializer.save()
            return Response({
                'success': True,
                'message': 'Event created successfully',
                'event_id': event.id
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
        data = json.loads(request.body)
        serializer = EventSerializer(event, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Event updated successfully'
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
        event.delete()
        
        return Response({
            'success': True,
            'message': 'Event deleted successfully'
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
        team_members = TeamMember.objects.filter(is_active=True).order_by('order', 'name')
        serializer = TeamMemberSerializer(team_members, many=True)
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
        data = json.loads(request.body)
        serializer = TeamMemberSerializer(data=data)
        
        if serializer.is_valid():
            member = serializer.save()
            return Response({
                'success': True,
                'message': 'Team member created successfully',
                'member_id': member.id
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
        data = json.loads(request.body)
        serializer = TeamMemberSerializer(member, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Team member updated successfully'
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
