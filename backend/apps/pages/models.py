import uuid

from django.db import models

from apps.topics.models import Topic


class Page(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='pages')
    title = models.CharField(max_length=300)
    content_json = models.JSONField(default=dict)
    content_text = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    word_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'created_at']

    def __str__(self) -> str:
        return self.title
