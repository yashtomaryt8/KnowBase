from rest_framework import serializers

from .models import Page


class PageSerializer(serializers.ModelSerializer):
    topic_id = serializers.PrimaryKeyRelatedField(
        source='topic',
        queryset=Page._meta.get_field('topic').remote_field.model.objects.all(),
    )
    topic_name = serializers.ReadOnlyField(source='topic.name')

    class Meta:
        model = Page
        fields = [
            'id',
            'topic_id',
            'topic_name',
            'title',
            'content_json',
            'content_text',
            'sort_order',
            'is_pinned',
            'word_count',
            'created_at',
            'updated_at',
        ]
