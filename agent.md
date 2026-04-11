Tech Stack — Final Decisions
2.1 Why These Choices
Layer	Technology	Reason
Backend API	Django 5 + DRF	You know Django. Local server = zero latency. Full ORM control.
Database	PostgreSQL + pgvector	pgvector extension for semantic search. Free, local, fast.
Frontend	React 18 + Vite + TS	No Next.js overhead. Vite is instant. Pure client SPA.
Styling	TailwindCSS + shadcn/ui	Same as EngKnow. Proven. Dark/light theme built-in.
Rich Editor	TipTap 2	Same as EngKnow. Best in class. Block-based like Notion.
Semantic Search	sentence-transformers	Local embeddings. No OpenAI API cost. Fast inference.
Export	python-docx + weasyprint	DOCX and PDF from Django. One endpoint, two formats.
State	Zustand	Tiny. No Redux complexity. Perfect for a personal tool.
HTTP Client	Axios + React Query	React Query = caching + loading states for free.

2.2 Full Project Structure
knowbase/
├── backend/                   ← Django project root
│   ├── config/                ← settings, urls, wsgi
│   │   ├── settings.py
│   │   ├── settings_dev.py
│   │   └── urls.py
│   ├── apps/
│   │   ├── topics/            ← Topic tree model
│   │   ├── pages/             ← Page content model
│   │   ├── search/            ← Semantic search + embeddings
│   │   └── export/            ← DOCX / PDF generation
│   ├── requirements.txt
│   └── manage.py
├── frontend/                  ← React + Vite
│   ├── src/
│   │   ├── api/               ← Axios instances + React Query hooks
│   │   ├── components/
│   │   │   ├── layout/        ← Sidebar, Header, Shell
│   │   │   ├── editor/        ← TipTap editor
│   │   │   ├── search/        ← Search palette
│   │   │   └── ui/            ← shadcn components
│   │   ├── pages/             ← React Router pages
│   │   ├── store/             ← Zustand stores
│   │   ├── types/             ← TypeScript types
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── docker-compose.yml         ← PostgreSQL + pgvector

 
3. Data Models — Django
KnowBase has exactly 3 core models. No more. DRY and clean.

3.1 Topic (The Tree)
This is the left sidebar tree. A Topic can have a parent_id pointing to another Topic. Unlimited nesting.

# apps/topics/models.py
from django.db import models
import uuid

class Topic(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name       = models.CharField(max_length=200)
    slug       = models.SlugField(max_length=200, unique=True)
    icon       = models.CharField(max_length=10, default='📁')
    color      = models.CharField(max_length=7, blank=True)  # hex #RRGGBB
    description= models.TextField(blank=True)
    parent     = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.CASCADE, related_name='children'
    )
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

💡 Why slug?
The slug is the URL identifier: /react/hooks/useState. When you add a topic called 'useState', it auto-generates slug 'usestate'. The full path is built from parent slugs. This is how EngKnow's fullSlug worked — we replicate it in the backend.

3.2 Page (The Content)
A Page belongs to a Topic. One topic can have multiple pages. Content is stored as TipTap JSON (JSONB in Postgres) + a plain text version for full-text search.

# apps/pages/models.py
class Page(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic        = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='pages')
    title        = models.CharField(max_length=300)
    content_json = models.JSONField(default=dict)   # TipTap JSON
    content_text = models.TextField(blank=True)     # Plain text for FTS
    sort_order   = models.PositiveIntegerField(default=0)
    is_pinned    = models.BooleanField(default=False)
    word_count   = models.PositiveIntegerField(default=0)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'created_at']

3.3 Embedding (Semantic Search)
Each Page gets split into chunks and each chunk gets a vector embedding from sentence-transformers. Stored in pgvector's vector column.

# apps/search/models.py
from pgvector.django import VectorField

