import json

from django.test import TestCase
from rest_framework.test import APIClient

from core.models import Announcement, WebsiteSettings


class AnnouncementVenueTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_with_venue(self):
        response = self.client.post('/api/announcements/create/', {
            'title': 'District Rally',
            'date': '2026-09-01',
            'venue': 'YPG Hall, Ahinsan',
            'is_anticipated': False,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        announcement = Announcement.objects.get(title='District Rally')
        self.assertEqual(announcement.venue, 'YPG Hall, Ahinsan')

    def test_create_without_venue_defaults_to_blank(self):
        response = self.client.post('/api/announcements/create/', {
            'title': 'No Venue Event',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Announcement.objects.get(title='No Venue Event').venue, '')

    def test_list_includes_venue(self):
        Announcement.objects.create(title='Listed', venue='Church Hall')
        response = self.client.get('/api/announcements/')
        data = response.json()
        self.assertTrue(data['success'])
        item = next(a for a in data['announcements'] if a['title'] == 'Listed')
        self.assertEqual(item['venue'], 'Church Hall')

    def test_update_adds_venue_to_existing_announcement(self):
        announcement = Announcement.objects.create(title='Legacy')
        response = self.client.put(
            f'/api/announcements/{announcement.id}/update/',
            {'title': 'Legacy', 'venue': 'New Venue'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        announcement.refresh_from_db()
        self.assertEqual(announcement.venue, 'New Venue')

    def test_update_without_venue_keeps_existing_value(self):
        announcement = Announcement.objects.create(title='Keep', venue='Original')
        self.client.put(
            f'/api/announcements/{announcement.id}/update/',
            {'title': 'Keep'},
            format='json',
        )
        announcement.refresh_from_db()
        self.assertEqual(announcement.venue, 'Original')


class PaymentDetailsSettingsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/settings/website'

    def _put(self, payload):
        return self.client.put(
            self.url, json.dumps(payload), content_type='application/json'
        )

    def test_put_persists_momo_details(self):
        response = self._put({
            'paymentDetails': {
                'momoNumber': '0244123456',
                'momoName': 'YPG Ahinsan',
                'bankAccountNumber': '',
                'bankAccountName': '',
            }
        })
        self.assertEqual(response.status_code, 200)
        settings_obj = WebsiteSettings.get_instance()
        self.assertEqual(settings_obj.momo_number, '0244123456')
        self.assertEqual(settings_obj.momo_name, 'YPG Ahinsan')

    def test_get_returns_payment_details_for_main_page(self):
        settings_obj = WebsiteSettings.get_instance()
        settings_obj.momo_number = '0555999888'
        settings_obj.momo_name = 'Guild Welfare'
        settings_obj.save()

        response = self.client.get(self.url)
        pd = response.json()['settings']['paymentDetails']
        self.assertEqual(pd['momoNumber'], '0555999888')
        self.assertEqual(pd['momoName'], 'Guild Welfare')
