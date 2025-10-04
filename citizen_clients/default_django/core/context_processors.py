"""Context processors for the core app.

Adds selected settings to all templates so front-end can read them.
"""
from django.conf import settings


def app_settings(_request):
    """Expose UFRECS_BASE_API_URL to templates."""
    return {
        'UFRECS_BASE_API_URL': getattr(settings, 'UFRECS_BASE_API_URL', 'http://localhost:8000'),
    }