class Embedding(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page        = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='embeddings')
    chunk_text  = models.TextField()
    chunk_index = models.PositiveSmallIntegerField(default=0)
    # 384 dims for all-MiniLM-L6-v2 (fast, accurate, free)
    vector      = VectorField(dimensions=384)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [HnswIndex(fields=['vector'], 
                   m=16, ef_construction=64, 
                   opclasses=['vector_cosine_ops'])]

 
3.4 Full Model Relationships Diagram
Topic (tree via self-FK) → has many Pages → each Page has many Embeddings

Topic	Page	Embedding
id (UUID PK)	id (UUID PK)	id (UUID PK)
name	topic_id (FK→Topic)	page_id (FK→Page)
slug (unique)	title	chunk_text
icon	content_json (JSONB)	chunk_index
color	content_text	vector (384d)
parent_id (self-FK)	sort_order	created_at
sort_order	word_count	

 
4. Django Backend — Complete Setup
4.1 Install & Init
# Create project directory
mkdir knowbase && cd knowbase
python -m venv venv && source venv/bin/activate

# Install dependencies
pip install django djangorestframework django-cors-headers
pip install psycopg2-binary pgvector
pip install sentence-transformers  # local embeddings
pip install python-docx weasyprint  # export
pip install python-slugify          # auto slug
pip install pillow                  # image handling

# Start Django project
django-admin startproject config .
python manage.py startapp topics
python manage.py startapp pages
python manage.py startapp search
python manage.py startapp export

4.2 settings.py — Critical Config
# config/settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'rest_framework',
    'corsheaders',
    'apps.topics',
    'apps.pages',
    'apps.search',
    'apps.export',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # MUST be first
    'django.middleware.common.CommonMiddleware',
    # ... rest of defaults
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'knowbase',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

CORS_ALLOWED_ORIGINS = ['http://localhost:5173']  # Vite dev port
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

4.3 PostgreSQL + pgvector via Docker
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: knowbase
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:

# Run: docker-compose up -d
# Then: python manage.py migrate

4.4 URL Structure
# config/urls.py
from django.urls import path, include

urlpatterns = [
    path('api/topics/',  include('apps.topics.urls')),
    path('api/pages/',   include('apps.pages.urls')),
    path('api/search/',  include('apps.search.urls')),
    path('api/export/',  include('apps.export.urls')),
]

 
5. REST API Design — All Endpoints
5.1 Topics API
Method	Endpoint	Description
GET	/api/topics/tree/	Full tree (all topics nested). Used for sidebar.
GET	/api/topics/:id/	Single topic details.
POST	/api/topics/	Create topic. Body: {name, parent_id?, icon?, color?}
PATCH	/api/topics/:id/	Update name, icon, color, sort_order.
DELETE	/api/topics/:id/	Delete topic + all children + all pages recursively.
POST	/api/topics/:id/reorder/	Reorder children. Body: {children: [{id, sort_order}]}

5.2 Pages API
Method	Endpoint	Description
GET	/api/pages/?topic=:id	List pages for a topic.
GET	/api/pages/:id/	Single page with full content_json.
POST	/api/pages/	Create page. Body: {topic_id, title, content_json?}
PATCH	/api/pages/:id/	Auto-save content. Body: {content_json, content_text}
DELETE	/api/pages/:id/	Delete page + all embeddings.

5.3 Search API
Method	Endpoint	Description
GET	/api/search/?q=:query	Text search (fast, instant results via pg FTS).
POST	/api/search/semantic/	Semantic/AI search. Body: {query, limit?}
POST	/api/search/index/:pageId/	Re-index a page's embeddings after save.

5.4 Export API
Method	Endpoint	Description
GET	/api/export/page/:id/docx/	Download page as .docx file.
GET	/api/export/page/:id/pdf/	Download page as .pdf file.
GET	/api/export/topic/:id/docx/	Export entire topic (all pages) as one .docx.

5.5 Topics Tree View — Critical Endpoint
The /api/topics/tree/ endpoint is the most important. It returns the full nested tree in one request so the sidebar renders instantly without multiple API calls.

