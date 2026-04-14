/**
 * Sidebar.tsx — Virtualized, high-performance sidebar
 *
 * Key design decisions:
 *  1. FLAT VIRTUAL LIST: The expanded topic tree is flattened into a 1-D array of
 *     visible rows. @tanstack/react-virtual only renders what's on screen (~20 rows)
 *     regardless of whether there are 50 or 50,000 topics in the database.
 *
 *  2. STABLE TREE STATE: Expand/collapse state lives in a Set<string>. When you import
 *     1,000 topics in one go, only the newly-imported root is added to the set — the
 *     rest stays collapsed so the DOM never explodes.
 *
 *  3. DRAG-AND-DROP on the flat list: Instead of nested SortableContexts (which don't
 *     work well in a virtualized list), we manage reordering manually and only allow
 *     sibling-level swaps (same parent_id).
 *
 *  4. MOBILE: TouchSensor with 250 ms delay enables long-press drag. Plus / Delete
 *     buttons are always visible on touch devices (no hover state).
 *
 *  5. SEARCH: A debounced filter hides rows that don't match. Searching auto-expands
 *     all ancestors of matching nodes.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronsUp,
  FolderPlus,
  GripVertical,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Square,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { deleteTopic, getTopicTree, reorderTopics } from '../../lib/db'
import { useUIStore } from '../../store/uiStore'
import type { Topic } from '../../types'
import { TopicIcon } from '../../utils/topicIcons'
import { cn } from '../../utils/cn'
import {
  getSiblingTopics,
  reorderSiblingTopics,
  type TreeTopic,
} from '../../utils/topicTree'
import { AddTopicDialog } from '../dialogs/AddTopicDialog'
import { MdImportDialog } from '../dialogs/MdImportDialog'

// ── Flat row type ──────────────────────────────────────────────────────────
interface FlatRow {
  node:     TreeTopic
  depth:    number
  parentId: string | null
}

/** Flatten the visible (expanded) tree into a 1-D array for virtualisation */
function flattenTree(
  nodes: TreeTopic[],
  expandedIds: Set<string>,
  depth = 0,
  parentId: string | null = null,
): FlatRow[] {
  const rows: FlatRow[] = []
  for (const node of nodes) {
    rows.push({ node, depth, parentId })
    if (expandedIds.has(node.id) && node.children?.length) {
      rows.push(...flattenTree(node.children as TreeTopic[], expandedIds, depth + 1, node.id))
    }
  }
  return rows
}

/** Collect all ancestor ids so we can auto-expand on search */
function collectAncestors(
  nodes: TreeTopic[],
  targetId: string,
  path: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return path
    if (node.children?.length) {
      const found = collectAncestors(node.children as TreeTopic[], targetId, [...path, node.id])
      if (found) return found
    }
  }
  return null
}

