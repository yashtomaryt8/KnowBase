import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, FilePlus2, FolderPlus, Pin, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AddTopicDialog } from '../components/dialogs/AddTopicDialog'
import { exportTopicAsDocx, exportTopicAsPdf } from '../lib/exportPage'
import { createPage, deleteTopic, getPagesByTopic, getTopic, getTopicTree } from '../lib/db'
import type { Page, Topic, TopicSummary } from '../types'
import { TopicIcon } from '../utils/topicIcons'

// ── Full-depth recursive page collector ────────────────────────────────────
//
// Strategy:
//  1. Synchronously flatten the full in-memory subtree (from getTopicTree)
//     into a list of { id, label } pairs using DFS — no network needed.
//  2. Batch-fetch pages for all those topic IDs in groups of 10 at a time.
//     This is controlled and won't overwhelm Supabase even with 300+ topics.

interface PageGroup {
  label: string  // full breadcrumb, e.g. "React › Hooks › useEffect"
  pages: Page[]
}

interface SubtreeEntry {
  id:    string
  label: string
}

/** Find a node anywhere in the tree by ID (DFS) */
function findSubtree(nodes: Topic[], id: string): Topic | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findSubtree((n.children ?? []) as Topic[], id)
    if (found) return found
  }
  return null
}

/** Synchronous DFS — returns a flat ordered list of { id, label } */
function flattenSubtree(node: Topic, breadcrumb: string[]): SubtreeEntry[] {
  const label = breadcrumb.join(' › ')
  const entries: SubtreeEntry[] = [{ id: node.id, label }]
  for (const child of (node.children ?? []) as Topic[]) {
    entries.push(...flattenSubtree(child, [...breadcrumb, child.name]))
  }
  return entries
}

/** Fetch pages for a batch of topic IDs concurrently */
async function fetchBatch(entries: SubtreeEntry[]): Promise<PageGroup[]> {
  const settled = await Promise.allSettled(
    entries.map(async (e) => {
      const pages = await getPagesByTopic(e.id)
      return { label: e.label, pages }
    }),
  )
  return settled
    .filter(
      (r): r is PromiseFulfilledResult<PageGroup> =>
        r.status === 'fulfilled' && r.value.pages.length > 0,
    )
    .map((r) => r.value)
}

/**
 * Collect ALL pages from the entire subtree rooted at `rootId`.
 * Walks every depth level — parent → children → grandchildren → … → leaves.
 * Pages are returned in DFS order, grouped by topic with full breadcrumb labels.
 * Fetches are batched 10 at a time to stay within Supabase connection limits.
 */
async function collectDeepPages(rootId: string, rootName: string): Promise<PageGroup[]> {
  const BATCH = 10

  // Step 1: get full tree structure once (cheap — uses React Query cache)
  const fullTree = await getTopicTree()
  const rootNode = findSubtree(fullTree as Topic[], rootId)
  if (!rootNode) return []

  // Step 2: flatten entire subtree into ordered DFS list
  const entries = flattenSubtree(rootNode, [rootName])

  // Step 3: fetch pages in batches of BATCH
  const results: PageGroup[] = []
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH)
    const groups = await fetchBatch(batch)
    results.push(...groups)
  }
  return results
}

