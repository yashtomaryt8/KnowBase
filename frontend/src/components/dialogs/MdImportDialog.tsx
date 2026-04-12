/**
 * MdImportDialog.tsx
 *
 * Multi-step import dialog that shows a live preview of the 3-level
 * topic tree that will be created from a dropped Markdown file.
 *
 * Level 1: Root topic       (# heading)
 * Level 2: Subtopics        (## headings)
 * Level 3: Sub-subtopics    (- bullet lines → appear in sidebar)
 * Level 4: Pages            (· separated items inside each bullet)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2, ChevronDown, ChevronRight, FileText, Loader2, Upload, X,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { getTopicTree } from '../../lib/db'
import {
  executeMdImport,
  parseMdFile,
  type ImportProgress,
  type MdBullet,
  type MdImportPlan,
  type MdSection,
} from '../../lib/mdImport'
import type { Topic } from '../../types'
import { cn } from '../../utils/cn'

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

  const [step, setStep]               = useState<Step>('pick')
  const [plan, setPlan]               = useState<MdImportPlan | null>(null)
  const [fileName, setFileName]       = useState('')
  const [parentId, setParentId]       = useState<string | null>(null)
  const [progress, setProgress]       = useState<ImportProgress | null>(null)
  const [createdId, setCreatedId]     = useState<string | null>(null)
  const [isDragOver, setIsDragOver]   = useState(false)
  // Which sections are expanded in the preview tree
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1, 2]))

  const { data: tree = [] } = useQuery<Topic[]>({
    queryKey: ['topics', 'tree'],
    queryFn: () => getTopicTree(),
    staleTime: 60_000,
    enabled: open,
  })
  const flatTopics = flattenTree(tree)

  const reset = () => {
    setStep('pick'); setPlan(null); setFileName(''); setParentId(null)
    setProgress(null); setCreatedId(null); setIsDragOver(false)
    setExpandedSections(new Set([0, 1, 2]))
  }

  const handleClose = () => { reset(); onClose() }

  const processFile = (file: File) => {
    if (!file.name.match(/\.(md|markdown)$/i)) {
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
        setPlan(parsed)
        setStep('preview')
      } catch (err) {
        toast.error('Could not parse this file — make sure it is valid Markdown.')
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

  const handleImport = async () => {
    if (!plan) return
    setStep('importing')
    try {
      const topicId = await executeMdImport(plan, parentId, (p) => setProgress(p))
      await queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
      setCreatedId(topicId)
      setStep('done')
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Import failed. Check your connection and try again.')
      setStep('preview')
    }
  }

  // Stats
  const totalBullets = plan?.sections.reduce((s, sec) => s + sec.bullets.length, 0) ?? 0
  const totalPages   = plan?.sections.reduce(
    (s, sec) => s + sec.bullets.reduce((bs, b) => bs + b.pages.length, 0),
    0,
  ) ?? 0

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border/70 bg-background p-6 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {step !== 'importing' ? (
          <button className="absolute right-4 top-4 rounded-xl p-2 transition hover:bg-accent" onClick={handleClose} type="button">
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {/* ── Step: pick ─────────────────────────────────────────────────── */}
        {step === 'pick' ? (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Bulk Import</p>
              <h2 className="mt-1.5 text-xl font-bold">Import Markdown file</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Drop a <code className="rounded bg-accent px-1.5 py-0.5 font-mono text-xs">.md</code> file
                with <code className="rounded bg-accent px-1.5 py-0.5 font-mono text-xs">#</code>&nbsp;topic,{' '}
                <code className="rounded bg-accent px-1.5 py-0.5 font-mono text-xs">##</code>&nbsp;subtopics,
                and <code className="rounded bg-accent px-1.5 py-0.5 font-mono text-xs">- bullets</code>.
                KnowBase will build the full nested topic tree automatically.
              </p>
            </div>

            {/* Drop zone */}
            <div
              className={cn(
                'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-8 py-10 transition',
                isDragOver ? 'border-foreground/40 bg-accent' : 'border-border hover:border-foreground/25 hover:bg-accent/40',
              )}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
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
            <input ref={fileInputRef} type="file" accept=".md,.markdown" className="hidden" onChange={handleFileInput} />

            {/* Format hint */}
            <div className="rounded-xl border border-border/60 bg-muted/50 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expected format</p>
              <pre className="font-mono text-xs leading-6 text-muted-foreground">{`# Topic Name
## Subtopic One
- Concept A (item1 · item2 · item3)
- Concept B (itemX · itemY)
---
## Subtopic Two
- Simple Item`}</pre>
              <p className="mt-2 text-xs text-muted-foreground">
                Each bullet becomes a <strong>nested subtopic</strong> in the sidebar.
                Each <code className="font-mono">·</code> item becomes a <strong>page</strong> inside it.
              </p>
            </div>
          </div>
        ) : null}

        {/* ── Step: preview ──────────────────────────────────────────────── */}
        {step === 'preview' && plan ? (
          <div className="flex flex-col gap-5 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{fileName}</p>
                <h2 className="text-lg font-bold">Preview import</h2>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Subtopics',    value: plan.sections.length },
                { label: 'Sub-topics',   value: totalBullets },
                { label: 'Pages',        value: totalPages },
                { label: 'Total items',  value: 1 + plan.sections.length + totalBullets + totalPages },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-center">
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Parent selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="parent-sel">
                Import under (optional)
              </label>
              <select
                id="parent-sel"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
                value={parentId ?? ''}
                onChange={(e) => setParentId(e.target.value || null)}
              >
                <option value="">— Create at root level —</option>
                {flatTopics.map((t) => (
                  <option key={t.id} value={t.id}>{t.indent}{t.name}</option>
                ))}
              </select>
            </div>

            {/* Tree preview */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tree preview</p>
              <div className="overflow-y-auto rounded-xl border border-border/70 bg-muted/20 p-2 max-h-[28vh]">
                {/* Root topic */}
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <span className="text-base">📁</span>
                  <span className="font-semibold text-sm">{plan.topicName}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">root topic</span>
                </div>

                {plan.sections.map((sec, si) => (
                  <div key={si}>
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-accent"
                      onClick={() => setExpandedSections((prev) => {
                        const next = new Set(prev)
                        next.has(si) ? next.delete(si) : next.add(si)
                        return next
                      })}
                      type="button"
                    >
                      <span className="ml-3 text-muted-foreground">
                        {expandedSections.has(si) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </span>
                      <span className="text-sm">📂</span>
                      <span className="font-medium flex-1 text-left">{sec.title}</span>
                      <span className="text-[10px] text-muted-foreground">{sec.bullets.length} sub-topics</span>
                    </button>

                    {expandedSections.has(si) ? (
                      <div className="ml-8 border-l border-border/50 pl-3">
                        {sec.bullets.slice(0, 8).map((b, bi) => (
                          <div key={bi}>
                            <div className="flex items-center gap-2 py-1 text-xs">
                              <span>📄</span>
                              <span className="font-medium text-foreground">{b.title}</span>
                              <span className="ml-auto text-muted-foreground">{b.pages.length}p</span>
                            </div>
                            {b.pages.slice(0, 3).map((pg, pi) => (
                              <div key={pi} className="ml-5 flex items-center gap-1.5 py-0.5 text-[11px] text-muted-foreground">
                                <span>↳</span>
                                <span className="truncate">{pg}</span>
                              </div>
                            ))}
                            {b.pages.length > 3 ? (
                              <div className="ml-5 py-0.5 text-[11px] text-muted-foreground">
                                + {b.pages.length - 3} more pages…
                              </div>
                            ) : null}
                          </div>
                        ))}
                        {sec.bullets.length > 8 ? (
                          <div className="py-1 text-xs text-muted-foreground">
                            + {sec.bullets.length - 8} more sub-topics…
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button className="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-accent"
                onClick={() => setStep('pick')} type="button">
                ← Back
              </button>
              <button
                className="rounded-xl bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-85"
                onClick={() => void handleImport()} type="button"
              >
                Import {totalBullets} sub-topics + {totalPages} pages →
              </button>
            </div>
          </div>
        ) : null}

        {/* ── Step: importing ────────────────────────────────────────────── */}
        {step === 'importing' && plan ? (
          <div className="flex flex-col items-center py-8 text-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <h2 className="text-lg font-bold">Importing…</h2>
            {progress ? (
              <>
                <p className="text-sm text-muted-foreground max-w-xs">{progress.step}</p>
                <div className="h-2 w-64 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-500"
                    style={{ width: `${Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{progress.current} / {progress.total}</p>
              </>
            ) : null}
          </div>
        ) : null}

        {/* ── Step: done ─────────────────────────────────────────────────── */}
        {step === 'done' && plan ? (
          <div className="flex flex-col items-center py-8 text-center gap-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <h2 className="text-lg font-bold">Import complete!</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              <strong>{plan.topicName}</strong> was created with {plan.sections.length} subtopics,{' '}
              {totalBullets} nested sub-topics visible in the sidebar,
              and {totalPages} individual pages.
            </p>
            <div className="flex gap-2 mt-2">
              <button className="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-accent" onClick={handleClose} type="button">
                Close
              </button>
              {createdId ? (
                <button
                  className="rounded-xl bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-85"
                  onClick={() => { handleClose(); navigate(`/topic/${createdId}`) }}
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

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function flattenTree(nodes: Topic[], depth = 0): Array<{ id: string; name: string; indent: string }> {
  return nodes.flatMap((node) => {
    const indent = '\u00A0\u00A0'.repeat(depth)
    return [
      { id: node.id, name: node.name, indent },
      ...flattenTree((node.children ?? []) as Topic[], depth + 1),
    ]
  })
}
