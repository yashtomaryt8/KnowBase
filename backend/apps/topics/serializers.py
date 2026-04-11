from django.db.models import Count
from rest_framework import serializers

from .models import Topic


class TopicSummarySerializer(serializers.ModelSerializer):
    page_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Topic
        fields = ['id', 'name', 'icon', 'page_count']


class TopicSerializer(serializers.ModelSerializer):
    parent_id = serializers.PrimaryKeyRelatedField(
        source='parent',
        queryset=Topic.objects.all(),
        allow_null=True,
        required=False,
    )
    page_count = serializers.IntegerField(read_only=True)
    parent_topic = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            'id',
            'name',
            'slug',
            'icon',
            'color',
            'description',
            'parent',
            'parent_id',
            'parent_topic',
            'children',
            'sort_order',
            'created_at',
            'updated_at',
            'page_count',
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_parent_topic(self, obj):
        if obj.parent_id is None:
            return None
        return TopicSummarySerializer(obj.parent).data

    def get_children(self, obj):
        children = (
            obj.children.annotate(page_count=Count('pages'))
            .order_by('sort_order', 'name')
        )
        return TopicSummarySerializer(children, many=True).data


class TopicTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    page_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Topic
        fields = [
            'id',
            'name',
            'slug',
            'icon',
            'color',
            'description',
            'parent',
            'page_count',
            'sort_order',
            'created_at',
            'updated_at',
            'children',
        ]

    def get_children(self, obj):
        children = getattr(obj, '_tree_children', None)
        if children is None:
            children = list(obj.children.all().order_by('sort_order', 'name'))

        ordered_children = sorted(children, key=lambda child: (child.sort_order, child.name))
        return TopicTreeSerializer(ordered_children, many=True).data