# apps/topics/views.py
class TopicTreeView(APIView):
    def get(self, request):
        # Get all topics in one DB query
        topics = Topic.objects.all().order_by('sort_order', 'name')
        serializer = TopicTreeSerializer(topics, many=True)
        # Build tree in Python (no N+1 queries)
        all_topics = serializer.data
        topic_map = {t['id']: {**t, 'children': []} for t in all_topics}
        roots = []
        for t in all_topics:
            if t['parent']:
                topic_map[t['parent']]['children'].append(topic_map[t['id']])
            else:
                roots.append(topic_map[t['id']])
        return Response(roots)

⚡ Performance Note
This pattern fetches ALL topics in ONE SQL query, then builds the tree in Python memory. This is O(n) and extremely fast even with 1000+ topics. Never use recursive SQL queries or N+1 fetches for tree data.

 
6. Semantic Search — LLM-Powered
This is the crown jewel feature. When you search 'how does batching work', it finds pages about 'React automatic batching' even if that exact phrase is not in your query.

6.1 How It Works
•	When a page is saved, it gets split into chunks (~300 tokens each with 50 token overlap).
•	Each chunk is passed through sentence-transformers (all-MiniLM-L6-v2 model — runs 100% local, no API key needed).
•	The resulting 384-dimensional vector is stored in PostgreSQL using pgvector.
•	When you search, the query is also embedded, then we find the nearest vectors using cosine similarity.
•	Results are ranked by similarity score and returned with the matching chunk highlighted.

6.2 Embedding Pipeline
# apps/search/services.py
from sentence_transformers import SentenceTransformer
import numpy as np

# Load once at startup — do NOT load on every request!
model = SentenceTransformer('all-MiniLM-L6-v2')

def chunk_text(text: str, chunk_size=300, overlap=50) -> list[str]:
    '''Split text into overlapping chunks by word count.'''
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(' '.join(words[start:end]))
        start += chunk_size - overlap
    return chunks

def embed_page(page) -> None:
    '''Generate and store embeddings for a page.'''
    if not page.content_text:
        return
    # Delete old embeddings
    Embedding.objects.filter(page=page).delete()
    # Chunk and embed
    chunks = chunk_text(page.content_text)
    vectors = model.encode(chunks, batch_size=32, show_progress_bar=False)
    # Bulk create
    Embedding.objects.bulk_create([
        Embedding(page=page, chunk_text=c, chunk_index=i, vector=v.tolist())
        for i, (c, v) in enumerate(zip(chunks, vectors))
    ])

6.3 Semantic Search Query
# apps/search/views.py
from pgvector.django import CosineDistance

class SemanticSearchView(APIView):
    def post(self, request):
        query = request.data.get('query', '').strip()
        limit = int(request.data.get('limit', 8))
        if not query:
            return Response({'results': []})
        # Embed the query
        q_vec = model.encode([query])[0].tolist()
        # Find nearest neighbors
        results = (
            Embedding.objects
            .annotate(dist=CosineDistance('vector', q_vec))
            .filter(dist__lt=0.5)   # 0 = perfect match, 1 = opposite
            .select_related('page__topic')
            .order_by('dist')[:limit]
        )
        data = [{
            'page_id': str(r.page.id),
            'page_title': r.page.title,
            'topic': r.page.topic.name,
            'excerpt': r.chunk_text[:200],
            'score': round(1 - r.dist, 3),
        } for r in results]
        return Response({'results': data})

6.4 Fast Text Search (Instant — No Embeddings)
For the debounced text search while typing, use PostgreSQL full-text search — no embedding needed, results in <5ms.

# apps/search/views.py — text search
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

