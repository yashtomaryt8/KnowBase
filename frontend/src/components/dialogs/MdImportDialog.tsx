/**
 * MdImportDialog.tsx — Multi-file Markdown importer
 *
 * Drop or browse up to 20 .md files at once.
 * After a preview of every file's topic tree, all files are imported
 * in parallel — files run concurrently, and within each file the bullets
 * are processed in batches of 5 (see mdImport.ts).
 *
 * Flow:
 *   pick → preview (all files listed, expandable) → importing → done
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Upload,
  X,
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
  type MdImportPlan,
} from '../../lib/mdImport'
import type { Topic } from '../../types'
import { cn } from '../../utils/cn'

// ── Types ──────────────────────────────────────────────────────────────────

type Step = 'pick' | 'preview' | 'importing' | 'done'

/** State tracked per file during import */
interface FileImportState {
  fileName:  string
  plan:      MdImportPlan
  progress:  ImportProgress | null
  status:    'pending' | 'running' | 'done' | 'error'
  createdId: string | null
  error:     string | null
}

type MdImportDialogProps = {
  open:      boolean
  onClose:   () => void
  onSuccess: () => void
}

// ── Component ──────────────────────────────────────────────────────────────

export function MdImportDialog({ open, onClose, onSuccess }: MdImportDialogProps) {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep]         = useState<Step>('pick')
  const [files, setFiles]       = useState<FileImportState[]>([])
  const [parentId, setParentId] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  // Which file previews are expanded in the tree list
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set([0]))
  const [expandedSections, setExpandedSections] = useState<Map<string, Set<number>>>(new Map())

  const { data: tree = [] } = useQuery<Topic[]>({
    queryKey: ['topics', 'tree'],
    queryFn:  () => getTopicTree(),
    staleTime: 60_000,
    enabled: open,
  })
  const flatTopics = flattenTree(tree)

  // ── Helpers ──────────────────────────────────────────────────────────────

  const reset = () => {
    setStep('pick'); setFiles([]); setParentId(null)
    setIsDragOver(false); setExpandedFiles(new Set([0]))
    setExpandedSections(new Map())
  }

  const handleClose = () => { reset(); onClose() }

  const toggleFileExpand = (idx: number) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const toggleSectionExpand = (fileIdx: number, secIdx: number) => {
    setExpandedSections((prev) => {
      const next = new Map(prev)
      const key  = String(fileIdx)
      const set  = new Set(next.get(key) ?? [])
      set.has(secIdx) ? set.delete(secIdx) : set.add(secIdx)
      next.set(key, set)
      return next
    })
  }

  // ── File reading ──────────────────────────────────────────────────────────

  const processFiles = useCallback((rawFiles: File[]) => {
    const mdFiles = rawFiles.filter((f) => /\.(md|markdown)$/i.test(f.name))
    if (!mdFiles.length) {
      toast.error('No .md files selected')
      return
    }
    if (mdFiles.length > 20) {
      toast.warning('Maximum 20 files at once. First 20 will be used.')
      mdFiles.splice(20)
    }

    let loaded = 0
    const results: Array<FileImportState | null> = new Array(mdFiles.length).fill(null)

    mdFiles.forEach((file, idx) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = (e.target?.result as string) ?? ''
        try {
          const plan = parseMdFile(text)
          results[idx] = {
            fileName:  file.name,
            plan,
            progress:  null,
            status:   'pending',
            createdId: null,
            error:     null,
          }
        } catch {
          results[idx] = {
            fileName:  file.name,
            plan:      { topicName: file.name, sections: [] },
            progress:  null,
            status:   'error',
            createdId: null,
            error:     'Could not parse this file',
          }
        }
        loaded++
        if (loaded === mdFiles.length) {
          const valid = results.filter((r): r is FileImportState => r !== null)
          if (!valid.length) { toast.error('No valid .md files'); return }
          setFiles(valid)
          setExpandedFiles(new Set([0]))
          setStep('preview')
        }
      }
      reader.readAsText(file)
    })
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files ?? [])
    if (raw.length) processFiles(raw)
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    processFiles(Array.from(e.dataTransfer.files))
  }, [processFiles])

  // ── Import ────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    const validFiles = files.filter((f) => f.plan.sections.length > 0)
    if (!validFiles.length) return

    setStep('importing')

    // Run all files in parallel
    await Promise.allSettled(
      validFiles.map(async (fileState, idx) => {
        // Mark this file as running
        setFiles((prev) => prev.map((f, i) =>
          i === idx ? { ...f, status: 'running' } : f,
        ))

        try {
          const topicId = await executeMdImport(
            fileState.plan,
            parentId,
            (p: ImportProgress) => {
              setFiles((prev) => prev.map((f, i) =>
                i === idx ? { ...f, progress: p } : f,
              ))
            },
          )
          setFiles((prev) => prev.map((f, i) =>
            i === idx ? { ...f, status: 'done', createdId: topicId } : f,
          ))
        } catch (err) {
          console.error(`Import failed for ${fileState.fileName}:`, err)
          setFiles((prev) => prev.map((f, i) =>
            i === idx ? { ...f, status: 'error', error: 'Import failed' } : f,
          ))
        }
      }),
    )

    // Refresh sidebar
    await queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
    onSuccess()
    setStep('done')
  }

  // ── Aggregate stats ───────────────────────────────────────────────────────

  const validFiles   = files.filter((f) => f.plan.sections.length > 0)
  const totalSubtopics = validFiles.reduce((s, f) => s + f.plan.sections.length, 0)
  const totalBullets   = validFiles.reduce((s, f) =>
    s + f.plan.sections.reduce((ss, sec) => ss + sec.bullets.length, 0), 0)
  const totalPages     = validFiles.reduce((s, f) =>
    s + f.plan.sections.reduce((ss, sec) =>
      ss + sec.bullets.reduce((bs, b) => bs + b.pages.length, 0), 0), 0)

  const doneCount  = files.filter((f) => f.status === 'done').length
  const errorCount = files.filter((f) => f.status === 'error').length


  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border/70 bg-background shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {step !== 'importing' && (
          <button
            className="absolute right-4 top-4 z-10 rounded-xl p-2 transition hover:bg-accent"
            onClick={handleClose} type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP: PICK
            ══════════════════════════════════════════════════════════════════ */}
        {step === 'pick' && (
          <div className="flex flex-col gap-5 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Bulk Import</p>
              <h2 className="mt-1.5 text-xl font-bold">Import Markdown files</h2>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Drop up to <strong>20 .md files</strong> at once — they all import in parallel.
                Each file needs a <code className="rounded bg-accent px-1 font-mono text-xs">#</code> topic,{' '}
                <code className="rounded bg-accent px-1 font-mono text-xs">##</code> subtopics,
                and <code className="rounded bg-accent px-1 font-mono text-xs">- bullets</code>.
              </p>
            </div>

            {/* Drop zone */}
            <div
              className={cn(
                'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-8 py-10 transition',
                isDragOver
                  ? 'border-foreground/50 bg-accent'
                  : 'border-border hover:border-foreground/25 hover:bg-accent/40',
              )}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Drop .md files here</p>
                <p className="mt-1 text-sm text-muted-foreground">or click to browse — up to 20 files at once</p>
              </div>
            </div>
            <input
              ref={fileInputRef} type="file" accept=".md,.markdown"
              multiple className="hidden" onChange={handleFileInput}
            />

            {/* Format hint */}
            <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expected format</p>
              <pre className="font-mono text-xs leading-5 text-muted-foreground">{`# Topic Name\n## Subtopic One\n- Concept A (item1 · item2 · item3)\n- Concept B\n---\n## Subtopic Two\n- Simple Item`}</pre>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP: PREVIEW
            ══════════════════════════════════════════════════════════════════ */}
        {step === 'preview' && files.length > 0 && (
          <div className="flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 border-b border-border/70 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </p>
              <h2 className="mt-1 text-xl font-bold">Preview import</h2>

              {/* Aggregate stats */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { label: 'Files',      value: files.length },
                  { label: 'Subtopics',  value: totalSubtopics },
                  { label: 'Sub-topics', value: totalBullets },
                  { label: 'Pages',      value: totalPages },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-center">
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Parent selector */}
              <div className="mt-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="parent-sel">
                  Import under (optional)
                </label>
                <select
                  id="parent-sel"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
                  value={parentId ?? ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                >
                  <option value="">— Create at root level —</option>
                  {flatTopics.map((t) => (
                    <option key={t.id} value={t.id}>{t.indent}{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File list (scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
              {files.map((f, fi) => {
                const fBullets = f.plan.sections.reduce((s, sec) => s + sec.bullets.length, 0)
                const isExpanded = expandedFiles.has(fi)
                const hasError   = f.plan.sections.length === 0 || f.status === 'error'

                return (
                  <div key={fi} className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
                    {/* File header row */}
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-accent/40"
                      onClick={() => toggleFileExpand(fi)}
                      type="button"
                    >
                      {isExpanded
                        ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm font-medium">{f.fileName}</span>
                      {hasError ? (
                        <span className="shrink-0 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-red-500">
                          {f.error ?? 'No sections'}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {f.plan.sections.length} subtopics · {fBullets} sub-topics
                        </span>
                      )}
                    </button>

                    {/* Expanded tree preview */}
                    {isExpanded && !hasError && (
                      <div className="border-t border-border/50 px-4 pb-3 pt-2">
                        {/* Root */}
                        <div className="flex items-center gap-2 py-1">
                          <span className="text-sm">📁</span>
                          <span className="text-sm font-semibold">{f.plan.topicName}</span>
                          <span className="ml-auto text-[10px] text-muted-foreground">root topic</span>
                        </div>
                        {/* Sections */}
                        {f.plan.sections.map((sec, si) => {
                          const secKey   = String(fi)
                          const secExpanded = expandedSections.get(secKey)?.has(si) ?? false
                          return (
                            <div key={si} className="ml-4">
                              <button
                                className="flex w-full items-center gap-1.5 rounded-lg py-1 text-sm transition hover:bg-accent/40"
                                onClick={() => toggleSectionExpand(fi, si)}
                                type="button"
                              >
                                <span className="text-muted-foreground">
                                  {secExpanded
                                    ? <ChevronDown className="h-3 w-3" />
                                    : <ChevronRight className="h-3 w-3" />}
                                </span>
                                <span>📂</span>
                                <span className="flex-1 text-left text-xs font-medium">{sec.title}</span>
                                <span className="text-[10px] text-muted-foreground">{sec.bullets.length} sub-topics</span>
                              </button>
                              {secExpanded && (
                                <div className="ml-5 border-l border-border/50 pl-3">
                                  {sec.bullets.slice(0, 6).map((b, bi) => (
                                    <div key={bi} className="flex items-center gap-2 py-0.5 text-xs">
                                      <span>📄</span>
                                      <span className="flex-1 truncate text-foreground">{b.title}</span>
                                      <span className="text-muted-foreground">{b.pages.length}p</span>
                                    </div>
                                  ))}
                                  {sec.bullets.length > 6 && (
                                    <div className="py-0.5 text-[11px] text-muted-foreground">
                                      + {sec.bullets.length - 6} more…
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer actions */}
            <div className="shrink-0 border-t border-border/70 px-6 py-4 flex items-center justify-between gap-3">
              <button
                className="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-accent"
                onClick={() => setStep('pick')} type="button"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                {errorCount > 0 && (
                  <span className="text-xs text-red-500">{errorCount} file{errorCount > 1 ? 's' : ''} skipped</span>
                )}
                <button
                  className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-85 disabled:opacity-40"
                  disabled={validFiles.length === 0}
                  onClick={() => void handleImport()}
                  type="button"
                >
                  Import {validFiles.length} file{validFiles.length > 1 ? 's' : ''} → {totalBullets} sub-topics + {totalPages} pages
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP: IMPORTING
            ══════════════════════════════════════════════════════════════════ */}
        {step === 'importing' && (
          <div className="flex flex-col overflow-hidden">
            <div className="shrink-0 border-b border-border/70 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Importing in parallel…</p>
              <h2 className="mt-1 text-xl font-bold">{files.length} file{files.length > 1 ? 's' : ''}</h2>
              {/* Overall progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{doneCount + errorCount} / {files.length} files complete</span>
                  <span>{Math.round(((doneCount + errorCount) / Math.max(files.length, 1)) * 100)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${((doneCount + errorCount) / Math.max(files.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Per-file progress list */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
              {files.map((f, fi) => {
                const pct = f.progress
                  ? Math.round((f.progress.current / Math.max(f.progress.total, 1)) * 100)
                  : 0

                return (
                  <div key={fi} className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      {f.status === 'done' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                      {f.status === 'error' && <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
                      {f.status === 'running' && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
                      {f.status === 'pending' && <div className="h-4 w-4 shrink-0 rounded-full border-2 border-border" />}
                      <span className="flex-1 truncate text-sm font-medium">{f.fileName}</span>
                      <span className={cn(
                        'shrink-0 text-xs font-semibold',
                        f.status === 'done'    && 'text-emerald-500',
                        f.status === 'error'   && 'text-red-500',
                        f.status === 'running' && 'text-muted-foreground',
                        f.status === 'pending' && 'text-muted-foreground/50',
                      )}>
                        {f.status === 'done' ? 'Done ✓'
                          : f.status === 'error' ? 'Failed'
                          : f.status === 'running' ? `${pct}%`
                          : 'Queued'}
                      </span>
                    </div>

                    {/* Per-file progress bar */}
                    {(f.status === 'running' || f.status === 'done') && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            f.status === 'done' ? 'bg-emerald-500' : 'bg-sky-400',
                          )}
                          style={{ width: `${f.status === 'done' ? 100 : pct}%` }}
                        />
                      </div>
                    )}

                    {/* Current action label */}
                    {f.status === 'running' && f.progress && (
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">{f.progress.step}</p>
                    )}

                    {/* Error message */}
                    {f.status === 'error' && (
                      <p className="mt-1 text-[11px] text-red-500">{f.error}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP: DONE
            ══════════════════════════════════════════════════════════════════ */}
        {step === 'done' && (
          <div className="flex flex-col p-6">
            <div className="flex flex-col items-center py-6 text-center gap-3">
              {errorCount === 0 ? (
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              ) : doneCount > 0 ? (
                <AlertCircle className="h-12 w-12 text-amber-500" />
              ) : (
                <AlertCircle className="h-12 w-12 text-red-500" />
              )}
              <h2 className="text-xl font-bold">
                {errorCount === 0
                  ? `All ${doneCount} file${doneCount > 1 ? 's' : ''} imported!`
                  : doneCount > 0
                    ? `${doneCount} imported, ${errorCount} failed`
                    : 'Import failed'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                {doneCount > 0 && (
                  <>{doneCount} topic{doneCount > 1 ? 's' : ''} created with {totalSubtopics} subtopics,{' '}
                  {totalBullets} nested sub-topics, and {totalPages} pages total.</>
                )}
              </p>
            </div>

            {/* Per-file summary */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4">
              {files.map((f, fi) => (
                <div key={fi} className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
                  {f.status === 'done'
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    : <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
                  <span className="flex-1 truncate text-sm">{f.fileName}</span>
                  {f.status === 'done'
                    ? <span className="text-xs text-emerald-500 font-medium">Imported</span>
                    : <span className="text-xs text-red-500">{f.error}</span>}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-accent"
                onClick={handleClose} type="button"
              >
                Close
              </button>
              {/* Go to first successfully created topic */}
              {files.find((f) => f.createdId) && (
                <button
                  className="rounded-xl bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-85"
                  onClick={() => {
                    const first = files.find((f) => f.createdId)
                    if (first?.createdId) { handleClose(); navigate(`/topic/${first.createdId}`) }
                  }}
                  type="button"
                >
                  Go to first topic →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function flattenTree(nodes: Topic[], depth = 0): Array<{ id: string; name: string; indent: string }> {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, indent: '\u00A0\u00A0'.repeat(depth) },
    ...flattenTree((node.children ?? []) as Topic[], depth + 1),
  ])
}
