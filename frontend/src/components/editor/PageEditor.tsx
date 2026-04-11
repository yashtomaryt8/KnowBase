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
import Typography from '@tiptap/extension-typography'
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

// Heading levels shown in the style dropdown
const TEXT_STYLES = [
  { label: 'Normal text', value: 'paragraph', fontSize: '—' },
  { label: 'Heading 1',   value: 'h1',       fontSize: '2 rem' },
  { label: 'Heading 2',   value: 'h2',       fontSize: '1.5 rem' },
  { label: 'Heading 3',   value: 'h3',       fontSize: '1.25 rem' },
  { label: 'Heading 4',   value: 'h4',       fontSize: '1.1 rem' },
  { label: 'Heading 5',   value: 'h5',       fontSize: '1 rem' },
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
  const [title, setTitle] = useState(page.title)
  const [mode, setMode] = useState<'read' | 'edit'>('read')
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [menuOpen, setMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const saveTimeoutRef = useRef<number | null>(null)
  const latestTitleRef = useRef(page.title)
  const modeRef = useRef<'read' | 'edit'>('read')
  const dirtyRef = useRef(false)
  const lastSavedRef = useRef({
    title: page.title,
    content_json: page.content_json,
    content_text: page.content_text,
    word_count: page.word_count,
  })
  const { registerPageShortcutActions, clearPageShortcutActions } = usePageShortcutStore()

  const setDirtyState = (nextDirty: boolean) => {
    dirtyRef.current = nextDirty
    setDirty(nextDirty)
  }

  const syncDirtyState = (currentEditor: Editor | null) => {
    const titleDirty = latestTitleRef.current.trim() !== lastSavedRef.current.title
    const contentDirty =
      currentEditor !== null &&
      (JSON.stringify(currentEditor.getJSON()) !==
        JSON.stringify(lastSavedRef.current.content_json) ||
        currentEditor.getText() !== lastSavedRef.current.content_text ||
        countWords(currentEditor.getText()) !== lastSavedRef.current.word_count)

    setDirtyState(titleDirty || contentDirty)
  }

  useEffect(() => {
    setTitle(page.title)
    latestTitleRef.current = page.title
    modeRef.current = 'read'
    lastSavedRef.current = {
      title: page.title,
      content_json: page.content_json,
      content_text: page.content_text,
      word_count: page.word_count,
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
      Image.configure({ allowBase64: true, HTMLAttributes: { class: 'kb-image' } }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Underline,
      Link.configure({ openOnClick: false }),
      Typography,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      // ── Table extensions ───────────────────────────────────────────────────
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: page.content_json,
    onUpdate: ({ editor: currentEditor }) => {
      setSaveState('saving')
      syncDirtyState(currentEditor)

      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = window.setTimeout(async () => {
        const contentText = currentEditor.getText()
        const payload = {
          content_json: currentEditor.getJSON(),
          content_text: contentText,
          word_count: countWords(contentText),
        }

        try {
          await onSave(payload)
          lastSavedRef.current = { ...lastSavedRef.current, ...payload }
          syncDirtyState(currentEditor)
          setSaveState('saved')
          window.setTimeout(() => setSaveState('idle'), 1200)
        } catch {
          setSaveState('idle')
          syncDirtyState(currentEditor)
        }
      }, 1500)
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(mode === 'edit')
  }, [editor, mode])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const flushEditorSave = async () => {
    if (!editor) return

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    const contentText = editor.getText()
    const payload = {
      content_json: editor.getJSON(),
      content_text: contentText,
      word_count: countWords(contentText),
    }

    if (
      JSON.stringify(payload.content_json) ===
        JSON.stringify(lastSavedRef.current.content_json) &&
      payload.content_text === lastSavedRef.current.content_text &&
      payload.word_count === lastSavedRef.current.word_count
    ) {
      syncDirtyState(editor)
      return
    }

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

  const toggleMode = async () => {
    if (modeRef.current === 'edit') {
      await saveAll()
      setMode('read')
      return
    }
    setMode('edit')
  }

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return

    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () =>
        typeof reader.result === 'string' ? resolve(reader.result) : reject()
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

    editor.chain().focus().setImage({ src: url }).run()
    event.target.value = ''
  }

  useEffect(() => {
    if (!editor) return
    registerPageShortcutActions(page.id, {
      isDirty: () => dirtyRef.current,
      isEditMode: () => modeRef.current === 'edit',
      save: saveAll,
      toggleMode,
    })
    return () => clearPageShortcutActions(page.id)
  }, [clearPageShortcutActions, editor, page.id, registerPageShortcutActions])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>{page.topic_name ?? 'Topic'}</span>
        <span className="opacity-40">/</span>
        <span className="text-foreground font-medium">{title || page.title}</span>
      </div>

      {/* ── Title + Controls ─────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <input
          className="min-w-0 flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-reading)' }}
          onBlur={() => void saveTitle()}
          onChange={(event) => {
            setTitle(event.target.value)
            latestTitleRef.current = event.target.value
            syncDirtyState(editor)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void saveTitle()
            }
          }}
          placeholder="Untitled"
          readOnly={mode !== 'edit'}
          value={title}
        />

        {/* Right-hand action strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Save state pill */}
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                dirty
                  ? 'bg-amber-400'
                  : saveState === 'saved'
                  ? 'bg-emerald-500'
                  : saveState === 'saving'
                  ? 'animate-pulse bg-sky-400'
                  : 'bg-slate-400',
              )}
            />
            <span>
              {dirty
                ? 'Unsaved'
                : saveState === 'saved'
                ? 'Saved'
                : saveState === 'saving'
                ? 'Saving…'
                : 'Idle'}
            </span>
          </div>

          {/* Word count */}
          <div className="hidden rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
            {(page.word_count ?? 0).toLocaleString()} words
          </div>

          {/* Edit / Done */}
          <button
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-medium transition',
              mode === 'edit'
                ? 'border-foreground/25 bg-foreground text-background hover:opacity-85'
                : 'border-border bg-background hover:bg-accent',
            )}
            onClick={() => void toggleMode()}
            type="button"
          >
            {mode === 'edit' ? 'Done' : 'Edit'}
          </button>

          {/* Delete */}
          {onDelete ? (
            <button
              className="flex items-center gap-1.5 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
              onClick={onDelete}
              disabled={isDeleting}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">{isDeleting ? 'Deleting…' : 'Delete'}</span>
            </button>
          ) : null}

          {/* Export dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm transition hover:bg-accent"
              onClick={() => setMenuOpen((v) => !v)}
              type="button"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {menuOpen ? (
              <>
                {/* click-away overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-border bg-background p-2 shadow-2xl">
                  <button
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-accent"
                    onClick={() => {
                      void exportPageAsDocx({
                        title: page.title,
                        content_json: page.content_json as Record<string, unknown> | undefined,
                        content_text: page.content_text,
                      })
                      setMenuOpen(false)
                    }}
                    type="button"
                  >
                    📄 Download .docx
                  </button>
                  <button
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-accent"
                    onClick={() => {
                      exportPageAsPdf({
                        title: page.title,
                        content_json: page.content_json as Record<string, unknown> | undefined,
                        content_text: page.content_text,
                      })
                      setMenuOpen(false)
                    }}
                    type="button"
                  >
                    📑 Download .pdf
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Toolbar (edit mode only) ──────────────────────────────────────────── */}
      {mode === 'edit' && editor ? (
        <EditorToolbar
          editor={editor}
          onImageUpload={() => fileInputRef.current?.click()}
        />
      ) : null}

      {editor && mode === 'edit' ? <SelectionBubbleMenu editor={editor} /> : null}

      {/* ── Content box ──────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'rounded-2xl border border-border/70 bg-background/80 px-6 py-8 shadow-sm',
          'sm:px-8 sm:py-10',
        )}
      >
        <EditorContent
          className="reading-area prose prose-slate max-w-none dark:prose-invert"
          editor={editor}
        />
      </div>

      <input
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleImageSelect(event)}
        ref={fileInputRef}
        type="file"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar
// ─────────────────────────────────────────────────────────────────────────────

type EditorToolbarProps = {
  editor: Editor
  onImageUpload: () => void
}

function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const [styleOpen, setStyleOpen] = useState(false)

  const activeStyle: TextStyleValue = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
    ? 'h3'
    : editor.isActive('heading', { level: 4 })
    ? 'h4'
    : editor.isActive('heading', { level: 5 })
    ? 'h5'
    : 'paragraph'

  const activeStyleLabel =
    TEXT_STYLES.find((s) => s.value === activeStyle)?.label ?? 'Normal text'

  const applyStyle = (value: TextStyleValue) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(value.replace('h', ''), 10) as 1 | 2 | 3 | 4 | 5
      editor.chain().focus().toggleHeading({ level }).run()
    }
    setStyleOpen(false)
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="mb-4 space-y-2">
      {/* Row 1: style dropdown + inline formatting */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-background/90 px-3 py-2.5">
        {/* ── Text style dropdown ────────────────────────────────────────── */}
        <div className="relative">
          <button
            className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-sm transition hover:bg-accent"
            onClick={() => setStyleOpen((v) => !v)}
            type="button"
          >
            <span className="min-w-[90px] text-left">{activeStyleLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>

          {styleOpen ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStyleOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1.5 w-52 rounded-2xl border border-border bg-background p-1.5 shadow-2xl">
                {TEXT_STYLES.map((style) => (
                  <button
                    key={style.value}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-accent',
                      activeStyle === style.value && 'bg-accent font-medium',
                    )}
                    onClick={() => applyStyle(style.value)}
                    type="button"
                  >
                    <span>{style.label}</span>
                    <span className="text-xs text-muted-foreground">{style.fontSize}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <Divider />

        {/* ── Inline formatting ──────────────────────────────────────────── */}
        <ToolbarBtn active={editor.isActive('bold')} icon={Bold} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarBtn active={editor.isActive('italic')} icon={Italic} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarBtn active={editor.isActive('underline')} icon={UnderlineIcon} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarBtn active={editor.isActive('highlight')} icon={Highlighter} label="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} />

        <Divider />

        {/* ── Block formatting ───────────────────────────────────────────── */}
        <ToolbarBtn active={editor.isActive('bulletList')} icon={List} label="Bullets" onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarBtn active={editor.isActive('orderedList')} icon={ListOrdered} label="Numbers" onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarBtn active={editor.isActive('taskList')} icon={CheckSquare} label="Tasks" onClick={() => editor.chain().focus().toggleTaskList().run()} />
        <ToolbarBtn active={editor.isActive('codeBlock')} icon={Code2} label="Code" onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <ToolbarBtn active={editor.isActive('blockquote')} icon={Quote} label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} />

        <Divider />

        {/* ── Media + table ─────────────────────────────────────────────── */}
        <ToolbarBtn active={false} icon={ImagePlus} label="Image" onClick={onImageUpload} />
        <ToolbarBtn active={editor.isActive('table')} icon={TableIcon} label="Table" onClick={insertTable} />

        <Divider />

        {/* ── Alignment ─────────────────────────────────────────────────── */}
        <ToolbarBtn active={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} label="Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <ToolbarBtn active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} label="Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <ToolbarBtn active={editor.isActive({ textAlign: 'right' })} icon={AlignRight} label="Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} />
      </div>

      {/* Row 2: Table controls (only when cursor is inside a table) */}
      {editor.isActive('table') ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-background/90 px-3 py-2">
          <span className="mr-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Table</span>
          <MiniBtn onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Col ←</MiniBtn>
          <MiniBtn onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col →</MiniBtn>
          <MiniBtn onClick={() => editor.chain().focus().addRowBefore().run()}>+ Row ↑</MiniBtn>
          <MiniBtn onClick={() => editor.chain().focus().addRowAfter().run()}>+ Row ↓</MiniBtn>
          <MiniBtn onClick={() => editor.chain().focus().deleteColumn().run()} danger>Del Col</MiniBtn>
          <MiniBtn onClick={() => editor.chain().focus().deleteRow().run()} danger>Del Row</MiniBtn>
          <MiniBtn onClick={() => editor.chain().focus().deleteTable().run()} danger>Del Table</MiniBtn>
          <MiniBtn onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header Row</MiniBtn>
          <MiniBtn onClick={() => editor.chain().focus().mergeOrSplit().run()}>Merge/Split</MiniBtn>
        </div>
      ) : null}
    </div>
  )
}

function Divider() {
  return <div className="h-5 w-px bg-border/70 mx-0.5" />
}

function MiniBtn({
  onClick,
  children,
  danger = false,
}: {
  onClick: () => void
  children: ReactNode
  danger?: boolean
}) {
  return (
    <button
      className={cn(
        'rounded-lg border px-2.5 py-1 text-xs transition',
        danger
          ? 'border-red-400/30 text-red-500 hover:bg-red-500/10'
          : 'border-border hover:bg-accent',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

type ToolbarBtnProps = {
  active: boolean
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}

function ToolbarBtn({ active, icon: Icon, label, onClick }: ToolbarBtnProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-xl border p-2 text-sm transition',
        active
          ? 'border-foreground/25 bg-accent text-foreground'
          : 'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground',
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating selection bubble menu
// ─────────────────────────────────────────────────────────────────────────────

function SelectionBubbleMenu({ editor }: { editor: Editor }) {
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    const updatePosition = () => {
      if (!editor.isFocused || editor.state.selection.empty) {
        setPosition(null)
        return
      }
      const { from, to } = editor.state.selection
      const start = editor.view.coordsAtPos(from)
      const end = editor.view.coordsAtPos(to)
      setPosition({
        left: (start.left + end.right) / 2,
        top: Math.min(start.top, end.top) - 12,
      })
    }
    const hide = () => setPosition(null)

    updatePosition()
    editor.on('selectionUpdate', updatePosition)
    editor.on('focus', updatePosition)
    editor.on('blur', hide)

    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('focus', updatePosition)
      editor.off('blur', hide)
    }
  }, [editor])

  if (!position) return null

  return createPortal(
    <div
      className="fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-2xl border border-border bg-background/95 p-1.5 shadow-2xl backdrop-blur"
      style={{ left: position.left, top: position.top }}
    >
      <BubbleBtn active={editor.isActive('bold')} icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} />
      <BubbleBtn active={editor.isActive('italic')} icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <BubbleBtn active={editor.isActive('underline')} icon={UnderlineIcon} onClick={() => editor.chain().focus().toggleUnderline().run()} />
      <BubbleBtn active={editor.isActive('highlight')} icon={Highlighter} onClick={() => editor.chain().focus().toggleHighlight().run()} />
      <BubbleBtn active={editor.isActive('code')} icon={Code2} onClick={() => editor.chain().focus().toggleCode().run()} />
      <BubbleBtn
        active={editor.isActive('link')}
        icon={Link2}
        onClick={() => {
          const prev = editor.getAttributes('link').href as string | undefined
          const url = window.prompt('URL', prev ?? 'https://')
          if (url === null) return
          if (url === '') { editor.chain().focus().unsetLink().run(); return }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
      />
    </div>,
    document.body,
  )
}

function BubbleBtn({
  active,
  icon: Icon,
  onClick,
}: {
  active: boolean
  icon: ComponentType<{ className?: string }>
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        'rounded-xl p-2 transition',
        active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}