// ── Mutation types ─────────────────────────────────────────────────────────
type ReorderVars    = { parentId: string | null; orderedIds: string[] }
type ReorderContext = { previousTree: TreeTopic[]; previousParentTopic?: Topic }

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export function Sidebar() {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const { theme, toggleTheme, openSearch } = useUIStore()
  const location    = useLocation()

  const [expandedIds, setExpandedIds]   = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [dialogParentId, setDialogParentId] = useState<string | undefined>()
  const [dialogOpen, setDialogOpen]     = useState(false)
  const [importOpen, setImportOpen]     = useState(false)

  const { data: tree = [], isLoading } = useQuery<TreeTopic[]>({
    queryKey: ['topics', 'tree'],
    queryFn:  async () => (await getTopicTree()) as TreeTopic[],
    staleTime: 60_000,
  })

  // Auto-expand active route ancestors
  const topicIdFromRoute = useMemo(() => {
    const m = location.pathname.match(/topic\/([^/]+)/)
    return m?.[1]
  }, [location.pathname])

  useEffect(() => {
    if (!tree.length || !topicIdFromRoute) return
    const ancestors = collectAncestors(tree, topicIdFromRoute)
    if (ancestors?.length) {
      setExpandedIds((prev) => {
        const next = new Set(prev)
        ancestors.forEach((id) => next.add(id))
        return next
      })
    }
  }, [topicIdFromRoute, tree])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const orig = document.body.style.overflow
    document.body.style.overflow = mobileOpen ? 'hidden' : orig
    return () => { document.body.style.overflow = orig }
  }, [mobileOpen])

  const reorderMutation = useMutation<unknown, Error, ReorderVars, ReorderContext>({
    mutationFn: async ({ parentId, orderedIds }) => reorderTopics(parentId, orderedIds),
    onMutate:  async ({ parentId, orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: ['topics', 'tree'] })
      const previousTree = queryClient.getQueryData<TreeTopic[]>(['topics', 'tree']) ?? tree
      const previousParentTopic = parentId ? queryClient.getQueryData<Topic>(['topics', parentId]) : undefined
      queryClient.setQueryData<TreeTopic[]>(['topics', 'tree'], reorderSiblingTopics(previousTree, parentId, orderedIds))
      return { previousTree, previousParentTopic }
    },
    onError: (_e, vars, ctx) => {
      queryClient.setQueryData(['topics', 'tree'], ctx?.previousTree ?? tree)
      if (vars.parentId && ctx?.previousParentTopic)
        queryClient.setQueryData(['topics', vars.parentId], ctx.previousParentTopic)
    },
    onSettled: (_d, _e, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
      if (vars.parentId) void queryClient.invalidateQueries({ queryKey: ['topics', vars.parentId] })
    },
  })

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const openDialog = useCallback((parentId?: string) => {
    setDialogParentId(parentId)
    setDialogOpen(true)
    setMobileOpen(false)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeParentId = (active.data.current?.parentId as string | null) ?? null
    const overParentId   = (over.data.current?.parentId   as string | null) ?? null
    if (activeParentId !== overParentId) return
    const currentTree = queryClient.getQueryData<TreeTopic[]>(['topics', 'tree']) ?? tree
    const siblings = getSiblingTopics(currentTree, activeParentId)
    const oldIndex  = siblings.findIndex((n) => n.id === active.id)
    const newIndex  = siblings.findIndex((n) => n.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    reorderMutation.mutate({
      parentId:   activeParentId,
      orderedIds: arrayMove(siblings, oldIndex, newIndex).map((n) => n.id),
    })
  }, [queryClient, reorderMutation, tree])

  const sharedProps = {
    expandedIds, handleDragEnd, isLoading, tree,
    onAddChild:    openDialog,
    onToggle:      toggle,
    onCollapseAll: () => setExpandedIds(new Set()),
    onImportMd:    () => { setImportOpen(true); setMobileOpen(false) },
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar fixed inset-x-0 top-0 z-30 border-b border-border/70 bg-background/92 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button aria-label="Open sidebar"
            className="rounded-xl border border-border/70 bg-background p-2.5 shadow-sm transition hover:bg-accent active:scale-95"
            onClick={() => setMobileOpen(true)} type="button">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <button className="truncate text-base font-bold transition hover:opacity-80 text-left"
              onClick={() => { navigate('/'); setMobileOpen(false) }} type="button">
              KnowBase
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Search" className="rounded-xl border border-border/70 bg-background p-2.5 transition hover:bg-accent"
              onClick={() => { openSearch(); setMobileOpen(false) }} type="button">
              <Search className="h-4 w-4" />
            </button>
            <button aria-label="Hard refresh" title="Hard refresh"
              className="rounded-xl border border-border/70 bg-background p-2.5 transition hover:bg-accent"
              onClick={() => window.location.reload()} type="button">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button aria-label="Toggle theme"
              className="rounded-xl border border-border/70 bg-background p-2.5 transition hover:bg-accent"
              onClick={toggleTheme} type="button">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-72 shrink-0 border-r border-border/70 bg-[hsl(var(--sidebar-bg))] md:flex md:flex-col">
        <SidebarContent {...sharedProps} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 md:hidden"
              onClick={() => setMobileOpen(false)} type="button"
            />
            <motion.aside
              animate={{ x: 0 }} initial={{ x: '-100%' }} exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,22rem)] flex-col border-r border-border/70 bg-background shadow-2xl md:hidden"
              style={{ paddingLeft: 'env(safe-area-inset-left, 0px)' }}
            >
              <SidebarContent {...sharedProps} mobile
                onCloseMobile={() => setMobileOpen(false)}
                onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AddTopicDialog open={dialogOpen} parentId={dialogParentId}
        onClose={() => { setDialogOpen(false); setDialogParentId(undefined) }} />

      <MdImportDialog open={importOpen} onClose={() => setImportOpen(false)}
        onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })} />
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  SIDEBAR CONTENT
// ══════════════════════════════════════════════════════════════════════════════

