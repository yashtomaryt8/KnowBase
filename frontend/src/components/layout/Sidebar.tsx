import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronsUp,
  FolderPlus,
  GripVertical,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Sun,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getTopicTree, reorderTopics } from '../../lib/db'
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

type ReorderTopicsVariables = { parentId: string | null; orderedIds: string[] }
type ReorderTopicsContext  = { previousTree: TreeTopic[]; previousParentTopic?: Topic }

export function Sidebar() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { theme, toggleTheme, openSearch } = useUIStore()
  const location = useLocation()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dialogParentId, setDialogParentId] = useState<string | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const { data: tree = [], isLoading } = useQuery<TreeTopic[]>({
    queryKey: ['topics', 'tree'],
    queryFn: async () => (await getTopicTree()) as TreeTopic[],
    staleTime: 60_000,
  })

  const topicIdFromRoute = useMemo(() => {
    const match = location.pathname.match(/topic\/([^/]+)/)
    return match?.[1]
  }, [location.pathname])

  useEffect(() => {
    if (!tree.length) return
    setExpandedIds((prev) => {
      const next = new Set(prev)
      const expandActiveRoute = (nodes: TreeTopic[], ancestorIds: string[] = []) => {
        for (const node of nodes) {
          if (topicIdFromRoute && node.id === topicIdFromRoute) {
            ancestorIds.forEach((id) => next.add(id))
            if (node.children?.length) next.add(node.id)
          }
          expandActiveRoute(node.children ?? [], [...ancestorIds, node.id])
        }
      }
      expandActiveRoute(tree)
      return next
    })
  }, [topicIdFromRoute, tree])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const orig = document.body.style.overflow
    document.body.style.overflow = mobileOpen ? 'hidden' : orig
    return () => { document.body.style.overflow = orig }
  }, [mobileOpen])

  const reorderTopicsMutation = useMutation<unknown, Error, ReorderTopicsVariables, ReorderTopicsContext>({
    mutationFn: async ({ parentId, orderedIds }) => { await reorderTopics(parentId, orderedIds) },
    onMutate: async ({ parentId, orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: ['topics', 'tree'] })
      const previousTree = queryClient.getQueryData<TreeTopic[]>(['topics', 'tree']) ?? tree
      const previousParentTopic = parentId === null ? undefined : queryClient.getQueryData<Topic>(['topics', parentId])
      queryClient.setQueryData<TreeTopic[]>(['topics', 'tree'], reorderSiblingTopics(previousTree, parentId, orderedIds))
      if (parentId !== null && previousParentTopic?.children) {
        const childMap = new Map(previousParentTopic.children.map((c) => [c.id, c]))
        queryClient.setQueryData<Topic>(['topics', parentId], {
          ...previousParentTopic,
          children: orderedIds.map((id) => childMap.get(id)).filter((c): c is NonNullable<typeof c> => c !== undefined),
        })
      }
      return { previousTree, previousParentTopic }
    },
    onError: (_err, variables, context) => {
      queryClient.setQueryData(['topics', 'tree'], context?.previousTree ?? tree)
      if (variables.parentId !== null && context?.previousParentTopic)
        queryClient.setQueryData(['topics', variables.parentId], context.previousParentTopic)
    },
    onSettled: (_data, _err, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
      if (variables.parentId !== null) void queryClient.invalidateQueries({ queryKey: ['topics', variables.parentId] })
    },
  })

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const openDialog = (parentId?: string) => {
    setDialogParentId(parentId)
    setDialogOpen(true)
    setMobileOpen(false)
  }

  const handleOpenSearch = () => { openSearch(); setMobileOpen(false) }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeParentId = (active.data.current?.parentId as string | null | undefined) ?? null
    const overParentId   = (over.data.current?.parentId   as string | null | undefined) ?? null
    if (activeParentId !== overParentId) return
    const currentTree = queryClient.getQueryData<TreeTopic[]>(['topics', 'tree']) ?? tree
    const siblings = getSiblingTopics(currentTree, activeParentId)
    const oldIndex = siblings.findIndex((n) => n.id === active.id)
    const newIndex = siblings.findIndex((n) => n.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    reorderTopicsMutation.mutate({
      parentId: activeParentId,
      orderedIds: arrayMove(siblings, oldIndex, newIndex).map((n) => n.id),
    })
  }

  const sharedProps = { expandedIds, handleDragEnd, isLoading, tree,
    onAddChild: openDialog, onToggle: toggle,
    onCollapseAll: () => setExpandedIds(new Set()),
    onImportMd: () => { setImportOpen(true); setMobileOpen(false) },
  }

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────────────────
          The `.mobile-topbar` class (defined in index.css) adds
          `padding-top: env(safe-area-inset-top, 0px)` so the bar's content
          is pushed below the iPhone status bar / Dynamic Island.
          Without this, the hamburger button sits behind the notch and is
          completely unreachable on iPhone 15 in PWA standalone mode.      */}
      <div className="mobile-topbar fixed inset-x-0 top-0 z-30 border-b border-border/70 bg-background/92 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            aria-label="Open sidebar"
            className="rounded-xl border border-border/70 bg-background p-2.5 shadow-sm transition hover:bg-accent active:scale-95"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <button
              className="truncate text-base font-bold transition hover:opacity-80 text-left"
              onClick={() => {
                navigate('/')
                setMobileOpen(false)
              }}
              type="button"
            >
              KnowBase
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button aria-label="Search" className="rounded-xl border border-border/70 bg-background p-2.5 transition hover:bg-accent" onClick={handleOpenSearch} type="button">
              <Search className="h-4 w-4" />
            </button>
            <button
              aria-label="Hard refresh"
              title="Hard refresh — fixes stale HMR state"
              className="rounded-xl border border-border/70 bg-background p-2.5 transition hover:bg-accent"
              onClick={() => window.location.reload()}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button aria-label="Toggle theme" className="rounded-xl border border-border/70 bg-background p-2.5 transition hover:bg-accent" onClick={toggleTheme} type="button">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden h-screen w-72 shrink-0 border-r border-border/70 bg-[hsl(var(--sidebar-bg))] md:flex md:flex-col">
        <SidebarContent {...sharedProps} />
      </aside>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 md:hidden"
              onClick={() => setMobileOpen(false)}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }} initial={{ x: '-100%' }} exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,22rem)] flex-col border-r border-border/70 bg-background shadow-2xl md:hidden"
              style={{ paddingLeft: 'env(safe-area-inset-left, 0px)' }}
            >
              <SidebarContent
                {...sharedProps}
                mobile
                onCloseMobile={() => setMobileOpen(false)}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AddTopicDialog
        open={dialogOpen}
        parentId={dialogParentId}
        onClose={() => { setDialogOpen(false); setDialogParentId(undefined) }}
      />

      <MdImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
        }}
      />
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   SIDEBAR CONTENT
   ══════════════════════════════════════════════════════════════════════════════ */

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
  const navigate = useNavigate()

  return (
    <>
      {/* Header — on mobile, push below safe area */}
      <div
        className="flex items-center justify-between border-b border-border/70 px-5 py-4"
        style={mobile ? { paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' } : {}}
      >
        <div>
          <button
            className="text-2xl font-bold tracking-tight transition hover:opacity-80 text-left"
            onClick={() => {
              navigate('/')
              if (onNavigate) onNavigate()
            }}
            type="button"
          >
            KnowBase
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <button aria-label="Toggle theme" className="rounded-xl p-2 transition hover:bg-accent" onClick={toggleTheme} type="button">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          {/* Hard refresh — desktop only */}
          {!mobile ? (
            <button
              aria-label="Hard refresh"
              title="Hard refresh — clears HMR stale state"
              className="rounded-xl p-2 transition hover:bg-accent"
              onClick={() => window.location.reload()}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          ) : null}
          {/* Search icon in desktop sidebar */}
          {!mobile ? (
            <button aria-label="Search" className="rounded-xl p-2 transition hover:bg-accent" onClick={openSearch} type="button">
              <Search className="h-4 w-4" />
            </button>
          ) : null}
          {mobile ? (
            <button aria-label="Close sidebar" className="rounded-xl border border-border/70 p-2 transition hover:bg-accent" onClick={onCloseMobile} type="button">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Actions row */}
      <div className="border-b border-border/70 px-3 py-3">
        {/* Add topic + Collapse all row */}
        <div className="flex gap-2">
          <button
            className="flex flex-1 items-center gap-2.5 rounded-xl border border-dashed border-border bg-background/60 px-3 py-2.5 text-sm font-medium transition hover:bg-accent"
            onClick={() => onAddChild()}
            type="button"
          >
            <FolderPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-left">Add Topic</span>
          </button>

          <button
            aria-label="Collapse all"
            title="Collapse all"
            className="rounded-xl border border-border/70 bg-background/60 px-2.5 py-2.5 transition hover:bg-accent"
            onClick={onCollapseAll}
            type="button"
          >
            <ChevronsUp className="h-4 w-4" />
          </button>
        </div>

        {/* Import MD file button */}
        <button
          className="mt-2 flex w-full items-center gap-2.5 rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
          onClick={onImportMd}
          type="button"
          title="Import a Markdown file to auto-create topics, subtopics, and pages"
        >
          <Upload className="h-3.5 w-3.5 shrink-0" />
          <span>Import .md file</span>
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {isLoading ? (
          <SidebarSkeleton />
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <TreeLevel depth={0} expandedIds={expandedIds} nodes={tree}
              onAddChild={onAddChild} onNavigate={onNavigate} onToggle={onToggle} parentId={null} />
          </DndContext>
        )}
      </div>
    </>
  )
}

/* ── Tree level + node ──────────────────────────────────────────────────────── */

type TreeLevelProps = {
  nodes: TreeTopic[]
  parentId: string | null
  depth: number
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onAddChild: (parentId: string) => void
  onNavigate?: () => void
}

function TreeLevel({ nodes, parentId, depth, expandedIds, onToggle, onAddChild, onNavigate }: TreeLevelProps) {
  return (
    <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
      {nodes.map((node) => (
        <TreeNode key={node.id} depth={depth} expandedIds={expandedIds} node={node}
          onAddChild={onAddChild} onNavigate={onNavigate} onToggle={onToggle} parentId={parentId} />
      ))}
    </SortableContext>
  )
}

type TreeNodeProps = {
  node: TreeTopic
  parentId: string | null
  depth: number
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onAddChild: (parentId: string) => void
  onNavigate?: () => void
}

function TreeNode({ node, parentId, depth, expandedIds, onToggle, onAddChild, onNavigate }: TreeNodeProps) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const hasChildren = Boolean(node.children?.length)
  const isExpanded  = expandedIds.has(node.id)
  const isActive    = location.pathname.includes(node.id)
  const paddingLeft = 12 + depth * 14

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: { parentId },
  })

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} data-no-transition>
      <div
        className={cn(
          'group mx-1 flex cursor-pointer items-center gap-1.5 rounded-xl py-2 pr-2 text-sm transition-colors',
          isActive
            ? 'bg-accent font-medium text-foreground'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
          isDragging && 'opacity-60 shadow-sm',
        )}
        onClick={() => { navigate(`/topic/${node.id}`); onNavigate?.() }}
        style={{ paddingLeft }}
      >
        {/* Expand chevron */}
        <button
          className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition hover:bg-background/70',
            !hasChildren && 'pointer-events-none opacity-0')}
          onClick={(e) => { e.stopPropagation(); onToggle(node.id) }}
          type="button"
        >
          <motion.span animate={{ rotate: isExpanded ? 0 : -90 }} className="flex" transition={{ duration: 0.16 }}>
            <ChevronDown className="h-3 w-3" />
          </motion.span>
        </button>

        {/* Icon */}
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80"
          style={{ backgroundColor: node.color ? `${node.color}22` : undefined }}
        >
          <TopicIcon className="h-3.5 w-3.5" icon={node.icon} />
        </div>

        {/* Name */}
        <span className="min-w-0 flex-1 truncate">{node.name}</span>

        {/* Drag handle */}
        <button
          className={cn('rounded-md p-1 opacity-0 transition group-hover:opacity-100', isDragging && 'opacity-100')}
          onClick={(e) => e.stopPropagation()}
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </button>

        {/* Page count badge */}
        {typeof node.page_count === 'number' && node.page_count > 0 ? (
          <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {node.page_count}
          </span>
        ) : null}

        {/* Add child */}
        <button
          className="rounded-md p-1 opacity-0 transition hover:bg-background/70 group-hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); onAddChild(node.id) }}
          type="button"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded ? (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }} initial={{ height: 0, opacity: 0 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
            transition={{ duration: 0.18 }}
          >
            <TreeLevel depth={depth + 1} expandedIds={expandedIds} nodes={node.children ?? []}
              onAddChild={onAddChild} onNavigate={onNavigate} onToggle={onToggle} parentId={node.id} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-2 px-2 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-xl bg-background/60" style={{ marginLeft: i % 2 === 0 ? 0 : 14 }} />
      ))}
    </div>
  )
}
