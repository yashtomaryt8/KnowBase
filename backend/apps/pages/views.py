from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Page
from .serializers import PageSerializer


def count_words(text: str) -> int:
    return len(text.split()) if text else 0


class PageListCreateView(ListCreateAPIView):
    serializer_class = PageSerializer

    def get_queryset(self):
        queryset = Page.objects.select_related('topic').all()
        topic_id = self.request.query_params.get('topic')
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)
        return queryset.order_by('sort_order', 'created_at')


class PageDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Page.objects.select_related('topic').all()
    serializer_class = PageSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        content_text = serializer.validated_data.get('content_text', instance.content_text)
        serializer.save(word_count=count_words(content_text))

        return Response(serializer.data)


class ImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image = request.FILES.get('image')
        if image is None:
            return Response(
                {'detail': 'image is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        saved_path = default_storage.save(f'pages/{image.name}', image)
        return Response({'url': request.build_absolute_uri(default_storage.url(saved_path))})
