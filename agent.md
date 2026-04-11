# KnowBase — Agent Reference

> This file is the single source of truth for Codex and any AI agent working on this project.
> Read it fully before touching any file. The architecture described here is the **target state**.
> The Django backend that appears in `backend/` is dead — it is not deployed, not used, and will not be.

---

## 1. What KnowBase Is

KnowBase is a personal knowledge base — a Notion-like app where you organise notes into a tree of topics and sub-topics. Each topic holds pages. Pages have rich content authored in TipTap (block-based editor). You can export any page to DOCX or PDF, and search all your content with full-text search.

It is a **personal tool**, single-user, deployed to Vercel (frontend) and Supabase (database). There is no authentication layer. There is no backend server. There is no Railway.

---

## 2. Tech Stack — What Is Actually Used

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Pure client SPA. `frontend/` directory. |
| Styling | TailwindCSS + shadcn/ui conventions | Dark/light theme via CSS variables. |
| Rich Editor | TipTap 2 | Block-based editor. Content stored as TipTap JSON in Supabase. |
| State | Zustand | `uiStore` (theme, search open/closed), `pageShortcutStore` (save/edit mode). |
| Server state | TanStack React Query | All Supabase calls go through React Query for caching and loading states. |
| Database | Supabase (PostgreSQL) | Direct from browser via `@supabase/supabase-js`. No ORM, no Django. |
| Search | Supabase full-text search | PostgreSQL GIN index on `title + content_text`. Auto-indexes on every row update. |
| Export | `docx` npm + `jsPDF` | Browser-side generation. No server endpoint. Files download directly. |
| Routing | React Router v6 | `/`, `/topic/:topicId`, `/page/:pageId`. |
| HTTP | Supabase JS client only | Axios is removed. The old `api` axios instance is gone. |
| Hosting | Vercel | Static Vite build. `vercel.json` handles React Router rewrites. |

**Packages installed in `frontend/`:**

```
@supabase/supabase-js   — database client
@tanstack/react-query   — server state
@tiptap/react + extensions — rich editor
zustand                 — client state
react-router-dom        — routing
framer-motion           — sidebar animations
lucide-react            — icons
sonner                  — toast notifications
@dnd-kit/core + sortable — drag-to-reorder topics in sidebar
docx                    — browser-side DOCX generation
jspdf                   — browser-side PDF generation
slugify                 — client-side slug generation for new topics
tailwindcss             — styling
```

---

## 3. Project Structure — What Actually Exists

```
knowbase/
├── agent.md                        ← This file. Read before coding.
├── vercel.json                     ← React Router rewrite rules. Do not edit.
├── backend/                        ← DEAD. Do not touch. Do not deploy.
└── frontend/
    ├── index.html                  ← Loads Inter + JetBrains Mono from Google Fonts
    ├── package.json
    ├── tailwind.config.ts
    ├── .env.example                ← VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
    ├── .env.local                  ← Real keys. Git-ignored. Never commit.
    └── src/
        ├── App.tsx                 ← Router setup. Three routes: /, /topic/:id, /page/:id
        ├── main.tsx                ← React root. QueryClientProvider wraps App.
        ├── index.css               ← CSS variables for both themes. Inter font. Typography.
        ├── api/
        │   └── client.ts           ← Exports `supabase` (Supabase client). Nothing else.
        ├── lib/
        │   ├── db.ts               ← ALL database operations. Every component imports from here.
        │   └── exportPage.ts       ← exportPageAsDocx() and exportPageAsPdf(). Browser-only.
        ├── components/
        │   ├── layout/
        │   │   ├── Shell.tsx       ← Sidebar + <Outlet>. Mobile top-padding fix applied.
        │   │   └── Sidebar.tsx     ← Collapsible topic tree. Mobile drawer. DnD reorder.
        │   ├── editor/
        │   │   └── PageEditor.tsx  ← TipTap editor. Read/edit modes. Auto-save 1500ms debounce.
        │   ├── dialogs/
        │   │   └── AddTopicDialog.tsx
        │   └── search/
        │       └── SearchPalette.tsx  ← Cmd+K modal. Calls searchPages() from db.ts.
        ├── hooks/
        │   └── useGlobalShortcuts.ts  ← Cmd+K, Cmd+S, Cmd+E, Cmd+D, [, ] navigation.
        ├── pages/
        │   ├── HomePage.tsx        ← Dashboard. Greeting, stats, recent pages.
        │   ├── TopicView.tsx       ← Topic detail. Subtopics grid. Pages list. Create dialogs.
        │   └── PageView.tsx        ← Loads page, renders PageEditor, handles save.
        ├── store/
        │   ├── uiStore.ts          ← theme, searchOpen, shortcutHelpOpen
        │   └── pageShortcutStore.ts ← save/edit mode actions registered by PageEditor
        ├── types/
        │   └── index.ts            ← Topic, Page, SearchResult, TopicSummary types
        └── utils/
            ├── cn.ts               ← Tailwind className merger
            └── topicTree.ts        ← findTopicSiblings, getSiblingTopics, reorderSiblingTopics
```