type SidebarContentProps = {
  tree: TreeTopic[]
  isLoading: boolean
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onAddChild: (parentId?: string) => void
  onCollapseAll: () => void
  onImportMd: () => void
  handleDragEnd: (event: DragEndEvent) => void
  mobile?: boolean
  onCloseMobile?: () => void
  onNavigate?: () => void
}

function SidebarContent({
  tree, isLoading, expandedIds, onToggle, onAddChild, onCollapseAll,
  onImportMd, handleDragEnd, mobile = false, onCloseMobile, onNavigate,
}: SidebarContentProps) {
  const { theme, toggleTheme, openSearch } = useUIStore()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  // ── Search / filter ──────────────────────────────────────────────────────
  const [query, setQuery]           = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (showSearch) searchRef.current?.focus() }, [showSearch])

  // ── Multi-select delete ──────────────────────────────────────────────────
  const [selectMode, setSelectMode]       = useState(false)
  const [selected, setSelected]           = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[]; label: string } | null>(null)
  const [deleting, setDeleting]           = useState(false)

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()) }

  const handleDeleteSelected = () => {
    if (!selected.size) return
    setConfirmDelete({ ids: Array.from(selected), label: `${selected.size} topic${selected.size > 1 ? 's' : ''}` })
  }

  const handleDeleteOne = useCallback((id: string, name: string) => {
    setConfirmDelete({ ids: [id], label: `"${name}"` })
  }, [])

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await Promise.all(confirmDelete.ids.map((id) => deleteTopic(id)))
      void queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
      setConfirmDelete(null)
      exitSelectMode()
    } catch (err) { console.error('Delete failed', err) }
    finally { setDeleting(false) }
  }

  // ── DnD sensors (touch enabled) ──────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor,  { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,    { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // ── Flatten tree → visible rows ──────────────────────────────────────────
  const allRows = useMemo(() => flattenTree(tree, expandedIds), [tree, expandedIds])

  // Filter: if query present, only show rows whose name matches (case-insensitive)
  const visibleRows = useMemo(() => {
    if (!query.trim()) return allRows
    const q = query.toLowerCase()
    return allRows.filter((r) => r.node.name.toLowerCase().includes(q))
  }, [allRows, query])

  // ── Virtual scrolling ────────────────────────────────────────────────────
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count:           visibleRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize:    () => 38,          // each row ~38px
    overscan:        8,                 // render 8 extra rows above/below viewport
  })

  const totalItems = allRows.length

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between border-b border-border/70 px-5 py-4 shrink-0"
        style={mobile ? { paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' } : {}}
      >
        <button
          className="text-2xl font-bold tracking-tight transition hover:opacity-80 text-left"
          onClick={() => { navigate('/'); onNavigate?.() }} type="button">
          KnowBase
        </button>

        <div className="flex items-center gap-1">
          <button aria-label="Toggle theme" title="Toggle theme"
            className="rounded-xl p-2 transition hover:bg-accent" onClick={toggleTheme} type="button">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          {!mobile && (
            <>
              <button aria-label="Hard refresh" title="Hard refresh"
                className="rounded-xl p-2 transition hover:bg-accent"
                onClick={() => window.location.reload()} type="button">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button aria-label="Search" title="Search (⌘K)"
                className="rounded-xl p-2 transition hover:bg-accent" onClick={openSearch} type="button">
                <Search className="h-4 w-4" />
              </button>
            </>
          )}
          {/* Select mode */}
          <button
            aria-label={selectMode ? 'Exit select' : 'Select to delete'}
            title={selectMode ? 'Exit select' : 'Select topics'}
            className={cn('rounded-xl p-2 transition hover:bg-accent', selectMode && 'bg-accent')}
            onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)} type="button">
            <CheckSquare className="h-4 w-4" />
          </button>
          {mobile && (
            <button aria-label="Close sidebar"
              className="rounded-xl border border-border/70 p-2 transition hover:bg-accent"
              onClick={onCloseMobile} type="button">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Multi-select bar ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectMode && (
          <motion.div animate={{ height: 'auto', opacity: 1 }} initial={{ height: 0, opacity: 0 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }}
            className="overflow-hidden border-b border-border/70 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="flex-1 text-xs text-muted-foreground">
                {selected.size === 0 ? 'Tap to select' : `${selected.size} selected`}
              </span>
              {selected.size > 0 && (
                <button
                  className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition"
                  onClick={handleDeleteSelected} type="button">
                  <Trash2 className="h-3.5 w-3.5" /> Delete {selected.size}
                </button>
              )}
              <button className="rounded-xl border border-border/70 px-3 py-1.5 text-xs transition hover:bg-accent"
                onClick={exitSelectMode} type="button">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Actions row ─────────────────────────────────────────────────── */}
      {!selectMode && (
        <div className="border-b border-border/70 px-3 py-3 shrink-0 space-y-2">
          <div className="flex gap-2">
            <button
              className="flex flex-1 items-center gap-2 rounded-xl border border-dashed border-border bg-background/60 px-3 py-2 text-sm font-medium transition hover:bg-accent"
              onClick={() => onAddChild()} type="button">
              <FolderPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">Add Topic</span>
            </button>
            <button aria-label="Collapse all" title="Collapse all"
              className="rounded-xl border border-border/70 bg-background/60 px-2.5 transition hover:bg-accent"
              onClick={onCollapseAll} type="button">
              <ChevronsUp className="h-4 w-4" />
            </button>
            <button
              aria-label={showSearch ? 'Close filter' : 'Filter topics'}
              title="Filter topics"
              className={cn('rounded-xl border border-border/70 bg-background/60 px-2.5 transition hover:bg-accent', showSearch && 'bg-accent')}
              onClick={() => { setShowSearch((v) => !v); setQuery('') }} type="button">
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Inline filter input */}
          <AnimatePresence>
            {showSearch && (
              <motion.div animate={{ height: 'auto', opacity: 1 }} initial={{ height: 0, opacity: 0 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    className="w-full rounded-xl border border-border/70 bg-background/80 py-2 pl-8 pr-8 text-sm outline-none focus:border-foreground/40 placeholder:text-muted-foreground"
                    placeholder="Filter topics…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
                  />
                  {query && (
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setQuery('')} type="button">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {query && (
                  <p className="mt-1 px-1 text-[10px] text-muted-foreground">
                    {visibleRows.length} match{visibleRows.length !== 1 ? 'es' : ''}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className="flex w-full items-center gap-2 rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            onClick={onImportMd} type="button" title="Import .md file">
            <Upload className="h-3.5 w-3.5 shrink-0" />
            <span>Import .md file</span>
          </button>
        </div>
      )}

      {/* ── Topic count indicator (shown when large) ─────────────────────── */}
      {totalItems > 100 && !query && (
        <div className="shrink-0 border-b border-border/70 bg-amber-500/10 px-3 py-1.5">
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            {totalItems} topics visible · collapse sections to improve performance
          </p>
        </div>
      )}

      {/* ── VIRTUAL TREE ────────────────────────────────────────────────── */}
      <div ref={parentRef} className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <SidebarSkeleton />
        ) : visibleRows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {query ? `No topics match "${query}"` : 'No topics yet'}
            </p>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
            {/* We group the flat list by parentId so each sibling group gets its own SortableContext */}
            <VirtualTree
              rows={visibleRows}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onDeleteOne={handleDeleteOne}
              onNavigate={onNavigate}
              selectMode={selectMode}
              selected={selected}
              onSelect={toggleSelect}
              mobile={mobile}
              virtualizer={virtualizer}
            />
          </DndContext>
        )}
      </div>

      {/* ── Delete confirmation modal ────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => !deleting && setConfirmDelete(null)} />
            <motion.div
              animate={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-5 shadow-2xl">
              <h3 className="mb-1.5 text-base font-semibold">Delete {confirmDelete.label}?</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                This permanently deletes the topic and all sub-topics and pages inside it. Cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button className="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-accent disabled:opacity-50"
                  disabled={deleting} onClick={() => setConfirmDelete(null)} type="button">Cancel</button>
                <button
                  className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition"
                  disabled={deleting} onClick={() => void confirmAndDelete()} type="button">
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIRTUAL TREE — renders only visible rows using react-virtual
// ══════════════════════════════════════════════════════════════════════════════

type VirtualTreeProps = {
  rows: FlatRow[]
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onAddChild: (parentId: string) => void
  onDeleteOne: (id: string, name: string) => void
  onNavigate?: () => void
  selectMode: boolean
  selected: Set<string>
  onSelect: (id: string) => void
  mobile: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  virtualizer: any
}

function VirtualTree({
  rows, expandedIds, onToggle, onAddChild, onDeleteOne,
  onNavigate, selectMode, selected, onSelect, mobile, virtualizer,
}: VirtualTreeProps) {
  // Build per-parentId sibling groups for SortableContext.
  // Each unique parentId gets its own list of IDs — this prevents DnD-kit
  // from ever allowing cross-parent (cross-sibling-group) reordering.
  const siblingGroups = useMemo(() => {
    const groups = new Map<string | null, string[]>()
    for (const row of rows) {
      const key = row.parentId ?? null
      const list = groups.get(key) ?? []
      list.push(row.node.id)
      groups.set(key, list)
    }
    return groups
  }, [rows])

  return (
    <div
      style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
    >
      {virtualizer.getVirtualItems().map((vItem: { index: number; start: number; size: number; key: string | number }) => {
        const row = rows[vItem.index]
        if (!row) return null
        const siblingIds = siblingGroups.get(row.parentId ?? null) ?? [row.node.id]
        return (
          <div
            key={vItem.key}
            data-index={vItem.index}
            ref={virtualizer.measureElement}
            style={{
              position:  'absolute',
              top:       0,
              left:      0,
              width:     '100%',
              transform: `translateY(${vItem.start}px)`,
            }}
          >
            {/* Each row is wrapped in its own SortableContext whose items are
                ONLY its siblings — this makes DnD strictly parent-scoped */}
            <SortableContext items={siblingIds} strategy={verticalListSortingStrategy}>
              <SidebarRow
                row={row}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onAddChild={onAddChild}
                onDeleteOne={onDeleteOne}
                onNavigate={onNavigate}
                selectMode={selectMode}
                isSelected={selected.has(row.node.id)}
                onSelect={onSelect}
                mobile={mobile}
              />
            </SortableContext>
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  SIDEBAR ROW — single topic row with DnD + actions
// ══════════════════════════════════════════════════════════════════════════════

type SidebarRowProps = {
  row: FlatRow
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onAddChild: (parentId: string) => void
  onDeleteOne: (id: string, name: string) => void
  onNavigate?: () => void
  selectMode: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  mobile: boolean
}

function SidebarRow({
  row, expandedIds, onToggle, onAddChild, onDeleteOne,
  onNavigate, selectMode, isSelected, onSelect, mobile,
}: SidebarRowProps) {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { node, depth, parentId } = row

  const hasChildren = Boolean(node.children?.length)
  const isExpanded  = expandedIds.has(node.id)
  const isActive    = location.pathname.includes(node.id)
  const paddingLeft = 12 + depth * 14

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: node.id, data: { parentId }, disabled: selectMode })

  const handleClick = () => {
    if (selectMode) { onSelect(node.id); return }
    navigate(`/topic/${node.id}`)
    onNavigate?.()
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-no-transition
      className="px-2"
    >
      <div
        className={cn(
          'group flex cursor-pointer items-center gap-1.5 rounded-xl py-1.5 pr-1.5 text-sm transition-colors',
          isSelected
            ? 'bg-red-500/15 text-foreground ring-1 ring-red-400/40'
            : isActive
              ? 'bg-accent font-medium text-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
          isDragging && 'opacity-50 shadow-md z-10',
        )}
        onClick={handleClick}
        style={{ paddingLeft }}
      >
        {/* Expand / select indicator */}
        {selectMode ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            {isSelected
              ? <CheckSquare className="h-4 w-4 text-red-500" />
              : <Square className="h-4 w-4 text-muted-foreground" />}
          </span>
        ) : (
          <button
            className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition hover:bg-background/70',
              !hasChildren && 'invisible')}
            onClick={(e) => { e.stopPropagation(); onToggle(node.id) }}
            type="button"
          >
            {isExpanded
              ? <ChevronDown className="h-3.5 w-3.5" />
              : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Topic icon */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/70"
          style={{ backgroundColor: node.color ? `${node.color}22` : undefined }}>
          <TopicIcon className="h-3 w-3" icon={node.icon} />
        </div>

        {/* Name */}
        <span className="min-w-0 flex-1 truncate text-[13px]">{node.name}</span>

        {/* Action buttons */}
        {!selectMode && (
          <>
            {/* Drag handle */}
            <button
              className={cn('shrink-0 rounded-md p-1 text-muted-foreground transition',
                mobile ? 'opacity-40' : 'opacity-0 group-hover:opacity-60 hover:opacity-100')}
              onClick={(e) => e.stopPropagation()}
              ref={setActivatorNodeRef}
              type="button"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3 w-3" />
            </button>

            {/* Page count badge */}
            {typeof node.page_count === 'number' && node.page_count > 0 && (
              <span className="shrink-0 rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {node.page_count}
              </span>
            )}

            {/* Add child */}
            <button
              className={cn('shrink-0 rounded-md p-1 transition hover:bg-background/70',
                mobile ? 'opacity-60' : 'opacity-0 group-hover:opacity-100')}
              onClick={(e) => { e.stopPropagation(); onAddChild(node.id) }}
              type="button"
              title="Add child topic"
            >
              <Plus className="h-3 w-3" />
            </button>

            {/* Delete */}
            <button
              className={cn('shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500',
                mobile ? 'opacity-60' : 'opacity-0 group-hover:opacity-100')}
              onClick={(e) => { e.stopPropagation(); onDeleteOne(node.id, node.name) }}
              type="button"
              title="Delete topic"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-1.5 px-3 py-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-8 animate-pulse rounded-xl bg-muted/60"
          style={{ marginLeft: i % 3 === 2 ? 28 : i % 3 === 1 ? 14 : 0, opacity: 1 - i * 0.08 }} />
      ))}
    </div>
  )
}
