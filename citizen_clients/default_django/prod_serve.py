import pyruvate
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ufrecs_citizen.settings")

application = get_wsgi_application()

pyruvate.serve(application, "127.0.0.1:8440", 12)
