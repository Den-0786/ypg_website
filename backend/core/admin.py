from django.contrib import admin
from .models import (
    Quiz, QuizSubmission, Event, TeamMember, Donation, ContactMessage,
    MinistryRegistration, BlogPost, Testimonial, GalleryItem, 
    Congregation, Analytics
)

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'start_time', 'end_time', 'submissions_count', 'correct_submissions_count']
    list_filter = ['is_active', 'start_time', 'end_time']
    search_fields = ['title', 'description']
    readonly_fields = ['submissions_count', 'correct_submissions_count', 'has_ended', 'is_currently_active']
    actions = ['generate_password']

    def generate_password(self, request, queryset):
        for quiz in queryset:
            quiz.generate_password()
        self.message_user(request, f"Generated passwords for {queryset.count()} quiz(zes)")
    generate_password.short_description = "Generate random password"

@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'quiz', 'congregation', 'selected_answer', 'is_correct', 'submitted_at']
    list_filter = ['is_correct', 'submitted_at', 'congregation']
    search_fields = ['name', 'phone_number', 'congregation']
    readonly_fields = ['submitted_at']

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'start_date', 'end_date', 'location', 'is_featured', 'registration_required']
    list_filter = ['event_type', 'is_featured', 'registration_required', 'start_date']
    search_fields = ['title', 'description', 'location']

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'is_active', 'order']
    list_filter = ['is_active', 'position']
    search_fields = ['name', 'position', 'bio']
    list_editable = ['order', 'is_active']

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['donor_name', 'amount', 'payment_method', 'payment_status', 'receipt_code', 'created_at']
    list_filter = ['payment_method', 'payment_status', 'created_at']
    search_fields = ['donor_name', 'email', 'phone', 'receipt_code']
    readonly_fields = ['receipt_code', 'created_at']
    actions = ['mark_verified']

    def mark_verified(self, request, queryset):
        updated = queryset.update(payment_status='verified')
        self.message_user(request, f"Marked {updated} donation(s) as verified")
    mark_verified.short_description = "Mark selected donations as verified"

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    readonly_fields = ['created_at']
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"Marked {updated} message(s) as read")
    mark_as_read.short_description = "Mark selected messages as read"

@admin.register(MinistryRegistration)
class MinistryRegistrationAdmin(admin.ModelAdmin):
    list_display = ['name', 'ministry', 'congregation', 'age', 'is_approved', 'created_at']
    list_filter = ['ministry', 'is_approved', 'created_at']
    search_fields = ['name', 'email', 'congregation']
    readonly_fields = ['created_at']
    actions = ['approve_registrations']

    def approve_registrations(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f"Approved {updated} registration(s)")
    approve_registrations.short_description = "Approve selected registrations"

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_published', 'is_featured', 'views', 'created_at']
    list_filter = ['is_published', 'is_featured', 'created_at', 'author']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views', 'created_at', 'updated_at']
    actions = ['publish_posts', 'unpublish_posts']

    def publish_posts(self, request, queryset):
        updated = queryset.update(is_published=True)
        self.message_user(request, f"Published {updated} post(s)")
    publish_posts.short_description = "Publish selected posts"

    def unpublish_posts(self, request, queryset):
        updated = queryset.update(is_published=False)
        self.message_user(request, f"Unpublished {updated} post(s)")
    unpublish_posts.short_description = "Unpublish selected posts"

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'rating', 'is_featured', 'is_active', 'created_at']
    list_filter = ['rating', 'is_featured', 'is_active', 'created_at']
    search_fields = ['name', 'position', 'content']
    list_editable = ['is_featured', 'is_active']

@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_featured', 'created_at']
    list_filter = ['category', 'is_featured', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['is_featured']

@admin.register(Congregation)
class CongregationAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'contact_person', 'phone', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'location', 'contact_person']

@admin.register(Analytics)
class AnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'page_views', 'unique_visitors', 'quiz_participants', 'donations_received']
    list_filter = ['date']
    readonly_fields = ['created_at']
