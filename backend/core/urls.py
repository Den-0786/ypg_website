from django.urls import path
from . import views

urlpatterns = [
    # Authentication API endpoints
    path('api/auth/login/', views.api_supervisor_login, name='api_supervisor_login'),
    path('api/auth/login', views.api_supervisor_login, name='api_supervisor_login_no_slash'),
    path('api/auth/logout/', views.api_supervisor_logout, name='api_supervisor_logout'),
    path('api/auth/status/', views.api_supervisor_status, name='api_supervisor_status'),
    path('api/auth/credentials/', views.api_supervisor_change_credentials, name='api_supervisor_change_credentials'),
    
    # Quiz API endpoints
    path('api/quizzes/active/', views.api_active_quiz, name='api_active_quiz'),
    path('api/quizzes/', views.api_quizzes, name='api_quizzes'),
    path('api/quizzes/submit/', views.api_submit_quiz, name='api_submit_quiz'),
    path('api/quizzes/results/', views.api_quiz_results, name='api_quiz_results'),
    path('api/quizzes/create/', views.api_create_quiz, name='api_create_quiz'),
    path('api/quizzes/<int:quiz_id>/end/', views.api_end_quiz, name='api_end_quiz'),
    path('api/quizzes/<int:quiz_id>/delete/', views.api_delete_quiz, name='api_delete_quiz'),
    
    # Events API endpoints
    path('api/events/', views.api_events, name='api_events'),
    path('api/events/<int:event_id>/', views.api_event_detail, name='api_event_detail'),
    path('api/events/create/', views.api_create_event, name='api_create_event'),
    path('api/events/<int:event_id>/update/', views.api_update_event, name='api_update_event'),
    path('api/events/<int:event_id>/delete/', views.api_delete_event, name='api_delete_event'),
    
    # Team API endpoints
    path('api/team/', views.api_team_members, name='api_team_members'),
    path('api/team/<int:member_id>/', views.api_team_member_detail, name='api_team_member_detail'),
    path('api/team/create/', views.api_create_team_member, name='api_create_team_member'),
    path('api/team/<int:member_id>/update/', views.api_update_team_member, name='api_update_team_member'),
    path('api/team/<int:member_id>/delete/', views.api_delete_team_member, name='api_delete_team_member'),
    
    # Donations API endpoints
    path('api/donations/', views.api_donations, name='api_donations'),
    path('api/donations/submit/', views.api_submit_donation, name='api_submit_donation'),
    path('api/donations/<int:donation_id>/verify/', views.api_verify_donation, name='api_verify_donation'),
    path('api/donations/<int:donation_id>/delete/', views.api_delete_donation, name='api_delete_donation'),
    
    # Contact API endpoints
    path('api/contact/', views.api_contact_messages, name='api_contact_messages'),
    path('api/contact/submit/', views.api_submit_contact, name='api_submit_contact'),
    path('api/contact/<int:message_id>/read/', views.api_mark_contact_read, name='api_mark_contact_read'),
    path('api/contact/<int:message_id>/delete/', views.api_delete_contact, name='api_delete_contact'),
    
    # Ministry API endpoints
    path('api/ministry/', views.api_ministry_registrations, name='api_ministry_registrations'),
    path('api/ministry/register/', views.api_submit_ministry_registration, name='api_submit_ministry_registration'),
    path('api/ministry/<int:registration_id>/approve/', views.api_approve_ministry_registration, name='api_approve_ministry_registration'),
    path('api/ministry/<int:registration_id>/delete/', views.api_delete_ministry_registration, name='api_delete_ministry_registration'),
    
    # Blog API endpoints
    path('api/blog/', views.api_blog_posts, name='api_blog_posts'),
    path('api/blog/<slug:slug>/', views.api_blog_post_detail, name='api_blog_post_detail'),
    path('api/blog/create/', views.api_create_blog_post, name='api_create_blog_post'),
    path('api/blog/<slug:slug>/update/', views.api_update_blog_post, name='api_update_blog_post'),
    path('api/blog/<slug:slug>/delete/', views.api_delete_blog_post, name='api_delete_blog_post'),
    
    # Testimonials API endpoints
    path('api/testimonials/', views.api_testimonials, name='api_testimonials'),
    path('api/testimonials/create/', views.api_create_testimonial, name='api_create_testimonial'),
    path('api/testimonials/<int:testimonial_id>/update/', views.api_update_testimonial, name='api_update_testimonial'),
    path('api/testimonials/<int:testimonial_id>/delete/', views.api_delete_testimonial, name='api_delete_testimonial'),
    
    # Gallery API endpoints
    path('api/gallery/', views.api_gallery_items, name='api_gallery_items'),
    path('api/gallery/create/', views.api_create_gallery_item, name='api_create_gallery_item'),
    path('api/gallery/<int:item_id>/update/', views.api_update_gallery_item, name='api_update_gallery_item'),
    path('api/gallery/<int:item_id>/delete/', views.api_delete_gallery_item, name='api_delete_gallery_item'),
    
    # Congregations API endpoints
    path('api/congregations/', views.api_congregations, name='api_congregations'),
    path('api/congregations/create/', views.api_create_congregation, name='api_create_congregation'),
    path('api/congregations/<int:congregation_id>/update/', views.api_update_congregation, name='api_update_congregation'),
    path('api/congregations/<int:congregation_id>/delete/', views.api_delete_congregation, name='api_delete_congregation'),
    
    # Analytics API endpoints
    path('api/analytics/', views.api_analytics, name='api_analytics'),
    path('api/analytics/track/', views.api_track_analytics, name='api_track_analytics'),
    
    # Branch President API endpoints
    path('branch-presidents/', views.api_branch_presidents, name='api_branch_presidents'),
    path('branch-presidents/admin/', views.api_branch_presidents_admin, name='api_branch_presidents_admin'),
    path('branch-presidents/create/', views.api_branch_president_create, name='api_branch_president_create'),
    path('branch-presidents/<int:president_id>/update/', views.api_branch_president_update, name='api_branch_president_update'),
    path('branch-presidents/<int:president_id>/delete/', views.api_branch_president_delete, name='api_branch_president_delete'),
]