class TextSearchView(APIView):
    def get(self, request):
        q = request.GET.get('q', '').strip()
        if len(q) < 2:
            return Response({'results': []})
        vector = SearchVector('title', weight='A') + SearchVector('content_text', weight='B')
        query  = SearchQuery(q)
        results = (
            Page.objects
            .annotate(rank=SearchRank(vector, query))
            .filter(rank__gt=0.01)
            .select_related('topic')
            .order_by('-rank')[:8]
        )
        return Response({'results': [
            {'id': str(p.id), 'title': p.title, 'topic': p.topic.name,
             'excerpt': p.content_text[:150]}
            for p in results
        ]})

🔍 Search Strategy: Dual Mode
Text search fires on every keystroke (debounced 300ms). Semantic/AI search fires only when user clicks 'AI Search' button or presses Ctrl+Enter. This prevents slow embedding calls on every key press while still giving instant results.

 
7. React Frontend — Complete Setup
7.1 Vite + React Project Init
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Core dependencies
npm install @tanstack/react-query axios zustand
npm install react-router-dom
npm install @tiptap/react @tiptap/starter-kit
npm install @tiptap/extension-placeholder @tiptap/extension-image
npm install @tiptap/extension-code-block-lowlight lowlight
npm install @tiptap/extension-highlight @tiptap/extension-task-list
npm install @tiptap/extension-task-item @tiptap/extension-underline
npm install @tiptap/extension-link @tiptap/extension-typography
npm install @tiptap/extension-text-align

# UI
npm install tailwindcss @tailwindcss/vite
npm install lucide-react
npm install framer-motion
npm install sonner           # toast notifications
npm install cmdk             # command palette

7.2 React Router — Page Structure
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { TopicView } from './pages/TopicView'
import { PageView }  from './pages/PageView'
import { HomePage }  from './pages/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path='topic/:topicId' element={<TopicView />} />
          <Route path='page/:pageId'   element={<PageView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

7.3 Shell Layout (Sidebar + Content)
// src/components/layout/Shell.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { SearchPalette } from '../search/SearchPalette'

export function Shell() {
  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <Sidebar />
      <main className='flex-1 overflow-y-auto'>
        <Outlet />
      </main>
      <SearchPalette />
    </div>
  )
}

 
7.4 Sidebar — Tree Navigation (Full Implementation)
This is a direct evolution of EngKnow's SidebarTreeNode. Recursive, collapsible, with add-subtopic on hover.

// src/components/layout/Sidebar.tsx
import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useTopicTree } from '../../api/hooks/useTopics'
import { useSearchStore } from '../../store/searchStore'
import { ChevronDown, Plus, Search, FolderPlus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { AddTopicDialog } from '../dialogs/AddTopicDialog'
import { AnimatePresence, motion } from 'framer-motion'

export function Sidebar() {
  const { data: tree = [] } = useTopicTree()
  const { openSearch } = useSearchStore()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showAddRoot, setShowAddRoot] = useState(false)
  const location = useLocation()

  // Auto-expand ancestors of current page
  useEffect(() => {
    // Traversal logic: find all ancestor topic IDs for current URL
    // Same pattern as EngKnow's collectAncestorIds
  }, [location.pathname, tree])

  const toggle = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  return (
    <aside className='w-64 flex-shrink-0 border-r border-border flex flex-col h-full'>
      {/* Header */}
      <div className='h-12 flex items-center px-4 border-b border-border'>
        <span className='font-bold text-sm'>KnowBase</span>
      </div>
      {/* Search Button */}
      <button onClick={openSearch} className='mx-3 mt-2 px-3 py-2 rounded-md
        text-sm text-muted-foreground flex items-center gap-2 hover:bg-accent'>
        <Search className='w-4 h-4' />
        <span className='flex-1 text-left text-xs'>Search...</span>
        <kbd className='text-[10px] font-mono'>⌘K</kbd>
      </button>
      {/* Tree */}
      <div className='flex-1 overflow-y-auto py-2 px-2'>
        {tree.map(node => (
          <TreeNode key={node.id} node={node}
            expandedIds={expandedIds} onToggle={toggle} depth={0} />
        ))}
        <button onClick={() => setShowAddRoot(true)}
          className='mt-2 w-full flex items-center gap-2 px-3 py-1.5 text-xs
            text-muted-foreground hover:bg-accent rounded-md'>
          <FolderPlus className='w-3.5 h-3.5' /> Add Topic
        </button>
      </div>
      <AddTopicDialog open={showAddRoot} onClose={() => setShowAddRoot(false)} />
    </aside>
  )
}

