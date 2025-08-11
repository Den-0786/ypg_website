from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Supervisor

class Command(BaseCommand):
    help = 'Create a supervisor user for admin authentication'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='supervisor', help='Username for supervisor')
        parser.add_argument('--password', type=str, default='admin123', help='Password for supervisor')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']

        try:
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f'User "{username}" already exists. Updating password...')
                )
                user = User.objects.get(username=username)
                user.set_password(password)
                user.save()
                
                # Get or create supervisor profile
                supervisor, created = Supervisor.objects.get_or_create(user=user)
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Supervisor profile created for "{username}"')
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS(f'Supervisor profile updated for "{username}"')
                    )
            else:
                # Create new user
                user = User.objects.create_user(
                    username=username,
                    password=password,
                    is_staff=True,  # Allow access to admin
                    is_superuser=True,  # Full permissions
                    is_active=True  # Make sure user is active
                )
                
                # Create supervisor profile
                supervisor = Supervisor.objects.create(user=user)
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created supervisor "{username}" with password "{password}"')
                )

            self.stdout.write(
                self.style.SUCCESS(f'Supervisor setup complete!')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Login credentials: {username} / {password}')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating supervisor: {str(e)}')
            )
