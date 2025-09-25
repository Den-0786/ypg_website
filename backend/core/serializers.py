from rest_framework import serializers
from .models import (
    Quiz, QuizSubmission, Event, TeamMember, Donation, 
    ContactMessage, MinistryRegistration, BlogPost, 
    Testimonial, GalleryItem, Congregation, Analytics, Advertisement, YStoreItem,
    Ministry, Sale, Expense, Contribution
)

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
        fields = '__all__'

class QuizResultsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class TeamMemberSerializer(serializers.ModelSerializer):
    # Expose 'description' as a read-only alias of 'quote' for frontend compatibility
    description = serializers.CharField(source='quote', read_only=True)

    class Meta:
        model = TeamMember
        fields = '__all__'

class DonationSerializer(serializers.ModelSerializer):
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)
    
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('receipt_code', 'created_at', 'updated_at', 'verified_at')

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class MinistryRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MinistryRegistration
        fields = '__all__'

class MinistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Ministry
        fields = '__all__'

class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'

class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = '__all__'

class CongregationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Congregation
        fields = '__all__'

class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = '__all__'

class AdvertisementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertisement
        fields = '__all__'

class YStoreItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = YStoreItem
        fields = '__all__'

# Finance Management Serializers
class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class ContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribution
        fields = '__all__'