export function TopicView() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [pageDialogOpen, setPageDialogOpen] = useState(false)
  const [subtopicDialogOpen, setSubtopicDialogOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const deleteTopicMutation = useMutation({
    mutationFn: () => deleteTopic(topicId!),
    onSuccess: () => {
      toast.success('Topic deleted')
      void queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
      navigate('/')
    },
    onError: () => {
      toast.error('Could not delete topic')
    },
  })

  const { data: topic, isLoading: topicLoading } = useQuery<Topic>({
    enabled: Boolean(topicId),
    queryKey: ['topics', topicId],
    queryFn: () => getTopic(topicId!),
  })

  const { data: pages = [], isLoading: pagesLoading } = useQuery<Page[]>({
    enabled: Boolean(topicId),
    queryKey: ['pages', 'topic', topicId],
    queryFn: () => getPagesByTopic(topicId!),
  })

  const orderedPages = useMemo(
    () =>
      [...pages].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }),
    [pages],
  )

  const handleExportDocx = async () => {
    if (!topic) return
    setIsExporting(true)
    setExportMenuOpen(false)
    try {
      // Walk the FULL hierarchy recursively — every level, every leaf
      const groups = await collectDeepPages(topic.id, topic.name)

      // Flatten groups into the page list, inserting a groupLabel on the first
      // page of each group so the exporter can emit section headings.
      const allPages = groups.flatMap((g) =>
        g.pages.map((p, i) => ({
          title:        p.title,
          content_json: p.content_json as Record<string, unknown> | undefined,
          content_text: p.content_text,
          groupLabel:   i === 0 ? g.label : undefined,
        })),
      )

      if (allPages.length === 0) {
        toast.error('No pages found in this topic or any of its children')
        return
      }

      await exportTopicAsDocx({
        topic:     { name: topic.name, description: topic.description ?? undefined },
        subtopics: subtopics.map((s) => ({ name: s.name })),
        pages:     allPages,
      })
      toast.success(`Exported ${allPages.length} pages as DOCX`)
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPdf = async () => {
    if (!topic) return
    setIsExporting(true)
    setExportMenuOpen(false)
    try {
      const groups = await collectDeepPages(topic.id, topic.name)

      const allPages = groups.flatMap((g) =>
        g.pages.map((p, i) => ({
          title:        p.title,
          content_json: p.content_json as Record<string, unknown> | undefined,
          content_text: p.content_text,
          groupLabel:   i === 0 ? g.label : undefined,
        })),
      )

      if (allPages.length === 0) {
        toast.error('No pages found in this topic or any of its children')
        return
      }

      exportTopicAsPdf({
        topic:     { name: topic.name, description: topic.description ?? undefined },
        subtopics: subtopics.map((s) => ({ name: s.name })),
        pages:     allPages,
      })
      toast.success(`Exported ${allPages.length} pages as PDF`)
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  if (!topicId) return null
  if (topicLoading || pagesLoading) return <TopicViewSkeleton />

  if (!topic) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-2xl border border-border/70 bg-background/80 p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold">Topic not found</h2>
        </div>
      </section>
    )
  }

  const subtopics = (topic.children ?? []) as TopicSummary[]
  const isEmpty = !subtopics.length && !orderedPages.length

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <button className="transition hover:text-foreground" onClick={() => navigate('/')} type="button">
            Home
          </button>
          {topic.parent_topic ? (
            <>
              <span className="opacity-40">/</span>
              <button
                className="transition hover:text-foreground"
                onClick={() => navigate(`/topic/${topic.parent_topic?.id}`)}
                type="button"
              >
                {topic.parent_topic.name}
              </button>
            </>
          ) : null}
          <span className="opacity-40">/</span>
          <span className="font-medium text-foreground">{topic.name}</span>
        </div>

        {/* Topic header card */}
        <div className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm sm:p-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border/70 shadow-sm"
              style={{ backgroundColor: `${topic.color || '#EAD9CC'}1f` }}
            >
              <TopicIcon className="h-10 w-10" icon={topic.icon} />
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-reading)' }}>
                {topic.name}
              </h1>
              {topic.description ? (
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {topic.description}
                </p>
              ) : null}
              <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                <span>{orderedPages.length} pages</span>
                {subtopics.length > 0 ? (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{subtopics.length} subtopics</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Delete */}
            <button
              className="flex items-center gap-1.5 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
              onClick={() => {
                if (window.confirm('Delete this topic and all its contents?')) {
                  deleteTopicMutation.mutate()
                }
              }}
              disabled={deleteTopicMutation.isPending}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            {/* Export topic */}
            <div className="relative">
              <button
                className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm transition hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setExportMenuOpen((v) => !v)}
                disabled={isExporting || (orderedPages.length === 0 && subtopics.length === 0)}
                title={orderedPages.length === 0 && subtopics.length === 0 ? 'Add pages or subtopics first' : undefined}
                type="button"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{isExporting ? 'Exporting…' : 'Export All'}</span>
              </button>

              {exportMenuOpen ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-border bg-background p-2 shadow-2xl">
                    <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Export {orderedPages.length + (subtopics.length > 0 ? ` + ${subtopics.length} subtopics` : '')} pages
                  </div>
                    <button
                      className="block w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-accent"
                      onClick={() => void handleExportDocx()}
                      type="button"
                    >
                      📄 Download .docx
                    </button>
                    <button
                      className="block w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-accent"
                      onClick={() => void handleExportPdf()}
                      type="button"
                    >
                      📑 Download .pdf
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            {/* New page */}
            <button
              className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-85"
              onClick={() => setPageDialogOpen(true)}
              type="button"
            >
              <FilePlus2 className="h-4 w-4" />
              New Page
            </button>

            {/* New subtopic */}
            <button
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm transition hover:bg-accent"
              onClick={() => setSubtopicDialogOpen(true)}
              type="button"
            >
              <FolderPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Subtopic</span>
            </button>
          </div>
        </div>

        {/* Subtopics grid */}
        {subtopics.length ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Subtopics</h2>
              <span className="text-sm text-muted-foreground">{subtopics.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {subtopics.map((child) => (
                <button
                  key={child.id}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:bg-accent hover:shadow-sm"
                  onClick={() => navigate(`/topic/${child.id}`)}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                      <TopicIcon className="h-5 w-5" icon={child.icon} />
                    </span>
                    <span className="font-medium">{child.name}</span>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {child.page_count ?? 0}p
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Pages list */}
        {orderedPages.length ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pages</h2>
              <span className="text-sm text-muted-foreground">{orderedPages.length} notes</span>
            </div>
            <div className="space-y-2">
              {orderedPages.map((page) => (
                <button
                  key={page.id}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/80 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:bg-accent hover:shadow-sm"
                  onClick={() => navigate(`/page/${page.id}`)}
                  type="button"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {page.is_pinned ? <Pin className="h-3.5 w-3.5 fill-current text-amber-500" /> : null}
                      <h3 className="truncate font-medium">{page.title}</h3>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {page.word_count > 0 ? (
                        <span className="mr-2">{page.word_count.toLocaleString()} words</span>
                      ) : null}
                      <span className="opacity-60">·</span>
                      <span className="ml-2">{formatRelativeTime(page.updated_at)}</span>
                    </p>
                  </div>
                  {page.word_count > 0 ? (
                    <div className="hidden shrink-0 sm:block">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/20"
                          style={{ width: `${Math.min(100, (page.word_count / 500) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Empty state */}
        {isEmpty ? (
          <section className="mt-10 rounded-2xl border border-dashed border-border bg-background/60 px-8 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold">Nothing here yet</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Create your first page in this topic and start building your knowledge base.
            </p>
            <button
              className="mt-6 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-85"
              onClick={() => setPageDialogOpen(true)}
              type="button"
            >
              Start writing
            </button>
          </section>
        ) : null}
      </section>

      <NewPageDialog
        onClose={() => setPageDialogOpen(false)}
        onCreated={(pageId) => {
          void queryClient.invalidateQueries({ queryKey: ['pages', 'topic', topicId] })
          navigate(`/page/${pageId}`)
          setPageDialogOpen(false)
        }}
        open={pageDialogOpen}
        topicId={topicId}
      />

      <AddTopicDialog
        onClose={() => setSubtopicDialogOpen(false)}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
          void queryClient.invalidateQueries({ queryKey: ['topics', topicId] })
        }}
        open={subtopicDialogOpen}
        parentId={topicId}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// New Page Dialog
// ─────────────────────────────────────────────────────────────────────────────

type NewPageDialogProps = {
  open: boolean
  topicId: string
  onClose: () => void
  onCreated: (pageId: string) => void
}

function NewPageDialog({ open, topicId, onClose, onCreated }: NewPageDialogProps) {
  const [title, setTitle] = useState('')

  const createPageMutation = useMutation({
    mutationFn: async () => createPage({ topic_id: topicId, title: title.trim() }),
    onSuccess: (page) => {
      toast.success('Page created')
      setTitle('')
      onCreated(page.id)
    },
    onError: () => toast.error('Could not create page'),
  })

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) { toast.error('Title is required'); return }
    createPageMutation.mutate()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border/70 bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">New page</p>
        <h2 className="mt-2 text-xl font-semibold">Give it a title</h2>

        <form className="mt-5 space-y-4" onSubmit={submit}>
          <input
            autoFocus
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How React renders components"
            value={title}
          />
          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-accent"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-85 disabled:opacity-50"
              disabled={createPageMutation.isPending}
              type="submit"
            >
              {createPageMutation.isPending ? 'Creating…' : 'Create page'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton + Helpers
// ─────────────────────────────────────────────────────────────────────────────

function TopicViewSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="h-4 w-52 animate-pulse rounded bg-muted" />
      <div className="mt-5 h-44 animate-pulse rounded-2xl bg-background/70" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-background/70" />)}
      </div>
      <div className="mt-8 space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-background/70" />)}
      </div>
    </section>
  )
}

function formatRelativeTime(value: string) {
  const diffMs = new Date(value).getTime() - Date.now()
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ]
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms || unit === 'minute') {
      return formatter.format(Math.round(diffMs / ms), unit)
    }
  }
  return 'just now'
}