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
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    congregation = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    quote = models.TextField(blank=True, help_text="Favorite quote or motto")
    image = models.ImageField(upload_to='team/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_council = models.BooleanField(default=False)
    position_order = models.IntegerField(default=999)
    order = models.IntegerField(default=0)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Donation(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('momo', 'Mobile Money'),
        ('cash', 'Cash'),
        ('bank', 'Bank Transfer'),
        ('card', 'Credit/Debit Card'),
    ]
    
    PURPOSE_CHOICES = [
        ('general', 'General Fund'),
        ('events', 'Events & Activities'),
        ('welfare', 'Welfare Committee'),
        ('ministry', 'Ministry Support'),
        ('building', 'Building Fund'),
        ('education', 'Education Fund'),
        ('other', 'Other'),
    ]
    
    donor_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='GHS')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES, default='general')
    message = models.TextField(blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    receipt_code = models.CharField(max_length=50, unique=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    verified_by = models.CharField(max_length=100, blank=True, null=True)
    is_recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(max_length=20, blank=True, null=True)  # monthly, yearly
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.receipt_code:
            self.receipt_code = self.generate_receipt_code()
        super().save(*args, **kwargs)
    
    def generate_receipt_code(self):
        import uuid
        return f"YPG-{uuid.uuid4().hex[:8].upper()}"
    
    def __str__(self):
        return f"{self.donor_name} - {self.amount} {self.currency}"

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
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
    slug = models.SlugField(unique=True, blank=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    author = models.CharField(max_length=100, default="YPG Leadership")
    category = models.CharField(max_length=50, default="General")
    date = models.DateField(blank=True, null=True)
    image = models.ImageField(upload_to='blog/', blank=True, null=True)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    views = models.IntegerField(default=0)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
            # Ensure uniqueness
            original_slug = self.slug
            counter = 1
            while BlogPost.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

class Testimonial(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('denied', 'Denied'),
    ]
    
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    congregation = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)  # Made optional
    content = models.TextField()
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    rating = models.IntegerField(default=5)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    admin_notes = models.TextField(blank=True)  # For admin to add notes when denying
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

class GalleryItem(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50)
    image = models.ImageField(upload_to='gallery/', blank=True, null=True)
    video = models.FileField(upload_to='gallery/videos/', blank=True, null=True)
    congregation = models.CharField(max_length=200, blank=True)
    date = models.DateField(blank=True, null=True)
    youtube_url = models.URLField(blank=True)
    tiktok_url = models.URLField(blank=True)
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

# Finance Management Models
class Sale(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    item_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    sold_by = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        self.total_amount = self.price * self.quantity
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.item_name} - {self.sold_by}"
    
    class Meta:
        verbose_name = "Sale"
        verbose_name_plural = "Sales"

class Expense(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('events', 'Events'),
        ('equipment', 'Equipment'),
        ('transportation', 'Transportation'),
        ('food', 'Food & Refreshments'),
        ('utilities', 'Utilities'),
        ('other', 'Other'),
    ]
    
    date = models.DateField()
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_by = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.description} - {self.amount}"
    
    class Meta:
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"

class Contribution(models.Model):
    TYPE_CHOICES = [
        ('renewal', 'Renewal'),
        ('offertory', 'Offertory'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # For renewals
    congregation = models.CharField(max_length=200, blank=True, null=True)
    number_of_people = models.PositiveIntegerField(blank=True, null=True)
    
    # For offertories
    program_type = models.CharField(max_length=200, blank=True, null=True)
    venue = models.CharField(max_length=200, blank=True, null=True)
    
    def __str__(self):
        if self.type == 'renewal':
            return f"Renewal - {self.congregation} - {self.amount}"
        else:
            return f"Offertory - {self.program_type} - {self.amount}"
    
    class Meta:
        verbose_name = "Contribution"
        verbose_name_plural = "Contributions"
