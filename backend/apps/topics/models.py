import uuid

from django.db import models
from slugify import slugify


class Topic(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    icon = models.CharField(max_length=10, default='📁')
    color = models.CharField(max_length=7, blank=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='children',
    )
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        base_slug = slugify(self.name) or 'topic'
        slug_candidate = base_slug
        suffix = 2

        while Topic.objects.exclude(pk=self.pk).filter(slug=slug_candidate).exists():
            slug_candidate = f'{base_slug}-{suffix}'
            suffix += 1

        self.slug = slug_candidate
        super().save(*args, **kwargs)
