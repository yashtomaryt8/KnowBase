import uuid

from django.db import models
from pgvector.django import HnswIndex, VectorField

from apps.pages.models import Page


class Embedding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='embeddings')
    chunk_text = models.TextField()
    chunk_index = models.PositiveSmallIntegerField(default=0)
    vector = VectorField(dimensions=384)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            HnswIndex(
                name='search_vec_hnsw_idx',
                fields=['vector'],
                m=16,
                ef_construction=64,
                opclasses=['vector_cosine_ops'],
            ),
        ]