TreeNode (Recursive)
function TreeNode({ node, expandedIds, onToggle, depth }) {
  const navigate  = useNavigate()
  const { pageId } = useParams()
  const [hovered, setHovered]     = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const isExpanded = expandedIds.has(node.id)
  const hasChildren = node.children?.length > 0
  const isActive = location.pathname.includes(node.id)
  const pl = 12 + depth * 14   // indent per level

  return (
    <div>
      <div
        style={{ paddingLeft: pl }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn('group flex items-center gap-1.5 py-1.5 pr-2 rounded-md
          cursor-pointer text-sm transition-colors',
          isActive ? 'bg-accent text-foreground font-medium'
                   : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
        onClick={() => navigate(`/topic/${node.id}`)}
      >
        {/* Expand toggle */}
        <button className={cn('w-4 h-4 flex items-center justify-center rounded transition-transform', !hasChildren && 'opacity-0 pointer-events-none')}
          onClick={e => { e.stopPropagation(); onToggle(node.id) }}>
          <ChevronDown className={cn('w-3 h-3 transition-transform',
            !isExpanded && '-rotate-90')} />
        </button>
        <span>{node.icon}</span>
        <span className='truncate flex-1 text-xs'>{node.name}</span>
        {/* Add subtopic (hover only) */}
        {hovered && (
          <button className='opacity-0 group-hover:opacity-100 p-0.5 rounded
            hover:bg-muted' onClick={e => { e.stopPropagation(); setShowAddChild(true) }}>
            <Plus className='w-3 h-3' />
          </button>
        )}
      </div>
      {/* Children */}
      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
            exit={{height:0,opacity:0}} transition={{duration:0.18}}>
            {node.children.map(child => (
              <TreeNode key={child.id} node={child} expandedIds={expandedIds}
                onToggle={onToggle} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AddTopicDialog open={showAddChild} onClose={() => setShowAddChild(false)}
        parentId={node.id} />
    </div>
  )
}

 
8. TipTap Editor — Rich Content
The editor is the heart of KnowBase. It must feel like Notion: block-based, smooth, with image upload and code blocks.

8.1 Editor Component
// src/components/editor/PageEditor.tsx
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

const lowlight = createLowlight(common)

export function PageEditor({ page, onSave }) {
  const [title, setTitle]   = useState(page.title)
  const [mode, setMode]     = useState<'read'|'edit'>('read')
  const [dirty, setDirty]   = useState(false)
  const saveRef = useRef<ReturnType<typeof setTimeout>>()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      TaskList, TaskItem.configure({ nested: true }),
      Highlight, Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: page.content_json,
    editable: mode === 'edit',
    onUpdate: ({ editor }) => {
      setDirty(true)
      // Auto-save after 1.5s of inactivity (debounced)
      clearTimeout(saveRef.current)
      saveRef.current = setTimeout(() => {
        onSave({
          content_json: editor.getJSON(),
          content_text: editor.getText(),
        })
        setDirty(false)
      }, 1500)
    },
  })

  return (
    <div className='max-w-3xl mx-auto px-6 py-8'>
      {/* Title */}
      <input value={title} onChange={e => setTitle(e.target.value)}
        className='w-full text-4xl font-bold bg-transparent outline-none mb-6
          placeholder:text-muted-foreground'
        placeholder='Untitled...' readOnly={mode === 'read'} />
      {/* Toolbar (edit mode only) */}
      {mode === 'edit' && editor && <EditorToolbar editor={editor} />}
      {/* Content */}
      <EditorContent editor={editor} className='prose dark:prose-invert max-w-none' />
    </div>
  )
}

8.2 Auto-save Strategy
💾 Auto-save Architecture
1. User types → onUpdate fires → sets dirty=true → debounce timer starts (1500ms). 2. If user keeps typing → timer resets. 3. After 1500ms silence → PATCH /api/pages/:id/ called with TipTap JSON. 4. After save success → call /api/search/index/:pageId/ to re-embed. This means search is always up-to-date within ~2 seconds of typing.

8.3 Image Upload to Django
// Image upload handler
async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('image', file)
  const res  = await axios.post('/api/pages/upload-image/', form)
  return res.data.url   // Returns Django media URL
}

// In editor: paste/drop image → upload → insert
editor.on('create', () => {
  editor.view.dom.addEventListener('paste', async (e) => {
    const file = e.clipboardData?.files[0]
    if (file?.type.startsWith('image/')) {
      const url = await uploadImage(file)
      editor.commands.setImage({ src: url })
    }
  })
})

 
9. Search Palette — Cmd+K
The search palette is a full-screen modal triggered by Cmd+K. It has two modes: instant text search (debounced) and AI semantic search.

// src/components/search/SearchPalette.tsx
import { Command } from 'cmdk'
import { useSearchStore } from '../../store/searchStore'
import { useTextSearch, useSemanticSearch } from '../../api/hooks/useSearch'

export function SearchPalette() {
  const { isOpen, close } = useSearchStore()
  const [query, setQuery]   = useState('')
  const [mode, setMode]     = useState<'text'|'ai'>('text')

  // Debounced text search — instant, fires on typing
  const debouncedQuery = useDebounce(query, 300)
  const { data: textResults } = useTextSearch(debouncedQuery, mode === 'text')

  // AI search — only fires when user explicitly requests
  const { mutate: aiSearch, data: aiResults, isPending } = useSemanticSearch()

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
      onClick={close}>
      <div className='mx-auto mt-[15vh] w-full max-w-xl bg-background
        rounded-xl shadow-2xl border border-border'
        onClick={e => e.stopPropagation()}>
        <Command>
          <div className='flex items-center border-b border-border px-3'>
            <Search className='w-4 h-4 text-muted-foreground' />
            <Command.Input value={query} onValueChange={setQuery}
              placeholder='Search your knowledge base...'
              className='flex-1 bg-transparent py-3 px-2 text-sm outline-none
                placeholder:text-muted-foreground' />
            <div className='flex gap-1'>
              <button onClick={() => setMode('text')}
                className={cn('px-2 py-1 text-xs rounded', mode==='text' && 'bg-accent')}>
                Text
              </button>
              <button onClick={() => { setMode('ai'); aiSearch(query) }}
                className={cn('px-2 py-1 text-xs rounded', mode==='ai' && 'bg-accent')}>
                ✨ AI
              </button>
            </div>
          </div>
          <Command.List className='max-h-80 overflow-y-auto p-2'>
            {isPending && <Command.Loading>Searching...</Command.Loading>}
            {(mode === 'text' ? textResults : aiResults)?.map(r => (
              <Command.Item key={r.id} value={r.title}
                onSelect={() => { navigate(`/page/${r.id}`); close() }}
                className='px-3 py-2 rounded-md cursor-pointer hover:bg-accent text-sm'>
                <div className='font-medium'>{r.title}</div>
                <div className='text-xs text-muted-foreground'>{r.topic}</div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}

 
10. Export — DOCX + PDF from Django
One-click export of any page or entire topic as a professional Word document or PDF.

10.1 DOCX Export (python-docx)
# apps/export/views.py
from docx import Document as DocxDocument
from docx.shared import Inches, Pt
from django.http import HttpResponse
import json

class ExportPageDocxView(APIView):
    def get(self, request, page_id):
        page = get_object_or_404(Page, id=page_id)
        doc  = DocxDocument()
        # Title
        doc.add_heading(page.title, level=0)
        # Parse TipTap JSON and convert to docx paragraphs
        content = page.content_json
        tiptap_to_docx(doc, content)
        # Return as file download
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        filename = page.title.replace(' ', '_')
        response['Content-Disposition'] = f'attachment; filename="{filename}.docx"'
        doc.save(response)
        return response

def tiptap_to_docx(doc, content):
    '''Walk TipTap JSON and add paragraphs to python-docx Document.'''
    for node in content.get('content', []):
        t = node.get('type')
        if t == 'heading':
            level = node['attrs'].get('level', 1)
            text  = extract_text(node)
            doc.add_heading(text, level=level)
        elif t == 'paragraph':
            text = extract_text(node)
            if text:
                doc.add_paragraph(text)
        elif t == 'bulletList':
            for item in node.get('content', []):
                doc.add_paragraph(extract_text(item), style='List Bullet')
        elif t == 'orderedList':
            for item in node.get('content', []):
                doc.add_paragraph(extract_text(item), style='List Number')
        elif t == 'codeBlock':
            p = doc.add_paragraph()
            p.style = 'No Spacing'
            run = p.add_run(extract_text(node))
            run.font.name = 'Courier New'
            run.font.size = Pt(9)

10.2 Export Button in Frontend
// src/components/editor/ExportMenu.tsx
export function ExportMenu({ pageId }) {
  const downloadDocx = () => {
    window.location.href = `http://localhost:8000/api/export/page/${pageId}/docx/`
  }
  const downloadPdf = () => {
    window.location.href = `http://localhost:8000/api/export/page/${pageId}/pdf/`
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Export ↓</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={downloadDocx}>Download .docx</DropdownMenuItem>
        <DropdownMenuItem onClick={downloadPdf}>Download .pdf</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

 
11. Dark / Light Theme
Use Tailwind's class-based dark mode. One toggle button changes the class on <html> and everything adapts via CSS variables.

// tailwind.config.ts
export default {
  darkMode: 'class',   // not 'media' — we control it manually
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        accent: 'hsl(var(--accent))',
        muted: { DEFAULT: 'hsl(var(--muted))',
                 foreground: 'hsl(var(--muted-foreground))' },
      }
    }
  }
}

/* src/index.css — CSS variables for both themes */
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --border: 214 32% 91%;
  --accent: 210 40% 96%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
}
.dark {
  --background: 222 47% 6%;
  --foreground: 210 40% 98%;
  --border: 217 33% 17%;
  --accent: 217 33% 15%;
  --muted: 217 33% 15%;
  --muted-foreground: 215 20% 65%;
}

// Theme toggle in Zustand
const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'light',
  toggle: () => set(s => {
    const next = s.theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
    return { theme: next }
  })
})

 
12. API Hooks — React Query
All API calls go through React Query hooks. This gives you automatic caching, background refresh, loading states, and optimistic updates for free.

// src/api/client.ts
import axios from 'axios'
export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' }
})

// src/api/hooks/useTopics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'

export const useTopicTree = () =>
  useQuery({
    queryKey: ['topics', 'tree'],
    queryFn: () => api.get('/topics/tree/').then(r => r.data),
    staleTime: 60_000,   // Don't re-fetch for 1 minute
  })

export const useCreateTopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/topics/', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics', 'tree'] }),
  })
}

// src/api/hooks/usePages.ts
export const usePage = (pageId: string) =>
  useQuery({
    queryKey: ['pages', pageId],
    queryFn: () => api.get(`/pages/${pageId}/`).then(r => r.data),
    enabled: !!pageId,
  })

export const useUpdatePage = (pageId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.patch(`/pages/${pageId}/`, data).then(r => r.data),
    onSuccess: (data) => {
      qc.setQueryData(['pages', pageId], data)  // Optimistic update
      // Re-index embeddings after save
      api.post(`/search/index/${pageId}/`)
    },
  })
}
