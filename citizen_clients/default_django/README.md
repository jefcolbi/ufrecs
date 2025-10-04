UFRECS Citizen — Django adaptation (core app)

Overview
- This Django project (ufrecs_citizen) integrates the static site from default_html into the core app using Django templates, static files, and views. It mirrors the Flutter app’s pages and front-end logic.

Key points
- App: core (added to INSTALLED_APPS)
- Templates: core/templates/core with a shared base.html
- Static: core/static/core/css and core/static/core/js (app.js and styles.css)
- URLs: default_django/core/urls.py included at project root
- Context processor: core.context_processors.app_settings exposes UFRECS_BASE_API_URL to templates
- Logging: Python logging configured; views log rendering events. JS logs actions in console.

Pages
- / (core:home)
- /global-stats/ (core:global_stats)
- /global-results/ (core:global_results)
- /select-stats/ (core:select_stats)
- /select-results/ (core:select_results)
- /poll-office-stats/?id=... (core:poll_office_stats)
- /poll-office-results/?id=... (core:poll_office_results)

Configuration
- settings.UFRECS_BASE_API_URL: default http://localhost:8000, injected via <meta name="ufrecs-base-api-url"> for front-end.
- Override per environment by setting UFRECS_BASE_API_URL in settings.

Dependencies
- Django 5.x; Bootstrap 5, jQuery 3.x, Unpoly 3.x loaded via CDN.
- If your Python env is empty, install Django using uv:
  - uv add django
  - Run: uv run python manage.py migrate && uv run python manage.py runserver

Development
- Static files are served from app directories in DEBUG. For production, collect with collectstatic as usual.
- The front-end JS (core/static/core/js/app.js) mirrors default_html/assets/js/app.js and logs all API calls and renders.

Notes
- Select pages navigate using Django routes by reading data-url-* attributes emitted from base.html.

