import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderPlus, FilePlus2, Pin, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AddTopicDialog } from '../components/dialogs/AddTopicDialog'
import { createPage, getPagesByTopic, getTopic, deleteTopic } from '../lib/db'
import type { Page, Topic, TopicSummary } from '../types'
import { TopicIcon } from '../utils/topicIcons'

export function TopicView() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [pageDialogOpen, setPageDialogOpen] = useState(false)
  const [subtopicDialogOpen, setSubtopicDialogOpen] = useState(false)

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
      [...pages].sort((left, right) => {
        if (left.is_pinned !== right.is_pinned) {
          return left.is_pinned ? -1 : 1
        }

        return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
      }),
    [pages],
  )

  if (!topicId) {
    return null
  }

  if (topicLoading || pagesLoading) {
    return <TopicViewSkeleton />
  }

  if (!topic) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-[2rem] border border-border/70 bg-background/80 p-10 text-center shadow-sm">
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <button
            className="cursor-pointer transition hover:text-foreground"
            onClick={() => navigate('/')}
            type="button"
          >
            Home
          </button>
          {topic.parent_topic ? (
            <>
              <span>&gt;</span>
              <button
                className="cursor-pointer transition hover:text-foreground"
                onClick={() => navigate(`/topic/${topic.parent_topic?.id}`)}
                type="button"
              >
                {topic.parent_topic.name}
              </button>
            </>
          ) : null}
          <span>&gt;</span>
          <span className="text-foreground">{topic.name}</span>
        </div>

        <div className="mt-6 flex flex-col gap-6 rounded-[2rem] border border-border/70 bg-background/80 p-5 shadow-sm sm:p-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] border border-border/70 shadow-sm"
              style={{ backgroundColor: `${topic.color || '#EAD9CC'}20` }}
            >
              <TopicIcon className="h-10 w-10" icon={topic.icon} />
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{topic.name}</h1>
              {topic.description ? (
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {topic.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="flex items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-500 transition hover:bg-red-500 hover:text-white"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this topic and all its contents?')) {
                  deleteTopicMutation.mutate()
                }
              }}
              type="button"
              disabled={deleteTopicMutation.isPending}
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </button>
            <button
              className="flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
              onClick={() => setPageDialogOpen(true)}
              type="button"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>New Page</span>
            </button>
            <button
              className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm transition hover:bg-accent"
              onClick={() => setSubtopicDialogOpen(true)}
              type="button"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Subtopic</span>
            </button>
          </div>
        </div>

        {subtopics.length ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Subtopics</h2>
              <span className="text-sm text-muted-foreground">{subtopics.length} items</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {subtopics.map((child) => (
                <button
                  key={child.id}
                  className="flex cursor-pointer items-center justify-between rounded-[1.5rem] border border-border/70 bg-background/80 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:bg-accent"
                  onClick={() => navigate(`/topic/${child.id}`)}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent">
                      <TopicIcon className="h-5 w-5" icon={child.icon} />
                    </span>
                    <span className="font-medium sm:text-base">{child.name}</span>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {child.page_count ?? 0} pages
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {orderedPages.length ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pages</h2>
              <span className="text-sm text-muted-foreground">{orderedPages.length} notes</span>
            </div>
            <div className="space-y-3">
              {orderedPages.map((page) => (
                <button
                  key={page.id}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[1.5rem] border border-border/70 bg-background/80 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:bg-accent"
                  onClick={() => navigate(`/page/${page.id}`)}
                  type="button"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {page.is_pinned ? <Pin className="h-4 w-4 fill-current text-amber-600" /> : null}
                      <h3 className="truncate font-medium">{page.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {page.word_count} words
                      <span className="mx-2">•</span>
                      {formatRelativeTime(page.updated_at)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {isEmpty ? (
          <section className="mt-10 rounded-[2rem] border border-dashed border-border bg-background/60 px-8 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold">Nothing here yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Create the first page in this topic and start building your knowledge base.
            </p>
            <button
              className="mt-6 rounded-2xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
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

type NewPageDialogProps = {
  open: boolean
  topicId: string
  onClose: () => void
  onCreated: (pageId: string) => void
}

function NewPageDialog({ open, topicId, onClose, onCreated }: NewPageDialogProps) {
  const [title, setTitle] = useState('')

  const createPageMutation = useMutation({
    mutationFn: async () => {
      return createPage({
        topic_id: topicId,
        title: title.trim(),
      })
    },
    onSuccess: (page) => {
      toast.success('Page created')
      setTitle('')
      onCreated(page.id)
    },
    onError: () => {
      toast.error('Could not create page')
    },
  })

  if (!open) {
    return null
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) {
      toast.error('Page title is required')
      return
    }
    createPageMutation.mutate()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-border/70 bg-background p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Pages</p>
        <h2 className="mt-2 text-2xl font-semibold">New page</h2>

        <form className="mt-6 space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="page-title">
              Title
            </label>
            <input
              required
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
              id="page-title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Automatic batching"
              value={title}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="rounded-2xl border border-border px-4 py-2 text-sm transition hover:bg-accent"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-2xl bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createPageMutation.isPending}
              type="submit"
            >
              {createPageMutation.isPending ? 'Creating...' : 'Create page'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

function TopicViewSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="h-5 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-52 animate-pulse rounded-[2rem] bg-background/70" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-[1.5rem] bg-background/70" />
        ))}
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-[1.5rem] bg-background/70" />
        ))}
      </div>
    </section>
  )
}

function formatRelativeTime(value: string) {
  const date = new Date(value)
  const diffMs = date.getTime() - Date.now()

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ]

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  for (const [unit, unitMs] of units) {
    if (Math.abs(diffMs) >= unitMs || unit === 'minute') {
      return formatter.format(Math.round(diffMs / unitMs), unit)
    }
  }

  return 'just now'
}
