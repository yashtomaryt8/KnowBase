import { useQuery } from '@tanstack/react-query'
import { BookOpen, Clock, FilePlus2, FolderOpen, Layers, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRecentPages, getTopicTree } from '../lib/db'
import { useUIStore } from '../store/uiStore'
import type { Page, Topic } from '../types'

export function HomePage() {
  const navigate = useNavigate()
  const { openSearch } = useUIStore()

  const { data: tree = [] } = useQuery<Topic[]>({
    queryKey: ['topics', 'tree'],
    queryFn: () => getTopicTree(),
    staleTime: 60_000,
  })

  const { data: recentPages = [], isLoading } = useQuery<Page[]>({
    queryKey: ['pages', 'recent'],
    queryFn: () => getRecentPages(6),
    staleTime: 30_000,
  })

  const totalTopics = countTopics(tree)
  const greeting = getGreeting()
  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">{dateString}</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl md:text-5xl">{greeting}</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">Your personal knowledge base</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={<FolderOpen className="h-5 w-5" />} label="Topics" value={totalTopics} />
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Recent Pages" value={recentPages.length} />
        <StatCard
          className="col-span-2 cursor-pointer sm:col-span-1"
          icon={<Sparkles className="h-5 w-5" />}
          label="AI Search"
          onClick={openSearch}
          value="Ctrl K"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <QuickAction
          icon={<FolderOpen className="h-4 w-4" />}
          label="Browse Topics"
          onClick={() => {
            const first = tree[0] as Topic | undefined
            if (first) {
              navigate(`/topic/${first.id}`)
            }
          }}
        />
        <QuickAction
          icon={<Sparkles className="h-4 w-4" />}
          label="Search Knowledge"
          onClick={openSearch}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently Updated</h2>
          {recentPages.length > 0 ? (
            <span className="text-sm text-muted-foreground">{recentPages.length} pages</span>
          ) : null}
        </div>

        {isLoading ? (
          <RecentPagesSkeleton />
        ) : recentPages.length === 0 ? (
          <EmptyState hasTopics={tree.length > 0} />
        ) : (
          <div className="space-y-2">
            {recentPages.map((page) => (
              <button
                key={page.id}
                className="flex w-full items-center gap-4 rounded-[1.5rem] border border-border/70 bg-background/80 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:bg-accent hover:shadow-sm"
                onClick={() => navigate(`/page/${page.id}`)}
                type="button"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{page.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {page.topic_name ? <span className="mr-2">{page.topic_name}</span> : null}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(page.updated_at)}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
                  {page.word_count > 0 ? `${page.word_count}w` : ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  onClick,
  className = '',
}: {
  icon: ReactNode
  label: string
  value: string | number
  onClick?: () => void
  className?: string
}) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      className={`flex flex-col gap-2 rounded-[1.5rem] border border-border/70 bg-background/80 p-5 shadow-sm ${onClick ? 'cursor-pointer transition hover:bg-accent' : ''} ${className}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-2xl font-bold sm:text-3xl">{value}</p>
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      </div>
    </Tag>
  )
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  )
}

function EmptyState({ hasTopics }: { hasTopics: boolean }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-border bg-background/60 px-8 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
        <FilePlus2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-xl font-semibold">Nothing here yet</h3>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        {hasTopics
          ? 'Navigate to a topic in the sidebar and create your first page.'
          : 'Start by adding a topic in the sidebar, then create pages inside it.'}
      </p>
    </div>
  )
}

function RecentPagesSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((index) => (
        <div key={index} className="h-20 animate-pulse rounded-[1.5rem] bg-background/70" />
      ))}
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function countTopics(tree: Topic[]): number {
  return tree.reduce((count, topic) => {
    const children = (topic.children ?? []) as Topic[]
    return count + 1 + countTopics(children)
  }, 0)
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

  for (const [unit, unitMs] of units) {
    if (Math.abs(diffMs) >= unitMs || unit === 'minute') {
      return formatter.format(Math.round(diffMs / unitMs), unit)
    }
  }

  return 'just now'
}
