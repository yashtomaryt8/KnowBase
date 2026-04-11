from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TopicReorderView, TopicTreeView, TopicViewSet

router = DefaultRouter()
router.register('', TopicViewSet, basename='topic')

urlpatterns = [
    path('tree/', TopicTreeView.as_view(), name='topic-tree'),
    path('<str:pk>/reorder/', TopicReorderView.as_view(), name='topic-reorder'),
    path('', include(router.urls)),
]
