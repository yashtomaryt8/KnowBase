from django.db.models import Count
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Topic
from .serializers import TopicSerializer, TopicTreeSerializer


class TopicTreeView(APIView):
    def get(self, request):
        topics = list(
            Topic.objects.annotate(page_count=Count('pages')).order_by('sort_order', 'name')
        )
        topic_map = {}
        roots = []

        for topic in topics:
            topic._tree_children = []
            topic_map[topic.id] = topic

        for topic in topics:
            if topic.parent_id:
                parent = topic_map.get(topic.parent_id)
                if parent is not None:
                    parent._tree_children.append(topic)
            else:
                roots.append(topic)

        serializer = TopicTreeSerializer(roots, many=True)
        return Response(serializer.data)


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.annotate(page_count=Count('pages')).order_by('sort_order', 'name')
    serializer_class = TopicSerializer

    def destroy(self, request, *args, **kwargs):
        topic = self.get_object()
        topic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TopicReorderView(APIView):
    def patch(self, request, pk):
        children = request.data.get('children', [])
        if not isinstance(children, list):
            return Response(
                {'detail': 'children must be a list.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_root = pk == 'root'
        if not is_root:
            get_object_or_404(Topic, pk=pk)

        child_ids = [child.get('id') for child in children if child.get('id')]
        topics = {
            str(topic.id): topic
            for topic in Topic.objects.filter(
                parent_id=None if is_root else pk,
                id__in=child_ids,
            )
        }

        if len(topics) != len(child_ids):
            return Response(
                {'detail': 'One or more topics were not found under the requested parent.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        to_update = []
        for child in children:
            topic = topics[str(child['id'])]
            topic.sort_order = child.get('sort_order', topic.sort_order)
            to_update.append(topic)

        with transaction.atomic():
            Topic.objects.bulk_update(to_update, ['sort_order'])

        return Response(TopicSerializer(to_update, many=True).data)

    def post(self, request, pk):
        return self.patch(request, pk)
