/**
 * PageEditor.tsx
 *
 * Key changes vs original:
 *  - Typography extension REMOVED — it was auto-converting straight quotes to
 *    curly quotes which caused the double-quote key to stop working reliably.
 *    Plain " now types as-is, which is what most people expect.
 *  - TipTap Table extensions added with a contextual toolbar row.
 *  - Heading style dropdown (H1–H5 + Normal) added to toolbar.
 *  - Images are constrained by CSS; never overflow their container.
 *  - Export passes content_json so DOCX/PDF render structured content.
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
// NOTE: Typography extension intentionally NOT imported.
// It converted " and ' to smart-quotes via input rules which broke the
// double-quote key — you'd press " and get a curly open-quote that the
// rule fired at the wrong time, leaving a stray character.
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
  Quote,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { common, createLowlight } from 'lowlight'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ComponentType, ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { exportPageAsDocx, exportPageAsPdf } from '../../lib/exportPage'
import { usePageShortcutStore } from '../../store/pageShortcutStore'
import type { Page } from '../../types'
import { cn } from '../../utils/cn'

const lowlight = createLowlight(common)

const TEXT_STYLES = [
  { label: 'Normal text', value: 'paragraph', hint: '—'      },
  { label: 'Heading 1',   value: 'h1',        hint: '2 rem'  },
  { label: 'Heading 2',   value: 'h2',        hint: '1.5 rem'},
  { label: 'Heading 3',   value: 'h3',        hint: '1.25 rem'},
  { label: 'Heading 4',   value: 'h4',        hint: '1.1 rem'},
  { label: 'Heading 5',   value: 'h5',        hint: '1 rem'  },
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

export function PageEditor({ page, onSave, onDelete, isDeleting }: PageEditorProps) {
  const [title, setTitle]       = useState(page.title)
  const [mode, setMode]         = useState<'read' | 'edit'>('read')
  const [dirty, setDirty]       = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [menuOpen, setMenuOpen] = useState(false)
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
      ed.getText()  !== lastSavedRef.current.content_text                                ||
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
      // NO Typography extension — it breaks the double-quote key
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: page.content_json,
    onUpdate: ({ editor: ed }) => {
      setSaveState('saving')
      syncDirtyState(ed)
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

  const saveAll    = async () => { await Promise.all([flushEditorSave(), saveTitle()]); syncDirtyState(editor) }
  const toggleMode = async () => {
    if (modeRef.current === 'edit') { await saveAll(); setMode('read'); return }
    setMode('edit')
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

  /* ── Build the export payload — always pass content_json so the exporter
     can walk the TipTap node tree for proper heading/table/list rendering. */
  const exportPayload = {
    title:        page.title,
    content_json: page.content_json as Record<string, unknown> | undefined,
    content_text: page.content_text,
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>{page.topic_name ?? 'Topic'}</span>
        <span className="opacity-35">/</span>
        <span className="font-medium text-foreground">{title || page.title}</span>
      </div>

      {/* Title + controls row */}
      <div className="mb-6 flex flex-wrap items-start gap-3">
        <input
          className="min-w-0 flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-reading)', lineHeight: 1.2 }}
          onBlur={() => void saveTitle()}
          onChange={(e) => { setTitle(e.target.value); latestTitleRef.current = e.target.value; syncDirtyState(editor) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void saveTitle() } }}
          placeholder="Untitled"
          readOnly={mode !== 'edit'}
          value={title}
        />

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Save state pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
            <span className={cn('h-1.5 w-1.5 rounded-full',
              dirty               ? 'bg-amber-400'
              : saveState==='saved'  ? 'bg-emerald-500'
              : saveState==='saving' ? 'animate-pulse bg-sky-400'
              :                        'bg-slate-400')} />
            {dirty ? 'Unsaved' : saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Idle'}
          </div>

          {/* Word count */}
          <div className="hidden rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground sm:block">
            {(page.word_count ?? 0).toLocaleString()} words
          </div>

          {/* Edit / Done */}
          <button
            className={cn('rounded-xl border px-4 py-2 text-sm font-medium transition',
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
              className="flex items-center gap-1.5 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
              onClick={onDelete} disabled={isDeleting} type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isDeleting ? 'Deleting…' : 'Delete'}</span>
            </button>
          ) : null}

          {/* Export */}
          <div className="relative">
            <button
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm transition hover:bg-accent"
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

      {/* Editor toolbar */}
      {mode === 'edit' && editor ? (
        <EditorToolbar editor={editor} onImageUpload={() => fileInputRef.current?.click()} />
      ) : null}

      {editor && mode === 'edit' ? <SelectionBubbleMenu editor={editor} /> : null}

      {/* Content box */}
      <div className="rounded-2xl border border-border/70 bg-background/80 px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        <EditorContent
          className="prose prose-slate max-w-none dark:prose-invert"
          editor={editor}
        />
      </div>

      <input accept="image/*" className="hidden" onChange={(e) => void handleImageSelect(e)} ref={fileInputRef} type="file" />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   EDITOR TOOLBAR
   ══════════════════════════════════════════════════════════════════════════════ */

