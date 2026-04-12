/**
 * MdImportDialog.tsx
 *
 * Multi-step dialog for importing a .md file into KnowBase.
 *
 * Flow:
 *   Step 1 — Drop / select a .md file.
 *   Step 2 — Advanced editor: full collapsible tree preview, every topic /
 *             subtopic / page name is editable inline, rows can be deleted.
 *   Step 3 — Importing: animated progress bar.
 *   Step 4 — Done: link to the created topic.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ChevronDown, FileText, Loader2, Trash2, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { getTopicTree } from '../../lib/db'
import {
  executeMdImport,
  parseMdFile,
  type ImportProgress,
  type MdImportPlan,
} from '../../lib/mdImport'
import type { Topic } from '../../types'
import { cn } from '../../utils/cn'

// ── Local editable types ───────────────────────────────────────────────────

type EditPage = {
  id:    string
  title: string
  items: string[]
}

type EditSection = {
  id:        string
  title:     string
  pages:     EditPage[]
  collapsed: boolean
}

type EditPlan = {
  topicName: string
  sections:  EditSection[]
}

let _uid = 0
const uid = () => `ep${++_uid}`

function planToEditable(plan: MdImportPlan): EditPlan {
  return {
    topicName: plan.topicName,
    sections:  plan.sections.map((sec, i) => ({
      id:        uid(),
      title:     sec.title,
      collapsed: i > 2,  // show first 3 sections open
      pages:     sec.pages.map((p) => ({ id: uid(), title: p.title, items: p.items })),
    })),
  }
}

function editableToPlan(edit: EditPlan): MdImportPlan {
  return {
    topicName: edit.topicName.trim() || 'Imported Topic',
    sections:  edit.sections
      .filter((s) => s.title.trim())
      .map((s) => ({
        title: s.title.trim(),
        pages: s.pages
          .filter((p) => p.title.trim())
          .map((p) => ({ title: p.title.trim(), items: p.items })),
      })),
  }
}

// ── Component ──────────────────────────────────────────────────────────────

type Step = 'pick' | 'preview' | 'importing' | 'done'

type MdImportDialogProps = {
  open:      boolean
  onClose:   () => void
  onSuccess: () => void
}

export function MdImportDialog({ open, onClose, onSuccess }: MdImportDialogProps) {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step,           setStep]           = useState<Step>('pick')
  const [editPlan,       setEditPlan]       = useState<EditPlan | null>(null)
  const [fileName,       setFileName]       = useState('')
  const [parentId,       setParentId]       = useState<string | null>(null)
  const [progress,       setProgress]       = useState<ImportProgress | null>(null)
  const [createdTopicId, setCreatedTopicId] = useState<string | null>(null)
  const [isDragOver,     setIsDragOver]     = useState(false)

  const { data: tree = [] } = useQuery<Topic[]>({
    queryKey: ['topics', 'tree'],
    queryFn:  () => getTopicTree(),
    staleTime: 60_000,
    enabled:  open,
  })

  const flatTopics = flattenTree(tree)

  const reset = () => {
    setStep('pick'); setEditPlan(null); setFileName(''); setParentId(null)
    setProgress(null); setCreatedTopicId(null); setIsDragOver(false)
  }

  const handleClose = () => { reset(); onClose() }

  // ── File parsing ────────────────────────────────────────────────────────

  const processFile = (file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      toast.error('Please select a Markdown (.md) file')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? ''
      try {
        const parsed = parseMdFile(text)
        if (!parsed.sections.length) {
          toast.error('No ## sections found. Add ## headings to create subtopics.')
          return
        }
        setEditPlan(planToEditable(parsed))
        setStep('preview')
      } catch (err) {
        toast.error('Could not parse the file. Check it is valid Markdown.')
        console.error(err)
      }
    }
    reader.readAsText(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const handleDragLeave = () => setIsDragOver(false)

  // ── Import execution ─────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!editPlan) return
    const finalPlan = editableToPlan(editPlan)
    setStep('importing')
    try {
      const topicId = await executeMdImport(finalPlan, parentId, (p) => setProgress(p))
      await queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
      setCreatedTopicId(topicId)
      setStep('done')
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Import failed. Check your connection and try again.')
      setStep('preview')
    }
  }

  // ── Edit helpers ─────────────────────────────────────────────────────────

  const setTopicName = (name: string) =>
    setEditPlan((p) => p ? { ...p, topicName: name } : p)

  const setSectionTitle = (secId: string, title: string) =>
    setEditPlan((p) => p
      ? { ...p, sections: p.sections.map((s) => s.id === secId ? { ...s, title } : s) }
      : p)

  const toggleSection = (secId: string) =>
    setEditPlan((p) => p
      ? { ...p, sections: p.sections.map((s) => s.id === secId ? { ...s, collapsed: !s.collapsed } : s) }
      : p)

  const deleteSection = (secId: string) =>
    setEditPlan((p) => p ? { ...p, sections: p.sections.filter((s) => s.id !== secId) } : p)

  const setPageTitle = (secId: string, pageId: string, title: string) =>
    setEditPlan((p) => p ? {
      ...p,
      sections: p.sections.map((s) => s.id === secId
        ? { ...s, pages: s.pages.map((pg) => pg.id === pageId ? { ...pg, title } : pg) }
        : s),
    } : p)

  const deletePage = (secId: string, pageId: string) =>
    setEditPlan((p) => p ? {
      ...p,
      sections: p.sections.map((s) => s.id === secId
        ? { ...s, pages: s.pages.filter((pg) => pg.id !== pageId) }
        : s),
    } : p)

  // ── Derived stats ────────────────────────────────────────────────────────

  const totalPages = editPlan?.sections.reduce((n, s) => n + s.pages.length, 0) ?? 0
  const totalItems = editPlan?.sections.reduce(
    (n, s) => n + s.pages.reduce((m, p) => m + (p.items?.length ?? 0), 0), 0,
  ) ?? 0

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border/70 bg-background shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {step !== 'importing' ? (
          <button
            className="absolute right-4 top-4 z-10 rounded-xl p-2 transition hover:bg-accent"
            onClick={handleClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {/* ── Step 1: Pick file ────────────────────────────────────────────── */}
        {step === 'pick' ? (
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Import</p>
            <h2 className="mt-2 text-xl font-bold">Import Markdown file</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Each <code className="rounded bg-accent px-1.5 py-0.5 text-xs font-mono">##</code> heading
              becomes a <strong>subtopic</strong> and each{' '}
              <code className="rounded bg-accent px-1.5 py-0.5 text-xs font-mono">- bullet</code> becomes
              a <strong>page</strong>. Items inside <code className="rounded bg-accent px-1.5 py-0.5 text-xs font-mono">(a · b · c)</code> become the page content.
            </p>

            <div
              className={cn(
                'mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-10 transition',
                isDragOver
                  ? 'border-foreground/40 bg-accent'
                  : 'border-border hover:border-foreground/25 hover:bg-accent/40',
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Drop your .md file here</p>
                <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown"
              className="hidden"
              onChange={handleFileInput}
            />

            <div className="mt-4 rounded-xl border border-border/60 bg-muted/60 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Expected format
              </p>
              <pre className="font-mono text-xs leading-5 text-muted-foreground">{`# Topic Name
## Subtopic One
- Page Title (item1 · item2 · item3)
- Another Page (concept · detail · more)
---
## Subtopic Two
- Simple Page
- Detailed Page (item · item · item)`}</pre>
            </div>
          </div>
        ) : null}

        {/* ── Step 2: Preview + editable tree ─────────────────────────────── */}
        {step === 'preview' && editPlan ? (
          <div className="flex max-h-[90vh] flex-col">
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border/70 px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {fileName}
                </p>
                <h2 className="text-lg font-bold">Review &amp; edit before importing</h2>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">

              {/* Topic name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Root topic name
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 font-semibold text-foreground outline-none transition focus:border-foreground/40 focus:bg-background"
                  value={editPlan.topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="Topic name"
                />
              </div>

              {/* Parent selector */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  htmlFor="md-parent-select"
                >
                  Import under (optional)
                </label>
                <select
                  id="md-parent-select"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-foreground/40"
                  value={parentId ?? ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                >
                  <option value="">— Create at root level —</option>
                  {flatTopics.map((t) => (
                    <option key={t.id} value={t.id}>{t.indent}{t.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Leave blank to create a top-level topic, or pick an existing one to nest inside.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl border border-border/70 bg-muted/30 px-3 py-3 text-center">
                  <p className="text-2xl font-bold">{editPlan.sections.length}</p>
                  <p className="text-xs text-muted-foreground">Subtopics</p>
                </div>
                <div className="flex-1 rounded-xl border border-border/70 bg-muted/30 px-3 py-3 text-center">
                  <p className="text-2xl font-bold">{totalPages}</p>
                  <p className="text-xs text-muted-foreground">Pages</p>
                </div>
                <div className="flex-1 rounded-xl border border-border/70 bg-muted/30 px-3 py-3 text-center">
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-xs text-muted-foreground">Sub-items</p>
                </div>
              </div>

              {/* Editable tree */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Structure — edit names inline, click ▸ to expand, 🗑 to remove
                </p>

                <div className="overflow-hidden rounded-xl border border-border/70">
                  {editPlan.sections.map((sec, si) => (
                    <div
                      key={sec.id}
                      className={cn('border-border/40', si < editPlan.sections.length - 1 && 'border-b')}
                    >
                      {/* Section header row */}
                      <div className="group flex items-center gap-2 bg-muted/30 px-3 py-2">
                        {/* Expand / collapse */}
                        <button
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition hover:bg-accent"
                          onClick={() => toggleSection(sec.id)}
                          type="button"
                          aria-label={sec.collapsed ? 'Expand subtopic' : 'Collapse subtopic'}
                        >
                          <span className={cn('inline-flex transition-transform duration-150', sec.collapsed && '-rotate-90')}>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </span>
                        </button>

                        {/* Editable subtopic name */}
                        <input
                          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:bg-background/70"
                          value={sec.title}
                          onChange={(e) => setSectionTitle(sec.id, e.target.value)}
                          placeholder="Subtopic name"
                        />

                        <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                          {sec.pages.length} pages
                        </span>

                        {/* Delete subtopic */}
                        <button
                          className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                          onClick={() => deleteSection(sec.id)}
                          type="button"
                          title="Remove subtopic and all its pages"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Pages list */}
                      {!sec.collapsed && sec.pages.length > 0 ? (
                        <div className="divide-y divide-border/30 bg-background/40">
                          {sec.pages.map((page) => (
                            <div
                              key={page.id}
                              className="group/pg flex items-center gap-2 py-1.5 pl-10 pr-3"
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />

                              {/* Editable page title */}
                              <input
                                className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:bg-accent/40"
                                value={page.title}
                                onChange={(e) => setPageTitle(sec.id, page.id, e.target.value)}
                                placeholder="Page title"
                              />

                              {page.items.length > 0 ? (
                                <span className="shrink-0 tabular-nums text-xs text-muted-foreground/60">
                                  {page.items.length} items
                                </span>
                              ) : null}

                              {/* Delete page */}
                              <button
                                className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-red-500/10 hover:text-red-500 group-hover/pg:opacity-100"
                                onClick={() => deletePage(sec.id, page.id)}
                                type="button"
                                title="Remove page"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Empty section notice */}
                      {!sec.collapsed && sec.pages.length === 0 ? (
                        <p className="py-2 pl-10 text-xs text-muted-foreground/60 italic">
                          No pages (all were removed)
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end gap-2 border-t border-border/70 px-6 py-4">
              <button
                className="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-accent"
                onClick={() => setStep('pick')}
                type="button"
              >
                ← Back
              </button>
              <button
                className="rounded-xl bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-85 disabled:opacity-40"
                disabled={editPlan.sections.length === 0}
                onClick={() => void handleImport()}
                type="button"
              >
                Import {editPlan.sections.length} subtopics ({totalPages} pages) →
              </button>
            </div>
          </div>
        ) : null}

        {/* ── Step 3: Importing ───────────────────────────────────────────── */}
        {step === 'importing' ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <h2 className="mt-4 text-lg font-bold">Importing…</h2>
            {progress ? (
              <>
                <p className="mt-2 max-w-xs truncate text-sm text-muted-foreground">{progress.step}</p>
                <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-300"
                    style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {progress.current} / {progress.total} steps
                </p>
              </>
            ) : null}
          </div>
        ) : null}

        {/* ── Step 4: Done ────────────────────────────────────────────────── */}
        {step === 'done' && editPlan ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <h2 className="mt-4 text-lg font-bold">Import complete!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>{editPlan.topicName}</strong> was created with{' '}
              {editPlan.sections.length} subtopics and {totalPages} pages.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                className="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-accent"
                onClick={handleClose}
                type="button"
              >
                Close
              </button>
              {createdTopicId ? (
                <button
                  className="rounded-xl bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-85"
                  onClick={() => { handleClose(); navigate(`/topic/${createdTopicId}`) }}
                  type="button"
                >
                  Go to topic →
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

interface FlatTopic { id: string; name: string; indent: string }

function flattenTree(nodes: Topic[], depth = 0): FlatTopic[] {
  return nodes.flatMap((node) => {
    const indent   = '  '.repeat(depth)
    const children = (node.children ?? []) as Topic[]
    return [
      { id: node.id, name: node.name, indent },
      ...flattenTree(children, depth + 1),
    ]
  })
}
