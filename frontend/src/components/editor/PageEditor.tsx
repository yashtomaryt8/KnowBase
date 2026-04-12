  /**
 * PageEditor.tsx
 *
 * Word / OneNote–style editing experience:
 *  • The formatting toolbar is STICKY — it stays pinned to the top of the
 *    scrollable <main> container as you scroll down through long documents.
 *    This uses CSS `position: sticky; top: 0` inside the overflow-y-auto
 *    main scroll container (no JS scroll listeners needed).
 *  • A Document Outline panel (heading navigator) appears on the right side
 *    of wide screens — equivalent to Word's Navigation Pane.
 *  • Tables are click-to-edit: clicking any cell shows the Table toolbar row
 *    because TipTap's cursor tracking fires editor.isActive('table').
 *  • Typography extension removed to fix double-quote input bug.
 */

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  ChevronDown,
  Code2,
  Download,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  PanelRight,
  Quote,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { common, createLowlight } from 'lowlight'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ComponentType, ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { exportPageAsDocx, exportPageAsPdf } from '../../lib/exportPage'
import { usePageShortcutStore } from '../../store/pageShortcutStore'
import type { Page } from '../../types'
import { cn } from '../../utils/cn'

const lowlight = createLowlight(common)

const TEXT_STYLES = [
  { label: 'Normal text', value: 'paragraph', hint: '—'       },
  { label: 'Heading 1',   value: 'h1',        hint: '2 rem'   },
  { label: 'Heading 2',   value: 'h2',        hint: '1.5 rem' },
  { label: 'Heading 3',   value: 'h3',        hint: '1.25 rem'},
  { label: 'Heading 4',   value: 'h4',        hint: '1.1 rem' },
  { label: 'Heading 5',   value: 'h5',        hint: '1 rem'   },
] as const
type TextStyleValue = (typeof TEXT_STYLES)[number]['value']

type SavePayload = {
  title?: string
  content_json?: Record<string, unknown>
  content_text?: string
  word_count?: number
}

type PageEditorProps = {
  page: Page
  onSave: (data: SavePayload) => Promise<void>
  onDelete?: () => void
  isDeleting?: boolean
}

// ── Heading type for the document outline ─────────────────────────────────

interface OutlineHeading {
  level: number
  text:  string
  index: number  // position in the heading list (for scrolling)
}