function EditorToolbar({ editor, onImageUpload }: { editor: Editor; onImageUpload: () => void }) {
  const [styleOpen, setStyleOpen] = useState(false)

  const activeStyle: TextStyleValue =
    editor.isActive('heading', { level: 1 }) ? 'h1' :
    editor.isActive('heading', { level: 2 }) ? 'h2' :
    editor.isActive('heading', { level: 3 }) ? 'h3' :
    editor.isActive('heading', { level: 4 }) ? 'h4' :
    editor.isActive('heading', { level: 5 }) ? 'h5' : 'paragraph'

  const activeLabel = TEXT_STYLES.find((s) => s.value === activeStyle)?.label ?? 'Normal text'

  const applyStyle = (value: TextStyleValue) => {
    if (value === 'paragraph') editor.chain().focus().setParagraph().run()
    else {
      const level = parseInt(value.replace('h', ''), 10) as 1|2|3|4|5
      editor.chain().focus().toggleHeading({ level }).run()
    }
    setStyleOpen(false)
  }

  return (
    <div className="mb-3 space-y-2">
      {/* Main toolbar row */}
      <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border/70 bg-background/95 px-2.5 py-2 shadow-sm">
        {/* Heading style dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-2.5 py-1.5 text-sm transition hover:bg-accent"
            onClick={() => setStyleOpen((v) => !v)} type="button"
          >
            <span className="min-w-[88px] text-left text-xs font-medium">{activeLabel}</span>
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          </button>
          {styleOpen ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStyleOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1.5 w-52 rounded-2xl border border-border bg-background p-1.5 shadow-2xl">
                {TEXT_STYLES.map((s) => (
                  <button
                    key={s.value}
                    className={cn('flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-accent',
                      activeStyle === s.value && 'bg-accent font-semibold')}
                    onClick={() => applyStyle(s.value)} type="button"
                  >
                    <span>{s.label}</span>
                    <span className="text-[10px] text-muted-foreground">{s.hint}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <Sep />
        <TBtn active={editor.isActive('bold')}      icon={Bold}          label="Bold"      onClick={() => editor.chain().focus().toggleBold().run()} />
        <TBtn active={editor.isActive('italic')}    icon={Italic}        label="Italic"    onClick={() => editor.chain().focus().toggleItalic().run()} />
        <TBtn active={editor.isActive('underline')} icon={UnderlineIcon} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <TBtn active={editor.isActive('highlight')} icon={Highlighter}   label="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} />
        <Sep />
        <TBtn active={editor.isActive('bulletList')}  icon={List}         label="Bullets"  onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <TBtn active={editor.isActive('orderedList')} icon={ListOrdered}  label="Numbers"  onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <TBtn active={editor.isActive('taskList')}    icon={CheckSquare}  label="Tasks"    onClick={() => editor.chain().focus().toggleTaskList().run()} />
        <TBtn active={editor.isActive('codeBlock')}   icon={Code2}        label="Code"     onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <TBtn active={editor.isActive('blockquote')}  icon={Quote}        label="Quote"    onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <Sep />
        <TBtn active={false}                      icon={ImagePlus} label="Image" onClick={onImageUpload} />
        <TBtn active={editor.isActive('table')}   icon={TableIcon} label="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        <Sep />
        <TBtn active={editor.isActive({ textAlign: 'left' })}   icon={AlignLeft}   label="Left"   onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <TBtn active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} label="Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <TBtn active={editor.isActive({ textAlign: 'right' })}  icon={AlignRight}  label="Right"  onClick={() => editor.chain().focus().setTextAlign('right').run()} />
      </div>

      {/* Contextual table controls — only visible when cursor is in a table */}
      {editor.isActive('table') ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-background/90 px-3 py-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Table</span>
          <Mini onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Col ←</Mini>
          <Mini onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col →</Mini>
          <Mini onClick={() => editor.chain().focus().addRowBefore().run()}>+ Row ↑</Mini>
          <Mini onClick={() => editor.chain().focus().addRowAfter().run()}>+ Row ↓</Mini>
          <Mini onClick={() => editor.chain().focus().deleteColumn().run()} danger>Del Col</Mini>
          <Mini onClick={() => editor.chain().focus().deleteRow().run()} danger>Del Row</Mini>
          <Mini onClick={() => editor.chain().focus().deleteTable().run()} danger>Del Table</Mini>
          <Mini onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header Row</Mini>
          <Mini onClick={() => editor.chain().focus().mergeOrSplit().run()}>Merge/Split</Mini>
        </div>
      ) : null}
    </div>
  )
}

