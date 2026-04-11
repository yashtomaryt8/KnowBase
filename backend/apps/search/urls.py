from django.urls import path

from .views import IndexPageView, SemanticSearchView, TextSearchView

urlpatterns = [
    path('', TextSearchView.as_view(), name='text-search'),
    path('semantic/', SemanticSearchView.as_view(), name='semantic-search'),
    path('index/<uuid:page_id>/', IndexPageView.as_view(), name='index-page'),
]
