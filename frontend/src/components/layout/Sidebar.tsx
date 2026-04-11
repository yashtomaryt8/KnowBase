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
  Search,
  Sun,
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

type ReorderTopicsVariables = {
  parentId: string | null
  orderedIds: string[]
}

type ReorderTopicsContext = {
  previousTree: TreeTopic[]
  previousParentTopic?: Topic
}

export function Sidebar() {
  const queryClient = useQueryClient()
  const { theme, toggleTheme, openSearch } = useUIStore()
  const location = useLocation()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dialogParentId, setDialogParentId] = useState<string | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)
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
    if (!tree.length) {
      return
    }

    setExpandedIds((prev) => {
      const next = new Set(prev)
      
      const expandActiveRoute = (nodes: TreeTopic[], ancestorIds: string[] = []) => {
        for (const node of nodes) {
          if (topicIdFromRoute && node.id === topicIdFromRoute) {
            ancestorIds.forEach((id) => next.add(id))
            if (node.children?.length) {
              next.add(node.id)
            }
          }
          expandActiveRoute(node.children ?? [], [...ancestorIds, node.id])
        }
      }

      expandActiveRoute(tree)
      return next
    })
  }, [topicIdFromRoute, tree])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = mobileOpen ? 'hidden' : originalOverflow

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [mobileOpen])

  const reorderTopicsMutation = useMutation<
    unknown,
    Error,
    ReorderTopicsVariables,
    ReorderTopicsContext
  >({
    mutationFn: async ({ parentId, orderedIds }) => {
      await reorderTopics(parentId, orderedIds)
    },
    onMutate: async ({ parentId, orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: ['topics', 'tree'] })

      const previousTree = queryClient.getQueryData<TreeTopic[]>(['topics', 'tree']) ?? tree
      const previousParentTopic =
        parentId === null
          ? undefined
          : queryClient.getQueryData<Topic>(['topics', parentId])

      queryClient.setQueryData<TreeTopic[]>(
        ['topics', 'tree'],
        reorderSiblingTopics(previousTree, parentId, orderedIds),
      )

      if (parentId !== null && previousParentTopic?.children) {
        const childMap = new Map(previousParentTopic.children.map((child) => [child.id, child]))
        queryClient.setQueryData<Topic>(['topics', parentId], {
          ...previousParentTopic,
          children: orderedIds
            .map((id) => childMap.get(id))
            .filter((child): child is NonNullable<typeof child> => child !== undefined),
        })
      }

      return { previousTree, previousParentTopic }
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(['topics', 'tree'], context?.previousTree ?? tree)

      if (variables.parentId !== null && context?.previousParentTopic) {
        queryClient.setQueryData(['topics', variables.parentId], context.previousParentTopic)
      }
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })

      if (variables.parentId !== null) {
        void queryClient.invalidateQueries({ queryKey: ['topics', variables.parentId] })
      }
    },
  })

  const toggle = (id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const openDialog = (parentId?: string) => {
    setDialogParentId(parentId)
    setDialogOpen(true)
    setMobileOpen(false)
  }

  const handleOpenSearch = () => {
    openSearch()
    setMobileOpen(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const activeParentId = (active.data.current?.parentId as string | null | undefined) ?? null
    const overParentId = (over.data.current?.parentId as string | null | undefined) ?? null

    if (activeParentId !== overParentId) {
      return
    }

    const currentTree = queryClient.getQueryData<TreeTopic[]>(['topics', 'tree']) ?? tree
    const siblings = getSiblingTopics(currentTree, activeParentId)
    const oldIndex = siblings.findIndex((node) => node.id === active.id)
    const newIndex = siblings.findIndex((node) => node.id === over.id)

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex)
    reorderTopicsMutation.mutate({
      parentId: activeParentId,
      orderedIds: reorderedSiblings.map((node) => node.id),
    })
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            aria-label="Open sidebar"
            className="rounded-2xl border border-border/70 bg-background p-2.5 transition hover:bg-accent"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Knowledge</p>
            <h1 className="truncate text-lg font-semibold">KnowBase</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="rounded-2xl border border-border/70 bg-background p-2.5 transition hover:bg-accent"
              onClick={handleOpenSearch}
              type="button"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              aria-label="Toggle theme"
              className="rounded-2xl border border-border/70 bg-background p-2.5 transition hover:bg-accent"
              onClick={toggleTheme}
              type="button"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <aside className="hidden h-screen w-72 shrink-0 border-r border-border/70 bg-muted/50 backdrop-blur md:flex md:flex-col">
        <SidebarContent
          expandedIds={expandedIds}
          handleDragEnd={handleDragEnd}
          isLoading={isLoading}
          onAddChild={openDialog}
          onToggle={toggle}
          onCollapseAll={() => setExpandedIds(new Set())}
          tree={tree}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-40 bg-black/45 md:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,21rem)] flex-col border-r border-border/70 bg-background shadow-2xl md:hidden"
              exit={{ x: '-100%' }}
              initial={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
            >
              <SidebarContent
                expandedIds={expandedIds}
                handleDragEnd={handleDragEnd}
                isLoading={isLoading}
                mobile
                onAddChild={openDialog}
                onCloseMobile={() => setMobileOpen(false)}
                onNavigate={() => setMobileOpen(false)}
                onToggle={toggle}
                onCollapseAll={() => setExpandedIds(new Set())}
                tree={tree}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AddTopicDialog
        onClose={() => {
          setDialogOpen(false)
          setDialogParentId(undefined)
        }}
        open={dialogOpen}
        parentId={dialogParentId}
      />
    </>
  )
}

