from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
import uuid

class Supervisor(models.Model):
    """
    Supervisor model for admin authentication
    This extends the basic User model with additional supervisor-specific fields
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='supervisor_profile')
    is_supervisor = models.BooleanField(default=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    session_token = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Supervisor: {self.user.username}"
    
    def generate_session_token(self):
        """Generate a unique session token"""
        self.session_token = str(uuid.uuid4())
        self.save()
        return self.session_token
    
    def clear_session(self):
        """Clear the session token"""
        self.session_token = None
        self.save()
    
    class Meta:
        verbose_name = "Supervisor"
        verbose_name_plural = "Supervisors"

# Placeholder models - these will need to be properly defined later
# For now, creating minimal models to prevent import errors

class Quiz(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class QuizSubmission(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    congregation = models.CharField(max_length=100)
    selected_answer = models.CharField(max_length=1)
    is_correct = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=50)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=200)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    participants = models.PositiveIntegerField(default=0, help_text="Number of participants/attendees")
    is_featured = models.BooleanField(default=False)
    registration_required = models.BooleanField(default=False)
    dashboard_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    congregation = models.CharField(max_length=200, blank=True)
    quote = models.TextField(blank=True, help_text="Favorite quote or motto")
    image = models.ImageField(upload_to='team/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_council = models.BooleanField(default=False)
    position_order = models.IntegerField(default=999)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Donation(models.Model):
    donor_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, default='pending')
    receipt_code = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class MinistryRegistration(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    ministry = models.CharField(max_length=100)
    congregation = models.CharField(max_length=100)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Ministry(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    leader_name = models.CharField(max_length=100, blank=True)
    leader_phone = models.CharField(max_length=20, blank=True)
    color = models.CharField(max_length=50, default='from-blue-500 to-teal-500')
    dashboard_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    content = models.TextField()
    rating = models.IntegerField(default=5)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class GalleryItem(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Congregation(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Analytics(models.Model):
    date = models.DateField(unique=True)
    page_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    quiz_participants = models.IntegerField(default=0)
    donations_received = models.IntegerField(default=0)
    contact_submissions = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Analytics"

class BranchPresident(models.Model):
    """
    Branch President model for managing congregation leaders
    """
    name = models.CharField(max_length=100)
    congregation = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    position = models.CharField(max_length=100, default="Branch President")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.congregation}"
    
    class Meta:
        verbose_name = "Branch President"
        verbose_name_plural = "Branch Presidents"

class PastExecutive(models.Model):
    """
    Past Executive model for managing former district executives
    """
    POSITION_CHOICES = [
        ('president', 'President'),
        ('president_rep', "President's Representative"),
        ('secretary', 'Secretary'),
        ('assistant_secretary', 'Assistant Secretary'),
        ('financial_secretary', 'Financial Secretary'),
        ('treasurer', 'Treasurer'),
        ('organizing_secretary', 'Organizing Secretary'),
        ('evangelism_secretary', 'Evangelism Secretary'),
        ('welfare_secretary', 'Welfare Secretary'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=50, choices=POSITION_CHOICES, default='other')
    reign_period = models.CharField(max_length=50, help_text="e.g., 2020-2022")
    image = models.ImageField(upload_to='past_executives/', null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    position_order = models.IntegerField(default=999)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_position_display()}"
    
    class Meta:
        verbose_name = "Past Executive"
        verbose_name_plural = "Past Executives"

class Advertisement(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    CATEGORY_CHOICES = [
        ('food', 'Food & Catering'),
        ('fashion', 'Fashion & Beauty'),
        ('technology', 'Technology'),
        ('education', 'Education & Training'),
        ('health', 'Health & Wellness'),
        ('automotive', 'Automotive'),
        ('real_estate', 'Real Estate'),
        ('services', 'Services'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    advertiser_name = models.CharField(max_length=100)
    advertiser_contact = models.CharField(max_length=30)
    advertiser_email = models.EmailField(blank=True, null=True)
    location = models.CharField(max_length=200)
    is_member = models.BooleanField(default=False)
    member_congregation = models.CharField(max_length=100, blank=True, null=True)
    price_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_fixed = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_type = models.CharField(max_length=20, choices=[('fixed', 'Fixed Price'), ('range', 'Price Range')], default='fixed')
    images = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    def __str__(self):
        return f"{self.title} - {self.advertiser_name}"
    
    class Meta:
        verbose_name = "Advertisement"
        verbose_name_plural = "Advertisements"

class YStoreItem(models.Model):
    CATEGORY_CHOICES = [
        ('clothing', 'Clothing'),
        ('accessories', 'Accessories'),
        ('books', 'Books'),
        ('merchandise', 'Merchandise'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='merchandise')
    image = models.ImageField(upload_to='ystore/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    contact = models.CharField(max_length=20, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'core_ystore_item'
