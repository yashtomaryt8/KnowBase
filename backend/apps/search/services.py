from sentence_transformers import SentenceTransformer

from .models import Embedding

model = SentenceTransformer('all-MiniLM-L6-v2')


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
    words = text.split()
    if not words:
        return []

    step = max(chunk_size - overlap, 1)
    chunks = []

    for start in range(0, len(words), step):
        end = start + chunk_size
        chunk = ' '.join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(words):
            break

    return chunks


def embed_page(page) -> int:
    Embedding.objects.filter(page=page).delete()

    if not page.content_text.strip():
        return 0

    chunks = chunk_text(page.content_text)
    if not chunks:
        return 0

    vectors = model.encode(chunks, batch_size=32, show_progress_bar=False)
    embeddings = [
        Embedding(
            page=page,
            chunk_text=chunk,
            chunk_index=index,
            vector=vector.tolist(),
        )
        for index, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]
    Embedding.objects.bulk_create(embeddings)
    return len(embeddings)
