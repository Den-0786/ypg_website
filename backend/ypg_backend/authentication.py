"""Shared DRF authentication classes."""
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session auth that skips CSRF enforcement.

    Browser sessions holding a still-valid cookie get CSRF-checked by DRF
    before view code runs, which blocked authenticated PUT/POST/DELETE calls
    from the cross-origin frontend (no X-CSRFToken header is available).
    All API views are csrf_exempt and perform their own permission checks.
    """

    def enforce_csrf(self, request):
        return
