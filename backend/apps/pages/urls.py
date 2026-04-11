from django.urls import path

from .views import ImageUploadView, PageDetailView, PageListCreateView

urlpatterns = [
    path('', PageListCreateView.as_view(), name='page-list-create'),
    path('upload-image/', ImageUploadView.as_view(), name='page-upload-image'),
    path('<uuid:pk>/', PageDetailView.as_view(), name='page-detail'),
]
