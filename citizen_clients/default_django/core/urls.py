"""URL routes for the core app."""
from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("global-stats/", views.GlobalStatsView.as_view(), name="global_stats"),
    path("global-results/", views.GlobalResultsView.as_view(), name="global_results"),
    path("select-stats/", views.SelectStatsView.as_view(), name="select_stats"),
    path("select-results/", views.SelectResultsView.as_view(), name="select_results"),
    path("poll-office-stats/", views.PollOfficeStatsView.as_view(), name="poll_office_stats"),
    path("poll-office-results/", views.PollOfficeResultsView.as_view(), name="poll_office_results"),
    path("api/candidateparties/", views.ProxyView.as_view()),
    path("api/mode/", views.ProxyView.as_view()),
    path("api/polloffices/", views.ProxyView.as_view()),
    path("api/pollofficeresults/", views.ProxyView.as_view()),
    path("api/pollofficestats/", views.ProxyView.as_view()),
]
