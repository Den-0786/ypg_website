from rest_framework import serializers
from .models import (
    Quiz, QuizSubmission, Event, TeamMember, Donation, 
    ContactMessage, MinistryRegistration, BlogPost, 
    Testimonial, GalleryItem, Congregation, Analytics
)

# Quiz Serializers
class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class QuizSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSubmission
        fields = '__all__'

class QuizCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['title', 'description', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'password', 'start_time', 'end_time']

class QuizResultsSerializer(serializers.ModelSerializer):
    submissions_count = serializers.ReadOnlyField()
    correct_submissions_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'end_time', 'submissions_count', 'correct_submissions_count']

# Event Serializers
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

# Team Member Serializers
class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'

# Donation Serializers
class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ['receipt_code', 'transaction_id', 'verified_by', 'verified_at']

# Contact Message Serializers
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['is_read']

# Ministry Registration Serializers
class MinistryRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MinistryRegistration
        fields = '__all__'
        read_only_fields = ['is_approved']

# Blog Post Serializers
class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ['views', 'published_at']

# Testimonial Serializers
class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'

# Gallery Item Serializers
class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = '__all__'

# Congregation Serializers
class CongregationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Congregation
        fields = '__all__'

# Analytics Serializers
class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = '__all__'