export function PageEditor({ page, onSave, onDelete, isDeleting }: PageEditorProps) {
  const [title, setTitle]         = useState(page.title)
  const [mode, setMode]           = useState<'read' | 'edit'>('read')
  const [dirty, setDirty]         = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [menuOpen, setMenuOpen]   = useState(false)
  const [outlineOpen, setOutlineOpen] = useState(false)  // outline panel toggle
  const [headings, setHeadings]   = useState<OutlineHeading[]>([])
  const [activeHeading, setActiveHeading] = useState(0)

  const fileInputRef   = useRef<HTMLInputElement | null>(null)
  const saveTimeoutRef = useRef<number | null>(null)
  const latestTitleRef = useRef(page.title)
  const modeRef        = useRef<'read' | 'edit'>('read')
  const dirtyRef       = useRef(false)
  const lastSavedRef   = useRef({
    title:        page.title,
    content_json: page.content_json,
    content_text: page.content_text,
    word_count:   page.word_count,
  })
  const { registerPageShortcutActions, clearPageShortcutActions } = usePageShortcutStore()

  const setDirtyState = (v: boolean) => { dirtyRef.current = v; setDirty(v) }

  const syncDirtyState = (ed: Editor | null) => {
    const titleDirty   = latestTitleRef.current.trim() !== lastSavedRef.current.title
    const contentDirty = ed !== null && (
      JSON.stringify(ed.getJSON()) !== JSON.stringify(lastSavedRef.current.content_json) ||
      ed.getText()  !== lastSavedRef.current.content_text ||
      countWords(ed.getText()) !== lastSavedRef.current.word_count
    )
    setDirtyState(titleDirty || contentDirty)
  }

  useEffect(() => {
    setTitle(page.title)
    latestTitleRef.current = page.title
    modeRef.current        = 'read'
    lastSavedRef.current   = {
      title: page.title, content_json: page.content_json,
      content_text: page.content_text, word_count: page.word_count,
    }
    setDirtyState(false)
  }, [page])

  // ── Extract headings from the editor for the document outline ──────────

  const extractHeadings = useCallback((ed: Editor) => {
    const json  = ed.getJSON()
    const found: OutlineHeading[] = []
    let idx = 0

    const walk = (nodes: Array<{ type?: string; attrs?: Record<string, unknown>; content?: typeof nodes }>) => {
      for (const node of nodes ?? []) {
        if (node.type === 'heading') {
          const level = (node.attrs?.level as number) ?? 1
          const text  = (node.content ?? [])
            .filter((n) => n.type === 'text')
            .map((n) => (n as { text?: string }).text ?? '')
            .join('')
          if (text.trim()) found.push({ level, text: text.trim(), index: idx++ })
        }
        if (node.content) walk(node.content)
      }
    }

    walk(json.content as typeof json.content ?? [])
    setHeadings(found)
  }, [])

  const editor = useEditor({
    autofocus: false,
    immediatelyRender: false,
    editable: mode === 'edit',
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Underline,
      Link.configure({ openOnClick: false }),
      // Typography intentionally omitted — it breaks double-quote key
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: page.content_json,
    onCreate: ({ editor: ed }) => { extractHeadings(ed) },
    onUpdate: ({ editor: ed }) => {
      setSaveState('saving')
      syncDirtyState(ed)
      extractHeadings(ed)

      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = window.setTimeout(async () => {
        const contentText = ed.getText()
        const payload = { content_json: ed.getJSON(), content_text: contentText, word_count: countWords(contentText) }
        try {
          await onSave(payload)
          lastSavedRef.current = { ...lastSavedRef.current, ...payload }
          syncDirtyState(ed)
          setSaveState('saved')
          window.setTimeout(() => setSaveState('idle'), 1200)
        } catch { setSaveState('idle'); syncDirtyState(ed) }
      }, 1500)
    },
  })

  useEffect(() => { if (editor) editor.setEditable(mode === 'edit') }, [editor, mode])
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current) }, [])

  // Extract headings when switching to read mode (content might have changed)
  useEffect(() => { if (editor) extractHeadings(editor) }, [editor, mode, extractHeadings])

  const flushEditorSave = async () => {
    if (!editor) return
    if (saveTimeoutRef.current) { window.clearTimeout(saveTimeoutRef.current); saveTimeoutRef.current = null }
    const contentText = editor.getText()
    const payload = { content_json: editor.getJSON(), content_text: contentText, word_count: countWords(contentText) }
    if (
      JSON.stringify(payload.content_json) === JSON.stringify(lastSavedRef.current.content_json) &&
      payload.content_text === lastSavedRef.current.content_text &&
      payload.word_count   === lastSavedRef.current.word_count
    ) { syncDirtyState(editor); return }
    setSaveState('saving')
    await onSave(payload)
    lastSavedRef.current = { ...lastSavedRef.current, ...payload }
    syncDirtyState(editor)
    setSaveState('saved')
    window.setTimeout(() => setSaveState('idle'), 1200)
  }

  const saveTitle = async () => {
    const nextTitle = latestTitleRef.current.trim()
    if (!nextTitle || nextTitle === lastSavedRef.current.title) {
      setTitle(lastSavedRef.current.title)
      latestTitleRef.current = lastSavedRef.current.title
      syncDirtyState(editor)
      return
    }
    setSaveState('saving')
    await onSave({ title: nextTitle })
    setTitle(nextTitle)
    lastSavedRef.current = { ...lastSavedRef.current, title: nextTitle }
    syncDirtyState(editor)
    setSaveState('saved')
    window.setTimeout(() => setSaveState('idle'), 1200)
  }

  const saveAll = async () => {
    await Promise.all([flushEditorSave(), saveTitle()])
    syncDirtyState(editor)
  }

  const toggleMode = () => {
    if (mode === 'edit') {
      // Switch to read mode IMMEDIATELY — never block on a network call
      setMode('read')
      modeRef.current = 'read'
      if (editor) {
        editor.commands.blur()
        editor.setEditable(false)
      }
      // Save in background (non-blocking)
      saveAll().catch(console.error)
      return
    }
    // Switch to edit mode
    setMode('edit')
    modeRef.current = 'edit'
    if (editor) {
      editor.setEditable(true)
      setTimeout(() => editor.commands.focus('end'), 30)
    }
  }

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject()
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    editor.chain().focus().setImage({ src: url }).run()
    event.target.value = ''
  }

  useEffect(() => {
    if (!editor) return
    registerPageShortcutActions(page.id, {
      isDirty:    () => dirtyRef.current,
      isEditMode: () => modeRef.current === 'edit',
      save: saveAll, toggleMode,
    })
    return () => clearPageShortcutActions(page.id)
  }, [clearPageShortcutActions, editor, page.id, registerPageShortcutActions])

  // Scroll the editor DOM to the heading matching outline item click
  const scrollToHeading = useCallback((heading: OutlineHeading) => {
    if (!editor) return
    const editorEl = editor.view.dom
    const allHeadings = editorEl.querySelectorAll('h1,h2,h3,h4,h5,h6')
    let count = 0
    for (const el of Array.from(allHeadings)) {
      if (el.textContent?.trim() === heading.text) {
        if (count === heading.index || count >= heading.index) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          setActiveHeading(heading.index)
          break
        }
        count++
      }
    }
  }, [editor])

  const exportPayload = {
    title:        page.title,
    content_json: page.content_json as Record<string, unknown> | undefined,
    content_text: page.content_text,
  }

  const showOutline = headings.length > 0

  return (
    <div className="relative">
      {/* ══ STICKY PAGE HEADER ═════════════════════════════════════════════════
          Row 1 (always visible): breadcrumb + action buttons (Edit/Done, etc.)
          Row 2 (edit mode only): format toolbar
          Both are inside one sticky container so they always stay pinned
          to the very top of the <main> scroll viewport.                    */}
      <div className="page-sticky-header">
        {/* ── Row 1: Controls ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
            <span className="max-w-[90px] truncate sm:max-w-[160px]">{page.topic_name ?? 'Topic'}</span>
            <span className="opacity-35">/</span>
            <span className="max-w-[120px] truncate font-medium text-foreground sm:max-w-[220px]">
              {title || page.title}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Save state pill */}
            <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground sm:flex">
              <span className={cn('h-1.5 w-1.5 rounded-full',
                dirty                  ? 'bg-amber-400'
                : saveState === 'saved'  ? 'bg-emerald-500'
                : saveState === 'saving' ? 'animate-pulse bg-sky-400'
                :                          'bg-slate-400')} />
              {dirty ? 'Unsaved' : saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Idle'}
            </div>

            {/* Word count */}
            <div className="hidden rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground md:block">
              {(page.word_count ?? 0).toLocaleString()} words
            </div>

            {/* Edit / Done */}
            <button
              className={cn('rounded-xl border px-4 py-1.5 text-sm font-medium transition',
                mode === 'edit'
                  ? 'border-foreground/25 bg-foreground text-background hover:opacity-85'
                  : 'border-border bg-background hover:bg-accent')}
              onClick={() => void toggleMode()}
              type="button"
            >
              {mode === 'edit' ? 'Done' : 'Edit'}
            </button>

            {/* Delete */}
            {onDelete ? (
              <button
                className="flex items-center gap-1.5 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-1.5 text-sm text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                onClick={onDelete} disabled={isDeleting} type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isDeleting ? 'Deleting…' : 'Delete'}</span>
              </button>
            ) : null}

            {/* Export */}
            <div className="relative">
              <button
                className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-sm transition hover:bg-accent"
                onClick={() => setMenuOpen((v) => !v)} type="button"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              {menuOpen ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-border bg-background p-2 shadow-2xl">
                    <button className="block w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-accent"
                      onClick={() => { void exportPageAsDocx(exportPayload); setMenuOpen(false) }} type="button">
                      📄 Download .docx
                    </button>
                    <button className="block w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-accent"
                      onClick={() => { exportPageAsPdf(exportPayload); setMenuOpen(false) }} type="button">
                      📑 Download .pdf
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Row 2: Format toolbar (edit mode only) ────────────────────── */}
        {mode === 'edit' && editor ? (
          <>
            <div className="editor-toolbar-inner border-t border-border/50">
              <StyleDropdown editor={editor} />
              <Sep />
              <TBtn active={editor.isActive('bold')}      icon={Bold}          label="Bold"      onClick={() => editor.chain().focus().toggleBold().run()} />
              <TBtn active={editor.isActive('italic')}    icon={Italic}        label="Italic"    onClick={() => editor.chain().focus().toggleItalic().run()} />
              <TBtn active={editor.isActive('underline')} icon={UnderlineIcon} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} />
              <TBtn active={editor.isActive('highlight')} icon={Highlighter}   label="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} />
              <Sep />
              <TBtn active={editor.isActive('bulletList')}  icon={List}        label="Bullets"  onClick={() => editor.chain().focus().toggleBulletList().run()} />
              <TBtn active={editor.isActive('orderedList')} icon={ListOrdered} label="Numbers"  onClick={() => editor.chain().focus().toggleOrderedList().run()} />
              <TBtn active={editor.isActive('taskList')}    icon={CheckSquare} label="Tasks"    onClick={() => editor.chain().focus().toggleTaskList().run()} />
              <TBtn active={editor.isActive('codeBlock')}   icon={Code2}       label="Code"     onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
              <TBtn active={editor.isActive('blockquote')}  icon={Quote}       label="Quote"    onClick={() => editor.chain().focus().toggleBlockquote().run()} />
              <Sep />
              <TBtn active={false}                      icon={ImagePlus} label="Image" onClick={() => fileInputRef.current?.click()} />
              <TBtn active={editor.isActive('table')}   icon={TableIcon} label="Table"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
              <Sep />
              <TBtn active={editor.isActive({ textAlign: 'left' })}   icon={AlignLeft}   label="Left"   onClick={() => editor.chain().focus().setTextAlign('left').run()} />
              <TBtn active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} label="Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} />
              <TBtn active={editor.isActive({ textAlign: 'right' })}  icon={AlignRight}  label="Right"  onClick={() => editor.chain().focus().setTextAlign('right').run()} />
              {showOutline ? (
                <><Sep /><TBtn active={outlineOpen} icon={PanelRight} label="Outline" onClick={() => setOutlineOpen((v) => !v)} /></>
              ) : null}
            </div>
            {/* Table controls row */}
            {editor.isActive('table') ? (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 bg-muted/30 px-3 py-1.5">
                <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Table</span>
                <Mini onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Col ←</Mini>
                <Mini onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col →</Mini>
                <Mini onClick={() => editor.chain().focus().addRowBefore().run()}>+ Row ↑</Mini>
                <Mini onClick={() => editor.chain().focus().addRowAfter().run()}>+ Row ↓</Mini>
                <Mini onClick={() => editor.chain().focus().deleteColumn().run()} danger>− Col</Mini>
                <Mini onClick={() => editor.chain().focus().deleteRow().run()} danger>− Row</Mini>
                <Mini onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header</Mini>
                <Mini onClick={() => editor.chain().focus().mergeOrSplit().run()}>Merge/Split</Mini>
                <Mini onClick={() => editor.chain().focus().deleteTable().run()} danger>Delete</Mini>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {/* ══ SCROLLABLE PAGE BODY ═════════════════════════════════════════════
          The title + content area scrolls freely while the header above stays
          pinned. The outline panel uses position:sticky relative to <main>. */}
      <div className={cn(
        'mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10',
        outlineOpen && showOutline ? 'max-w-5xl' : 'max-w-4xl',
      )}>
        <div className={cn(
          'flex gap-6',
          outlineOpen && showOutline ? 'xl:grid xl:grid-cols-[1fr_14rem]' : '',
        )}>
          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Large page title */}
            <input
              className="mb-5 w-full bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground sm:text-4xl"
              style={{ fontFamily: 'var(--font-reading)', lineHeight: 1.22 }}
              onBlur={() => void saveTitle()}
              onChange={(e) => { setTitle(e.target.value); latestTitleRef.current = e.target.value; syncDirtyState(editor) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void saveTitle() } }}
              placeholder="Untitled"
              readOnly={mode !== 'edit'}
              value={title}
            />

            {/* Editor content */}
            <div className="rounded-2xl border border-border/70 bg-background/80 px-6 py-8 shadow-sm sm:px-8 sm:py-10">
              <EditorContent
                className="prose prose-slate max-w-none dark:prose-invert"
                editor={editor}
              />
            </div>
          </div>

          {/* Document Outline Panel */}
          {outlineOpen && showOutline ? (
            <div className="hidden xl:block">
              <div className="doc-outline rounded-2xl border border-border/70 bg-background/60 p-3">
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Outline
                </p>
                {headings.map((h) => (
                  <button
                    key={h.index}
                    className={cn('outline-item', `h${h.level}`, h.index === activeHeading && 'active')}
                    onClick={() => scrollToHeading(h)}
                    type="button"
                    title={h.text}
                  >
                    {h.text}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Selection bubble menu */}
      {editor && mode === 'edit' ? <SelectionBubbleMenu editor={editor} /> : null}

      <input
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleImageSelect(e)}
        ref={fileInputRef}
        type="file"
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   STYLE DROPDOWN — selects heading level or normal text
   ══════════════════════════════════════════════════════════════════════════════ */

function StyleDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)

  const active: TextStyleValue =
    editor.isActive('heading', { level: 1 }) ? 'h1' :
    editor.isActive('heading', { level: 2 }) ? 'h2' :
    editor.isActive('heading', { level: 3 }) ? 'h3' :
    editor.isActive('heading', { level: 4 }) ? 'h4' :
    editor.isActive('heading', { level: 5 }) ? 'h5' : 'paragraph'

  const label = TEXT_STYLES.find((s) => s.value === active)?.label ?? 'Normal text'

  const apply = (value: TextStyleValue) => {
    if (value === 'paragraph') editor.chain().focus().setParagraph().run()
    else {
      const lvl = parseInt(value.replace('h', ''), 10) as 1|2|3|4|5
      editor.chain().focus().toggleHeading({ level: lvl }).run()
    }
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium transition hover:bg-accent whitespace-nowrap"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className="min-w-[82px] text-left">{label}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1.5 w-52 rounded-2xl border border-border bg-background p-1.5 shadow-2xl">
            {TEXT_STYLES.map((s) => (
              <button
                key={s.value}
                className={cn('flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-accent',
                  active === s.value && 'bg-accent font-semibold')}
                onClick={() => apply(s.value)}
                type="button"
              >
                <span>{s.label}</span>
                <span className="text-[10px] text-muted-foreground">{s.hint}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

/* ── Toolbar atoms ─────────────────────────────────────────────────────────── */

function Sep() { return <div className="mx-0.5 h-5 w-px bg-border/60 shrink-0" /> }

function TBtn({ active, icon: Icon, label, onClick }: {
  active: boolean; icon: ComponentType<{ className?: string }>; label: string; onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg p-2 transition shrink-0',
        active
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function Mini({ onClick, children, danger = false }: { onClick: () => void; children: ReactNode; danger?: boolean }) {
  return (
    <button
      className={cn('rounded-lg border px-2 py-1 text-xs font-medium transition',
        danger ? 'border-red-400/30 text-red-500 hover:bg-red-400/10'
               : 'border-border hover:bg-accent')}
      onClick={onClick}
      type="button"
    >{children}</button>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   FLOATING SELECTION BUBBLE MENU
   ══════════════════════════════════════════════════════════════════════════════ */

function SelectionBubbleMenu({ editor }: { editor: Editor }) {
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    const update = () => {
      if (!editor.isFocused || editor.state.selection.empty) { setPosition(null); return }
      const { from, to } = editor.state.selection
      const s = editor.view.coordsAtPos(from)
      const e = editor.view.coordsAtPos(to)
      setPosition({ left: (s.left + e.right) / 2, top: Math.min(s.top, e.top) - 12 })
    }
    const hide = () => setPosition(null)
    update()
    editor.on('selectionUpdate', update)
    editor.on('focus', update)
    editor.on('blur', hide)
    return () => { editor.off('selectionUpdate', update); editor.off('focus', update); editor.off('blur', hide) }
  }, [editor])

  if (!position) return null

  return createPortal(
    <div
      className="fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-2xl border border-border bg-background/96 p-1.5 shadow-2xl backdrop-blur-sm"
      style={{ left: position.left, top: position.top }}
    >
      {[
        { active: editor.isActive('bold'),      icon: Bold,          fn: () => editor.chain().focus().toggleBold().run() },
        { active: editor.isActive('italic'),    icon: Italic,        fn: () => editor.chain().focus().toggleItalic().run() },
        { active: editor.isActive('underline'), icon: UnderlineIcon, fn: () => editor.chain().focus().toggleUnderline().run() },
        { active: editor.isActive('highlight'), icon: Highlighter,   fn: () => editor.chain().focus().toggleHighlight().run() },
        { active: editor.isActive('code'),      icon: Code2,         fn: () => editor.chain().focus().toggleCode().run() },
      ].map(({ active, icon: Icon, fn }, i) => (
        <button key={i}
          className={cn('rounded-xl p-2 transition',
            active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
          onClick={fn} type="button">
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
      <button
        className={cn('rounded-xl p-2 transition',
          editor.isActive('link') ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
        onClick={() => {
          const prev = editor.getAttributes('link').href as string | undefined
          const url = window.prompt('URL', prev ?? 'https://')
          if (url === null) return
          if (url === '') { editor.chain().focus().unsetLink().run(); return }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
        type="button"
      >
        <Link2 className="h-3.5 w-3.5" />
      </button>
    </div>,
    document.body,
  )
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}
