from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.shortcuts import get_object_or_404
from pgvector.django import CosineDistance
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.pages.models import Page

from .models import Embedding
from .services import embed_page, model


class TextSearchView(APIView):
    def get(self, request):
        query_text = request.query_params.get('q', '').strip()
        if len(query_text) < 2:
            return Response({'results': []})

        vector = SearchVector('title', weight='A') + SearchVector('content_text', weight='B')
        query = SearchQuery(query_text)
        pages = (
            Page.objects.annotate(rank=SearchRank(vector, query))
            .filter(rank__gt=0.01)
            .select_related('topic')
            .order_by('-rank')[:8]
        )

        results = [
            {
                'id': str(page.id),
                'title': page.title,
                'topic': page.topic.name,
                'excerpt': page.content_text[:150],
            }
            for page in pages
        ]
        return Response({'results': results})


class SemanticSearchView(APIView):
    def post(self, request):
        query_text = request.data.get('query', '').strip()
        limit = int(request.data.get('limit', 8))
        if not query_text:
            return Response({'results': []})

        query_vector = model.encode([query_text])[0].tolist()
        results = (
            Embedding.objects.annotate(dist=CosineDistance('vector', query_vector))
            .filter(dist__lt=0.5)
            .select_related('page__topic')
            .order_by('dist')[:limit]
        )

        data = [
            {
                'page_id': str(result.page.id),
                'page_title': result.page.title,
                'topic': result.page.topic.name,
                'excerpt': result.chunk_text[:200],
                'score': round(1 - float(result.dist), 3),
            }
            for result in results
        ]
        return Response({'results': data})


class IndexPageView(APIView):
    def post(self, request, page_id):
        page = get_object_or_404(Page, pk=page_id)
        chunks = embed_page(page)
        return Response({'status': 'ok', 'chunks': chunks}, status=status.HTTP_200_OK)
