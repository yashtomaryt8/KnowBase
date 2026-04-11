from django.urls import path

from .views import ExportPageDocxView, ExportTopicDocxView

urlpatterns = [
    path('page/<uuid:pk>/docx/', ExportPageDocxView.as_view(), name='export-page-docx'),
    path('topic/<uuid:pk>/docx/', ExportTopicDocxView.as_view(), name='export-topic-docx'),
]