type SidebarContentProps = {
  tree: TreeTopic[]
  isLoading: boolean
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onAddChild: (parentId?: string) => void
  onCollapseAll: () => void
  handleDragEnd: (event: DragEndEvent) => void
  mobile?: boolean
  onCloseMobile?: () => void
  onNavigate?: () => void
}

function SidebarContent({
  tree,
  isLoading,
  expandedIds,
  onToggle,
  onAddChild,
  onCollapseAll,
  handleDragEnd,
  mobile = false,
  onCloseMobile,
  onNavigate,
}: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Knowledge</p>
          <h1 className="mt-2 text-2xl font-semibold">KnowBase</h1>
        </div>
        {mobile ? (
          <button
            aria-label="Close sidebar"
            className="rounded-full border border-border/70 bg-background p-2 transition hover:bg-accent"
            onClick={onCloseMobile}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="border-b border-border/70 px-4 py-4">
        <div className="flex gap-2">
          <button
            className="flex flex-1 items-center gap-3 rounded-2xl border border-dashed border-border bg-background px-3 py-2 text-sm transition hover:bg-accent"
            onClick={() => onAddChild()}
            type="button"
          >
            <FolderPlus className="h-4 w-4" />
            <span className="flex-1 text-left font-medium">Add Topic</span>
          </button>
          <button
            aria-label="Collapse all folders"
            title="Collapse All"
            className="rounded-2xl border border-border/70 bg-background px-3 py-2 transition hover:bg-accent flex items-center justify-center shrink-0"
            onClick={onCollapseAll}
            type="button"
          >
            <ChevronsUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        {isLoading ? (
          <SidebarSkeleton />
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <TreeLevel
              depth={0}
              expandedIds={expandedIds}
              nodes={tree}
              onAddChild={onAddChild}
              onNavigate={onNavigate}
              onToggle={onToggle}
              parentId={null}
            />
          </DndContext>
        )}
      </div>

    </>
  )
}

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
    <SortableContext items={nodes.map((node) => node.id)} strategy={verticalListSortingStrategy}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          depth={depth}
          expandedIds={expandedIds}
          node={node}
          onAddChild={onAddChild}
          onNavigate={onNavigate}
          onToggle={onToggle}
          parentId={parentId}
        />
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
  const navigate = useNavigate()
  const location = useLocation()
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = expandedIds.has(node.id)
  const isActive = location.pathname.includes(node.id)
  const paddingLeft = 12 + depth * 14
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: { parentId },
  })

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <div
        className={cn(
          'group mx-1 flex cursor-pointer items-center gap-2 rounded-xl py-2 pr-2 text-sm transition',
          isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          isDragging && 'opacity-70 shadow-sm',
        )}
        onClick={() => {
          navigate(`/topic/${node.id}`)
          onNavigate?.()
        }}
        style={{ paddingLeft }}
      >
        <button
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md transition hover:bg-background/80',
            !hasChildren && 'pointer-events-none opacity-0',
          )}
          onClick={(event) => {
            event.stopPropagation()
            onToggle(node.id)
          }}
          type="button"
        >
          <motion.span
            animate={{ rotate: isExpanded ? 0 : -90 }}
            className="flex"
            transition={{ duration: 0.18 }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </button>

        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/80"
          style={{ backgroundColor: node.color ? `${node.color}1f` : undefined }}
        >
          <TopicIcon className="h-4 w-4" icon={node.icon} />
        </div>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{node.name}</span>

        <button
          className={cn(
            'rounded-md p-1 opacity-0 transition hover:bg-background/80 group-hover:opacity-100',
            isDragging && 'opacity-100',
          )}
          onClick={(event) => event.stopPropagation()}
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        {typeof node.page_count === 'number' && node.page_count > 0 ? (
          <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground">
            {node.page_count}
          </span>
        ) : null}

        <button
          className="rounded-md p-1 opacity-0 transition hover:bg-background/80 group-hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation()
            onAddChild(node.id)
          }}
          type="button"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded ? (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TreeLevel
              depth={depth + 1}
              expandedIds={expandedIds}
              nodes={node.children ?? []}
              onAddChild={onAddChild}
              onNavigate={onNavigate}
              onToggle={onToggle}
              parentId={node.id}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-2 px-2 py-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-9 animate-pulse rounded-xl bg-background/70"
          style={{ marginLeft: index % 2 === 0 ? 0 : 14 }}
        />
      ))}
    </div>
  )
}
