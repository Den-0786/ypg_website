# Generated manually to add Supervisor model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Supervisor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_supervisor', models.BooleanField(default=True)),
                ('last_login_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('session_token', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='supervisor_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Supervisor',
                'verbose_name_plural': 'Supervisors',
            },
        ),
    ]
