function Sep() { return <div className="mx-0.5 h-5 w-px bg-border/60" /> }

function TBtn({ active, icon: Icon, label, onClick }: {
  active: boolean; icon: ComponentType<{ className?: string }>; label: string; onClick: () => void
}) {
  return (
    <button aria-label={label} title={label}
      className={cn('inline-flex items-center justify-center rounded-xl border p-2 transition',
        active ? 'border-foreground/20 bg-accent text-foreground'
               : 'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground')}
      onClick={onClick} type="button">
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

function Mini({ onClick, children, danger = false }: { onClick: () => void; children: ReactNode; danger?: boolean }) {
  return (
    <button
      className={cn('rounded-lg border px-2.5 py-1 text-xs font-medium transition',
        danger ? 'border-red-400/30 text-red-500 hover:bg-red-400/10'
               : 'border-border hover:bg-accent')}
      onClick={onClick} type="button"
    >{children}</button>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   FLOATING SELECTION BUBBLE MENU
   ══════════════════════════════════════════════════════════════════════════════ */

function SelectionBubbleMenu({ editor }: { editor: Editor }) {
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    const updatePosition = () => {
      if (!editor.isFocused || editor.state.selection.empty) { setPosition(null); return }
      const { from, to } = editor.state.selection
      const start = editor.view.coordsAtPos(from)
      const end   = editor.view.coordsAtPos(to)
      setPosition({ left: (start.left + end.right) / 2, top: Math.min(start.top, end.top) - 12 })
    }
    const hide = () => setPosition(null)
    updatePosition()
    editor.on('selectionUpdate', updatePosition)
    editor.on('focus', updatePosition)
    editor.on('blur', hide)
    return () => { editor.off('selectionUpdate', updatePosition); editor.off('focus', updatePosition); editor.off('blur', hide) }
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
          className={cn('rounded-xl p-2 transition', active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
          onClick={fn} type="button">
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
      <button
        className={cn('rounded-xl p-2 transition', editor.isActive('link') ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
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
