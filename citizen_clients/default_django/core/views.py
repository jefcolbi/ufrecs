"""
Core app views for the UFRECS Citizen website.

Converted to class-based views using TemplateView while preserving
the original logging behavior for observability.
"""
import logging
from urllib.parse import urljoin

from django.http.response import JsonResponse
from django.views.generic import TemplateView
from django.views.generic.base import View
from django.conf import settings
import requests

logger = logging.getLogger(__name__)


class HomeView(TemplateView):
    """Home page with 4 navigation cards."""
    template_name = "core/home.html"

    def get(self, request, *args, **kwargs):
        logger.info("Rendering home page")
        return super().get(request, *args, **kwargs)


class GlobalStatsView(TemplateView):
    """Global statistics page (AJAX-driven)."""
    template_name = "core/global_stats.html"

    def get(self, request, *args, **kwargs):
        logger.info("Rendering global stats page")
        return super().get(request, *args, **kwargs)


class GlobalResultsView(TemplateView):
    """Global results page (AJAX-driven)."""
    template_name = "core/global_results.html"

    def get(self, request, *args, **kwargs):
        logger.info("Rendering global results page")
        return super().get(request, *args, **kwargs)


class SelectStatsView(TemplateView):
    """Select Poll Office (Stats) with search + dropdown."""
    template_name = "core/select_stats.html"

    def get(self, request, *args, **kwargs):
        logger.info("Rendering select stats page")
        return super().get(request, *args, **kwargs)


class SelectResultsView(TemplateView):
    """Select Poll Office (Results) with search + dropdown."""
    template_name = "core/select_results.html"

    def get(self, request, *args, **kwargs):
        logger.info("Rendering select results page")
        return super().get(request, *args, **kwargs)


class PollOfficeStatsView(TemplateView):
    """
    Poll Office Stats page.
    Expects query parameter ?id=... which the front-end JS will read.
    """
    template_name = "core/poll_office_stats.html"

    def get(self, request, *args, **kwargs):
        logger.info(
            "Rendering poll office stats page", extra={"query": request.GET.dict()}
        )
        return super().get(request, *args, **kwargs)


class PollOfficeResultsView(TemplateView):
    """
    Poll Office Results page.
    Expects query parameter ?id=... which the front-end JS will read.
    """
    template_name = "core/poll_office_results.html"

    def get(self, request, *args, **kwargs):
        logger.info(
            "Rendering poll office results page", extra={"query": request.GET.dict()}
        )
        return super().get(request, *args, **kwargs)


class ProxyView(View):
    def get(self, request, *args, **kwargs):
        # Prevent infinite loops if UFRECS_BASE_API_URL points to this app
        # if request.headers.get('X-From-Proxy'):
        #     return JsonResponse({
        #         'error': 'Proxy loop detected. Configure UFRECS_BASE_API_URL to point to the real upstream API.'
        #     }, status=502)

        path = request.path
        params = request.GET.copy()
        base = (getattr(settings, 'UFRECS_BASE_API_URL', '') or '').rstrip('/') + '/'
        url = urljoin(base, path.lstrip('/'))
        print(f"{url = }")

        try:
            resp = requests.get(url, params=params, headers={'X-From-Proxy': '1'}, timeout=10)
            content_type = resp.headers.get('Content-Type', '')
            data = None
            try:
                data = resp.json()
            except ValueError:
                data = {'error': 'Upstream did not return JSON', 'status': resp.status_code}
            return JsonResponse(data, status=resp.status_code)
        except requests.RequestException as e:
            logger.error('Upstream request failed', extra={'url': url, 'error': str(e)})
            return JsonResponse({'error': 'Upstream request failed', 'detail': str(e)}, status=502)

