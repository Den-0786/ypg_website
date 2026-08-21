import json

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from core.models import Announcement, WebsiteSettings


class PublicEndpointsSmokeTests(TestCase):
    """Every public GET endpoint must return 200 JSON, never a crash."""

    PUBLIC_GETS = [
        '/api/events/?forWebsite=true',
        '/api/team/',
        '/api/blog/',
        '/api/testimonials/?forWebsite=true',
        '/api/gallery/',
        '/api/ministries/',
        '/api/past-executives/',
        '/api/announcements/',
        '/api/vision-mission/',
        '/api/advertisements/',
        '/api/impact-statistics/',
        '/api/social-media/',
        '/api/settings/website',
        '/branch-presidents/',
    ]

    def test_public_endpoints_return_200_json(self):
        for url in self.PUBLIC_GETS:
            with self.subTest(url=url):
                response = self.client.get(url)
                self.assertEqual(response.status_code, 200, url)
                self.assertEqual(
                    response['Content-Type'], 'application/json', url
                )
                body = response.json()
                self.assertNotIn('traceback', str(body).lower(), url)


class AuthGateTests(TestCase):
    """Mutating endpoints must reject unauthenticated callers."""

    def setUp(self):
        self.client = APIClient()

    def test_anonymous_cannot_create_announcement(self):
        response = self.client.post('/api/announcements/create/', {
            'title': 'Sneaky'}, format='json')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Announcement.objects.count(), 0)

    def test_anonymous_cannot_delete_event(self):
        response = self.client.delete('/api/events/1/delete/')
        self.assertEqual(response.status_code, 401)

    def test_anonymous_cannot_update_settings(self):
        response = self.client.put(
            '/api/settings/website', json.dumps({'websiteTitle': 'Hacked'}),
            content_type='application/json')
        self.assertEqual(response.status_code, 401)
        self.assertNotEqual(
            WebsiteSettings.get_instance().website_title, 'Hacked')

    def test_anonymous_cannot_process_payment(self):
        response = self.client.post('/api/donations/process-payment/', {
            'donation_id': 1}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_public_gets_stay_open(self):
        self.assertEqual(self.client.get('/api/settings/website').status_code, 200)
        self.assertEqual(self.client.get('/api/announcements/').status_code, 200)
        self.assertEqual(self.client.get('/api/events/').status_code, 200)


class AuthenticatedAdminTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin', password='pass12345')
        self.client.force_login(self.admin)

    def test_admin_can_create_announcement(self):
        response = self.client.post('/api/announcements/create/', {
            'title': 'Rally', 'venue': 'Main Hall'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Announcement.objects.first().venue, 'Main Hall')

    def test_admin_can_update_settings(self):
        response = self.client.put(
            '/api/settings/website',
            json.dumps({'paymentDetails': {
                'momoNumber': '0244123456', 'momoName': 'YPG',
                'bankAccountNumber': '', 'bankAccountName': ''}}),
            content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            WebsiteSettings.get_instance().momo_number, '0244123456')


class AnnouncementVenueTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin2', password='pass12345')
        self.client.force_login(self.admin)

    def test_create_without_venue_defaults_to_blank(self):
        response = self.client.post('/api/announcements/create/', {
            'title': 'No Venue Event'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Announcement.objects.get(title='No Venue Event').venue, '')

    def test_list_includes_venue(self):
        Announcement.objects.create(title='Listed', venue='Church Hall')
        response = self.client.get('/api/announcements/')
        item = next(a for a in response.json()['announcements']
                    if a['title'] == 'Listed')
        self.assertEqual(item['venue'], 'Church Hall')

    def test_update_adds_venue_to_existing_announcement(self):
        announcement = Announcement.objects.create(title='Legacy')
        response = self.client.put(
            f'/api/announcements/{announcement.id}/update/',
            {'title': 'Legacy', 'venue': 'New Venue'}, format='json')
        self.assertEqual(response.status_code, 200)
        announcement.refresh_from_db()
        self.assertEqual(announcement.venue, 'New Venue')

    def test_update_without_venue_keeps_existing_value(self):
        announcement = Announcement.objects.create(title='Keep', venue='Original')
        self.client.put(
            f'/api/announcements/{announcement.id}/update/',
            {'title': 'Keep'}, format='json')
        announcement.refresh_from_db()
        self.assertEqual(announcement.venue, 'Original')