---

## 4. Environment Variables

The only two variables the app needs. Set both in `.env.local` locally and in the Vercel dashboard for production.

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These are read in `src/api/client.ts` as `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.

---

## 5. Supabase Database Schema

Run this SQL once in the Supabase SQL Editor. This is the complete schema — do not modify it without also updating the types in `src/types/index.ts`.

```sql
create extension if not exists "pgcrypto";

-- Topics: the sidebar tree. Unlimited nesting via self-FK.
create table topics (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  icon        text not null default '📁',
  color       text not null default '',
  description text not null default '',
  parent_id   uuid references topics(id) on delete cascade,
  sort_order  int not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Pages: content nodes that belong to a topic.
create table pages (
  id            uuid primary key default gen_random_uuid(),
  topic_id      uuid not null references topics(id) on delete cascade,
  title         text not null,
  content_json  jsonb not null default '{}'::jsonb,
  content_text  text not null default '',
  sort_order    int not null default 0,
  is_pinned     boolean not null default false,
  word_count    int not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Full-text search index. Auto-updated on every row write.
create index pages_fts on pages
  using gin(to_tsvector('english', title || ' ' || content_text));

-- Auto-update updated_at on every change.
create or replace function touch_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;

create trigger topics_touch before update on topics
  for each row execute procedure touch_updated_at();
create trigger pages_touch before update on pages
  for each row execute procedure touch_updated_at();

-- Row Level Security: open access (personal tool, no auth).
alter table topics enable row level security;
alter table pages  enable row level security;
create policy "open topics" on topics for all using (true) with check (true);
create policy "open pages"  on pages  for all using (true) with check (true);
```

---

## 6. The Data Layer — `src/lib/db.ts`

**This file is the only place database calls happen.** No component calls `supabase` directly. Every component imports a named function from here. This makes the data layer easy to audit and test.

The complete list of functions this file must export:

### Topics

```typescript
// Returns the full nested tree. Fetches all rows in one query,
// builds the tree in-memory (no N+1). Root topics have parent_id = null.
getTopicTree(): Promise<Topic[]>

// Returns one topic with .children populated and .parent_topic name/id populated.
getTopic(id: string): Promise<Topic>

// Slugifies the name client-side. Inserts and returns the new row.
createTopic(data: { name: string; icon: string; color: string; description: string; parent_id?: string | null }): Promise<Topic>

// Updates and returns the updated row.
updateTopic(id: string, data: Partial<Topic>): Promise<Topic>

deleteTopic(id: string): Promise<void>

// For each orderedIds[i], sets sort_order = i. Runs all updates in parallel.
reorderTopics(parentId: string | null, orderedIds: string[]): Promise<void>
```

### Pages

```typescript
// All pages for a topic, ordered by sort_order then created_at.
getPagesByTopic(topicId: string): Promise<Page[]>

// Single page. Joins topic name so page.topic_name is populated.
getPage(id: string): Promise<Page>

// Creates with empty content_json. Returns inserted row.
createPage(data: { topic_id: string; title: string }): Promise<Page>

// Updates. Always sets updated_at = new Date().toISOString() in the payload.
updatePage(id: string, data: Partial<Page>): Promise<Page>

deletePage(id: string): Promise<void>

// Most recently updated pages. Joins topic name. Default limit 6.
getRecentPages(limit?: number): Promise<Page[]>
```

### Search

```typescript
// Uses Supabase .textSearch() with websearch type on content_text.
// Maps results to SearchResult[]: { id, page_id, title, topic, excerpt }.
// excerpt = first 200 chars of content_text.
searchPages(query: string): Promise<SearchResult[]>
```

**Error handling rule:** Every function must check if Supabase returned an error and throw it. Never silently swallow errors.

```typescript
const { data, error } = await supabase.from('topics').select('*')
if (error) throw error
return data
```

---

## 7. TypeScript Types — `src/types/index.ts`

These types are the contract between the database schema and the UI. Do not add or remove fields without updating the Supabase schema too.

```typescript
export type TopicSummary = {
  id: string
  name: string
  icon: string
  page_count?: number
}

export type Topic = {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  description: string
  parent_id?: string | null
  parent_topic?: TopicSummary | null
  children?: Array<Topic | TopicSummary>
  page_count?: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type Page = {
  id: string
  topic_id: string
  topic_name?: string
  title: string
  content_json: Record<string, unknown>   // TipTap JSON
  content_text: string                    // Plain text for search
  sort_order: number
  is_pinned: boolean
  word_count: number
  created_at: string
  updated_at: string
}

export type SearchResult = {
  id: string
  page_id?: string
  title: string
  topic: string
  excerpt: string
  score?: number
}
```

---

## 8. Component Responsibilities

### `src/api/client.ts`
Exports only the Supabase client. Nothing else lives here.

```typescript
import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
export const supabase = createClient(url, key)
```

---

### `src/components/layout/Sidebar.tsx`
The left navigation. Key behaviours:

- Fetches the topic tree with `queryKey: ['topics', 'tree']` calling `getTopicTree()`.
- On desktop: fixed `w-64` sidebar. On mobile: hidden, hamburger button appears, tapping opens a slide-in drawer (`framer-motion` `AnimatePresence`).
- Topics are drag-to-reorder using `@dnd-kit`. On drag end, calls `reorderTopics(parentId, orderedIds)`. Uses optimistic update so the UI moves instantly.
- On load, only expands ancestor topics of the currently active route (not all topics). The expansion algorithm walks the tree to find ancestors of the current `topicId` or `pageId`.
- Each node shows an add-child button (+ icon) on hover.
- Theme toggle (sun/moon) and search button (⌘K) are in the sidebar header.

**Mutations the Sidebar owns:**
- `reorderTopics` — drag end
- `deleteTopic` — if a delete action exists in the tree node context menu

---

### `src/pages/TopicView.tsx`
Shown at `/topic/:topicId`. Key behaviours:

- Fetches the topic with `getTopic(topicId)` → `queryKey: ['topics', topicId]`
- Fetches pages with `getPagesByTopic(topicId)` → `queryKey: ['pages', 'topic', topicId]`
- Displays breadcrumbs: Home > Parent > Current.
- Shows a grid of sub-topics (from `topic.children`), each with page count.
- Shows a list of pages sorted by: pinned first, then by `updated_at` descending.
- "New Page" button opens `NewPageDialog` → calls `createPage({ topic_id, title })` → navigates to the new page.
- "New Subtopic" button opens `AddTopicDialog` → calls `createTopic({ name, icon, color, description, parent_id: topicId })` → invalidates tree query.

---

### `src/pages/PageView.tsx`
Shown at `/page/:pageId`. Key behaviours:

- Fetches the page with `getPage(pageId)` → `queryKey: ['pages', pageId]`.
- Renders `<PageEditor page={page} onSave={handleSave} />`.
- `handleSave` calls `updatePage(pageId, data)`, sets the query data directly on success, and invalidates `['pages', 'topic', updatedPage.topic_id]` so the topic's page list refreshes.
- There is **no** `/search/index/` call after save. Supabase auto-indexes via the GIN trigger.

---

### `src/components/editor/PageEditor.tsx`
The TipTap editor. Key behaviours:

- Two modes: `'read'` (rendered view) and `'edit'` (editable TipTap). Toggle with the edit button or `Cmd+E`.
- `onUpdate` fires on every keystroke. It sets a `dirty` flag and resets a 1500ms debounce timer. After 1500ms of silence it calls `onSave({ content_json, content_text, word_count })`.
- Images are stored as base64 data URIs inside `content_json`. No server upload endpoint. This means images survive deploys.
- Export buttons call `exportPageAsDocx()` and `exportPageAsPdf()` from `src/lib/exportPage.ts`. These are browser-side — no backend URL, no `fetch`, no `window.location.href` to any API.
- The editor registers its save/toggleMode/isDirty actions in `pageShortcutStore` on mount and clears them on unmount.

---

### `src/pages/HomePage.tsx`
The `/` route. Key behaviours:

- Fetches topic tree with `getTopicTree()` → counts total topics for the stats row.
- Fetches recent pages with `getRecentPages(6)` → shows the 6 most recently updated pages as quick-access cards.
- Shows greeting ("Good morning", "Good afternoon", "Good evening") based on current hour.
- Empty state with a "Create your first topic" CTA when both lists are empty.

---

### `src/hooks/useGlobalShortcuts.ts`
Attached to the `Shell`. Listens for:

- `Cmd+K` → `openSearch()`
- `Cmd+S` → `pageActions.save()` if dirty
- `Cmd+E` → `pageActions.toggleMode()`
- `Cmd+D` → `toggleTheme()`
- `[` / `]` → navigate to previous/next sibling topic
- `Escape` → close search or shortcut help overlay

Fetches the topic tree and current page from React Query cache (same query keys as other components — no extra network calls because React Query deduplicates).

---

### `src/lib/exportPage.ts`
Two functions. Both are synchronous or return a Promise. Neither calls a server.

```typescript
// Generates a .docx file in the browser and triggers a download.
exportPageAsDocx(page: { title: string; content_text: string }): Promise<void>

// Generates a .pdf file in the browser and triggers a download.
exportPageAsPdf(page: { title: string; content_text: string }): void
```

The DOCX function uses the `docx` npm package. It creates a Document with the title as Heading 1 and the `content_text` split by newline as body paragraphs. It calls `Packer.toBlob(doc)`, creates an object URL, clicks a hidden `<a>` element, and revokes the URL.

The PDF function uses `jsPDF`. It sets font sizes, splits text to fit the page width, and calls `doc.save()`.

---

## 9. React Query Key Conventions

Consistent query keys are critical. Any component that invalidates a key must use exactly this format.

| Data | Query Key |
|---|---|
| Full topic tree | `['topics', 'tree']` |
| Single topic | `['topics', topicId]` |
| Pages for a topic | `['pages', 'topic', topicId]` |
| Single page | `['pages', pageId]` |
| Recent pages | `['pages', 'recent']` |
| Search results | `['search', query]` |

When a page is saved, invalidate `['pages', 'topic', topicId]`.
When a topic is created or reordered, invalidate `['topics', 'tree']`.
When a topic is updated, invalidate `['topics', 'tree']` and `['topics', topicId]`.

---

## 10. Routing — `vercel.json`

The `vercel.json` in the project root must contain this rewrite so that React Router routes do not 404 on page reload in production:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Do not add headers, redirects, or other Vercel config without confirming they do not conflict with this rewrite.

---

## 11. What the `backend/` Directory Contains (For Context Only)

The `backend/` directory contains a Django 5 + DRF project that was the original architecture. It has apps for `topics`, `pages`, `search`, and `export`. It has a `requirements.txt`, `Procfile`, and `settings.py` wired for Railway + Supabase PostgreSQL.

**None of this runs. None of this is deployed. None of this is referenced by the frontend.**

The backend directory can stay in the repo as a historical artefact. Codex should never modify it, never add to it, and never write frontend code that calls any URL served by it.

The only deployment targets are:
- **Frontend → Vercel** (Vite static build, root directory = `frontend/`)
- **Database → Supabase** (direct from browser via `@supabase/supabase-js`)

---

## 12. Known Bugs Fixed (From `KnowBase_Changes.zip`)

These bugs are already fixed in the current codebase. Do not reintroduce them.

**Sidebar expand bug** — The original `useEffect` added every node-with-children to `expandedIds` on load, so the entire tree opened at once. The fix: only expand ancestors of the currently active route.

**Font inconsistency** — The original CSS used `Segoe UI` (Windows-only). Fixed: Inter loaded from Google Fonts in `index.html`.

**`@tailwindcss/typography` missing** — The `prose` classes on the editor did nothing because the plugin was not installed. Fixed: added to `package.json` and `@plugin` in `index.css`.

**No mobile sidebar** — The original sidebar had no mobile breakpoint. Fixed: `hidden md:flex` on desktop, hamburger button + slide-in drawer on mobile.

**No `vercel.json`** — React Router routes returned 404 on direct URL access in production. Fixed: `vercel.json` with the catch-all rewrite.

**Images lost on deploy** — The original code uploaded images to Django's local disk (`MEDIA_ROOT`), which resets on every Railway deploy. Fixed: images stored as base64 data URIs inside `content_json`.

**Export buttons broken in production** — The export buttons called `http://localhost:8000/api/export/...` hardcoded. Fixed: export is now browser-side using `docx` and `jsPDF`.

---

## 13. Deployment Checklist

Before deploying to Vercel, confirm all of the following:

- `frontend/.env.local` has real `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.
- The Supabase SQL schema (Section 5) has been run and both tables exist.
- Row Level Security policies are enabled and set to open access.
- `vercel.json` is in the **project root** (not inside `frontend/`).
- Vercel project is configured with Root Directory = `frontend`, Framework = Vite.
- Both env vars are added in Vercel's dashboard under Settings → Environment Variables.
- `npm run build` succeeds locally without TypeScript errors.

---

## 14. Rules for Codex

These rules apply to every change made to this codebase.

1. **Never call the backend.** No `fetch`, no `axios`, no `api.get()`, no URL pointing to `localhost:8000` or any Railway domain.

2. **Never import `api` from `src/api/client.ts`.** That file exports only `supabase`. Any import of `api` is a bug from the old architecture.

3. **Never call `supabase` directly from a component.** All database calls go through functions in `src/lib/db.ts`.

4. **Never write a server-side export endpoint.** Export is browser-side. Use `exportPageAsDocx` and `exportPageAsPdf` from `src/lib/exportPage.ts`.

5. **Never add a `/search/index/` call.** Supabase indexes content automatically on every `pages` row update via the GIN index.

6. **Always use the correct React Query key** from the convention table in Section 9.

7. **Always throw Supabase errors** in `db.ts` functions rather than silently returning null.

8. **Keep the `backend/` directory untouched.** It is read-only history.