/**
 * HomePage.tsx  —  KnowBase Dashboard
 *
 * A rich OneNote / Notion-style home screen that gives you at-a-glance
 * awareness of your knowledge base without navigating into topics.
 *
 * Sections:
 *  1. Greeting + live clock + date
 *  2. Stats row  (topics, pages, words)
 *  3. Quick-capture bar  (type a page title → pick a topic → create instantly)
 *  4. Two-column layout:
 *       Left  → Mini calendar + Checklist widget (localStorage)
 *       Right → Recent pages + Topics at a glance
 *  5. All sections are fully responsive down to 320px mobile.
 *
 * The checklist persists in localStorage so items survive browser sessions.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  FilePlus2,
  FolderOpen,
  Hash,
  Layers,
  Lightbulb,
  Plus,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { createPage, getRecentPages, getTopicTree } from '../lib/db'
import { useUIStore } from '../store/uiStore'
import type { Page, Topic } from '../types'
import { TopicIcon } from '../utils/topicIcons'
import { cn } from '../utils/cn'

// ── Checklist types + localStorage helpers ─────────────────────────────────

const LS_KEY = 'kb-checklist-v2'

interface CheckItem {
  id:        string
  text:      string
  done:      boolean
  createdAt: string
}

function loadChecklist(): CheckItem[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch { return [] }
}

function saveChecklist(items: CheckItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

// ── Main component ─────────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate()
  const { openSearch } = useUIStore()

  const { data: tree = [] } = useQuery<Topic[]>({
    queryKey: ['topics', 'tree'],
    queryFn: () => getTopicTree(),
    staleTime: 60_000,
  })

  const { data: recentPages = [], isLoading: pagesLoading } = useQuery<Page[]>({
    queryKey: ['pages', 'recent'],
    queryFn: () => getRecentPages(8),
    staleTime: 30_000,
  })

  // Derived stats
  const totalTopics = countTopics(tree)
  const totalWords  = recentPages.reduce((s, p) => s + (p.word_count || 0), 0)

  // Quick-capture state
  const [captureText, setCaptureText]     = useState('')
  const [captureTopicId, setCaptureTopicId] = useState('')
  const [showCapture, setShowCapture]     = useState(false)
  const captureRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Checklist state
  const [items, setItems]       = useState<CheckItem[]>(loadChecklist)
  const [newItem, setNewItem]   = useState('')

  const persistItems = (next: CheckItem[]) => { setItems(next); saveChecklist(next) }

  const addItem = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    persistItems([
      ...items,
      { id: crypto.randomUUID(), text: trimmed, done: false, createdAt: new Date().toISOString() },
    ])
    setNewItem('')
  }

  const toggleItem = (id: string) => {
    persistItems(items.map((i) => i.id === id ? { ...i, done: !i.done } : i))
  }

  const removeItem = (id: string) => {
    persistItems(items.filter((i) => i.id !== id))
  }

  const clearDone = () => persistItems(items.filter((i) => !i.done))

  // Quick-capture: create page
  const createPageMutation = useMutation({
    mutationFn: async () => {
      if (!captureTopicId) throw new Error('Pick a topic first')
      return createPage({ topic_id: captureTopicId, title: captureText.trim() })
    },
    onSuccess: (page) => {
      toast.success('Page created')
      void queryClient.invalidateQueries({ queryKey: ['pages', 'recent'] })
      navigate(`/page/${page.id}`)
      setCaptureText(''); setShowCapture(false)
    },
    onError: (err) => {
      toast.error((err as Error).message || 'Could not create page')
    },
  })

  useEffect(() => {
    if (showCapture) captureRef.current?.focus()
  }, [showCapture])

  // Flat topic list for the quick-capture selector
  const flatTopics = flattenTopics(tree)

  const greeting  = getGreeting()
  const dateStr   = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

      {/* ── 1. HEADER ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-reading)' }}>
            {greeting}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Your personal knowledge base · {totalTopics} topics
          </p>
        </div>
        <LiveClock />
      </div>

      {/* ── 2. STATS ROW ───────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<FolderOpen className="h-5 w-5" />}
          label="Topics"
          value={totalTopics}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Recent pages"
          value={recentPages.length}
          color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={<Hash className="h-5 w-5" />}
          label="Words (recent)"
          value={totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
          color="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="AI Search"
          value="⌘K"
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          onClick={openSearch}
        />
      </div>

      {/* ── 3. QUICK CAPTURE ───────────────────────────────────────────── */}
      <div className="mb-8">
        {!showCapture ? (
          <button
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-background/60 px-5 py-3.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            onClick={() => setShowCapture(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            <span>Quick capture — type a page title and save to any topic…</span>
          </button>
        ) : (
          <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quick Capture</p>
            <input
              ref={captureRef}
              className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground"
              placeholder="Page title…"
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setShowCapture(false) }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
                value={captureTopicId}
                onChange={(e) => setCaptureTopicId(e.target.value)}
              >
                <option value="">— Select topic —</option>
                {flatTopics.map((t) => (
                  <option key={t.id} value={t.id}>{t.indent}{t.name}</option>
                ))}
              </select>
              <button
                className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-85 disabled:opacity-40"
                disabled={!captureText.trim() || !captureTopicId || createPageMutation.isPending}
                onClick={() => createPageMutation.mutate()}
                type="button"
              >
                {createPageMutation.isPending ? 'Creating…' : 'Create page →'}
              </button>
              <button
                className="rounded-xl border border-border p-2 transition hover:bg-accent"
                onClick={() => setShowCapture(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. TWO-COLUMN DASHBOARD ────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* ── LEFT COLUMN: calendar + checklist ─────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Mini Calendar */}
          <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm overflow-hidden">
            <div className="w-full min-w-0">
              <MiniCalendar />
            </div>
          </div>

          {/* Checklist / To-do widget */}
          <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                Checklist
              </h2>
              {items.some((i) => i.done) ? (
                <button
                  className="text-xs text-muted-foreground transition hover:text-foreground"
                  onClick={clearDone}
                  type="button"
                >
                  Clear done
                </button>
              ) : null}
            </div>

            {/* Add item */}
            <div className="mb-3 flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none transition focus:border-foreground/40 placeholder:text-muted-foreground"
                placeholder="Add a task…"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addItem(newItem) }}
              />
              <button
                className="rounded-xl border border-border bg-background p-2 transition hover:bg-accent disabled:opacity-40"
                disabled={!newItem.trim()}
                onClick={() => addItem(newItem)}
                type="button"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Items list */}
            <div className="max-h-60 space-y-1.5 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Lightbulb className="h-6 w-6 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">No tasks yet. Add something to work on.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-xl px-3 py-2 transition hover:bg-accent/40',
                      item.done && 'opacity-60',
                    )}
                  >
                    <button
                      className="shrink-0 transition"
                      onClick={() => toggleItem(item.id)}
                      type="button"
                    >
                      {item.done
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        : <Circle className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <span className={cn('flex-1 text-sm', item.done && 'line-through text-muted-foreground')}>
                      {item.text}
                    </span>
                    <button
                      className="shrink-0 opacity-0 transition group-hover:opacity-100"
                      onClick={() => removeItem(item.id)}
                      type="button"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: recent pages + topics ───────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Recent pages */}
          <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recently Updated
              </h2>
              {recentPages.length > 0 ? (
                <span className="text-xs text-muted-foreground">{recentPages.length} pages</span>
              ) : null}
            </div>

            {pagesLoading ? (
              <div className="space-y-2">
                {[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/60" />)}
              </div>
            ) : recentPages.length === 0 ? (
              <EmptyRecent hasTopics={tree.length > 0} />
            ) : (
              <div className="space-y-1.5">
                {recentPages.map((page) => (
                  <button
                    key={page.id}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-accent"
                    onClick={() => navigate(`/page/${page.id}`)}
                    type="button"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{page.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {page.topic_name ? <span className="mr-1.5">{page.topic_name}</span> : null}
                        <span className="opacity-60">·</span>
                        <span className="ml-1.5">{formatRelativeTime(page.updated_at)}</span>
                      </p>
                    </div>
                    {page.word_count > 0 ? (
                      <span className="shrink-0 text-xs text-muted-foreground">{page.word_count}w</span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Topics quick access */}
          {tree.length > 0 ? (
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Topics
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {tree.slice(0, 9).map((topic) => (
                  <button
                    key={topic.id}
                    className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:bg-accent hover:shadow-sm"
                    onClick={() => navigate(`/topic/${topic.id}`)}
                    type="button"
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: topic.color ? `${topic.color}22` : undefined }}
                    >
                      <TopicIcon className="h-3.5 w-3.5" icon={topic.icon} />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">{topic.name}</span>
                  </button>
                ))}
                {tree.length > 9 ? (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                    +{tree.length - 9} more
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   LIVE CLOCK
   ══════════════════════════════════════════════════════════════════════════════ */

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-end">
      <span className="font-mono text-2xl font-bold sm:text-3xl tabular-nums">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
      </span>
      <span className="text-xs text-muted-foreground">
        {time.toLocaleTimeString('en-US', { second: '2-digit' }).slice(-2)}s
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   MINI CALENDAR
   A pure-React calendar that shows the current month. Clicking a day
   could be extended to show pages updated on that day in a future iteration.
   ══════════════════════════════════════════════════════════════════════════════ */

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

function MiniCalendar() {
  const today = new Date()
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year  = view.getFullYear()
  const month = view.getMonth()

  // First day-of-week for this month, and total days in month
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Pad with cells from the previous month
  const cells: Array<{ day: number; currentMonth: boolean }> = []
  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, currentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true })
  }
  // Pad end to complete a 6-row grid (42 cells)
  let trailing = 1
  while (cells.length < 42) cells.push({ day: trailing++, currentMonth: false })

  const isToday = (day: number, currentMonth: boolean) =>
    currentMonth &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  return (
    <div>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-1">
          <button
            className="rounded-lg p-1.5 transition hover:bg-accent"
            onClick={() => setView(new Date(year, month - 1, 1))}
            type="button"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            className="rounded-lg p-1.5 transition hover:bg-accent"
            onClick={() => setView(new Date(today.getFullYear(), today.getMonth(), 1))}
            type="button"
            aria-label="Today"
          >
            <span className="text-[10px] font-semibold">Today</span>
          </button>
          <button
            className="rounded-lg p-1.5 transition hover:bg-accent"
            onClick={() => setView(new Date(year, month + 1, 1))}
            type="button"
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="cal-grid mb-1">
        {DAYS.map((d) => (
          <div key={d} className="flex items-center justify-center py-1 text-[10px] font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="cal-grid">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={cn(
              'cal-day text-xs',
              !cell.currentMonth && 'other-month',
              isToday(cell.day, cell.currentMonth) && 'today',
            )}
          >
            {cell.day}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ══════════════════════════════════════════════════════════════════════════════ */

function StatCard({
  icon, label, value, color, onClick,
}: {
  icon: ReactNode; label: string; value: string | number; color: string; onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm',
        onClick && 'cursor-pointer transition hover:bg-accent',
      )}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', color)}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold sm:text-2xl tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Tag>
  )
}

function EmptyRecent({ hasTopics }: { hasTopics: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <FilePlus2 className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm font-medium">Nothing here yet</p>
      <p className="text-xs text-muted-foreground">
        {hasTopics
          ? 'Open a topic and create your first page.'
          : 'Start by adding a topic in the sidebar.'}
      </p>
    </div>
  )
}

/* ── Pure helpers ─────────────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Working late 🌙'
  if (h < 12) return 'Good morning ☀️'
  if (h < 17) return 'Good afternoon 🌤️'
  if (h < 21) return 'Good evening 🌆'
  return 'Good night 🌙'
}

function countTopics(tree: Topic[]): number {
  return tree.reduce((s, t) => s + 1 + countTopics((t.children ?? []) as Topic[]), 0)
}

interface FlatTopic { id: string; name: string; indent: string }

function flattenTopics(nodes: Topic[], depth = 0): FlatTopic[] {
  return nodes.flatMap((n) => [
    { id: n.id, name: n.name, indent: '\u00A0\u00A0'.repeat(depth) },
    ...flattenTopics((n.children ?? []) as Topic[], depth + 1),
  ])
}

function formatRelativeTime(value: string) {
  const diffMs = new Date(value).getTime() - Date.now()
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 864e5 * 365], ['month', 864e5 * 30], ['week', 864e5 * 7],
    ['day', 864e5], ['hour', 36e5], ['minute', 6e4],
  ]
  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [u, ms] of units) {
    if (Math.abs(diffMs) >= ms || u === 'minute') return fmt.format(Math.round(diffMs / ms), u)
  }
  return 'just now'
}
