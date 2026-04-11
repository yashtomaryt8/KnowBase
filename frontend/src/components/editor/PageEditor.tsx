import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
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
  Code2,
  Download,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Trash2,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { common, createLowlight } from 'lowlight'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ComponentType } from 'react'
import { createPortal } from 'react-dom'

import { exportPageAsDocx, exportPageAsPdf } from '../../lib/exportPage'
import { usePageShortcutStore } from '../../store/pageShortcutStore'
import type { Page } from '../../types'
import { cn } from '../../utils/cn'

const lowlight = createLowlight(common)

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
      (JSON.stringify(currentEditor.getJSON()) !== JSON.stringify(lastSavedRef.current.content_json) ||
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
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Underline,
      Link.configure({ openOnClick: false }),
      Typography,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
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
          lastSavedRef.current = {
            ...lastSavedRef.current,
            ...payload,
          }
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
    if (!editor) {
      return
    }

    editor.setEditable(mode === 'edit')
  }, [editor, mode])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const flushEditorSave = async () => {
    if (!editor) {
      return
    }

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
      JSON.stringify(payload.content_json) === JSON.stringify(lastSavedRef.current.content_json) &&
      payload.content_text === lastSavedRef.current.content_text &&
      payload.word_count === lastSavedRef.current.word_count
    ) {
      syncDirtyState(editor)
      return
    }

    setSaveState('saving')
    await onSave(payload)
    lastSavedRef.current = {
      ...lastSavedRef.current,
      ...payload,
    }
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
    lastSavedRef.current = {
      ...lastSavedRef.current,
      title: nextTitle,
    }
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

  const uploadImage = async (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
          return
        }

        reject(new Error('Invalid image data'))
      }

      reader.onerror = () => reject(reader.error ?? new Error('Image read failed'))
      reader.readAsDataURL(file)
    })

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor) {
      return
    }

    const url = await uploadImage(file)
    editor.chain().focus().setImage({ src: url }).run()
    event.target.value = ''
  }

  useEffect(() => {
    if (!editor) {
      return
    }

    registerPageShortcutActions(page.id, {
      isDirty: () => dirtyRef.current,
      isEditMode: () => modeRef.current === 'edit',
      save: saveAll,
      toggleMode,
    })

    return () => {
      clearPageShortcutActions(page.id)
    }
  }, [clearPageShortcutActions, editor, page.id, registerPageShortcutActions])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{page.topic_name ?? 'Topic'}</span>
        <span>&gt;</span>
        <span className="text-foreground">{title || page.title}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <input
          className="min-w-0 flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground sm:text-4xl"
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                dirty
                  ? 'bg-amber-400'
                  : saveState === 'saved'
                  ? 'bg-emerald-500'
                  : saveState === 'saving'
                    ? 'bg-sky-400'
                    : 'bg-slate-400',
              )}
            />
            <span>
              {dirty
                ? 'Unsaved changes'
                : saveState === 'saved'
                  ? 'Saved'
                  : saveState === 'saving'
                    ? 'Saving...'
                    : 'Idle'}
            </span>
          </div>

          <button
            className="rounded-2xl border border-border bg-background px-4 py-2 text-sm transition hover:bg-accent"
            onClick={() => void toggleMode()}
            type="button"
          >
            {mode === 'edit' ? 'Done' : 'Edit'}
          </button>

          {onDelete && (
            <button
              className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
              onClick={onDelete}
              disabled={isDeleting}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm transition hover:bg-accent"
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-border bg-background p-2 shadow-xl">
                <button
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-accent"
                  onClick={() => {
                    void exportPageAsDocx({ title: page.title, content_text: page.content_text })
                    setMenuOpen(false)
                  }}
                  type="button"
                >
                  Download .docx
                </button>
                <button
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-accent"
                  onClick={() => {
                    exportPageAsPdf({ title: page.title, content_text: page.content_text })
                    setMenuOpen(false)
                  }}
                  type="button"
                >
                  Download .pdf
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {mode === 'edit' && editor ? (
        <EditorToolbar
          editor={editor}
          onImageUpload={() => fileInputRef.current?.click()}
        />
      ) : null}

      {editor && mode === 'edit' ? <SelectionBubbleMenu editor={editor} /> : null}

      <div className="rounded-[2rem] border border-border/70 bg-background/70 px-6 py-8 shadow-sm">
        <EditorContent
          className="prose prose-slate max-w-none dark:prose-invert [&_.ProseMirror]:min-h-[420px] [&_.ProseMirror]:text-[1rem] [&_.ProseMirror]:leading-8 [&_.ProseMirror]:outline-none sm:[&_.ProseMirror]:text-[1.05rem]"
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

type EditorToolbarProps = {
  editor: Editor
  onImageUpload: () => void
}

function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2 rounded-[1.5rem] border border-border/70 bg-background/90 p-3">
      <ToolbarButton active={editor.isActive('heading', { level: 1 })} icon={Heading1} label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <ToolbarButton active={editor.isActive('heading', { level: 2 })} icon={Heading2} label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton active={editor.isActive('heading', { level: 3 })} icon={Heading3} label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <ToolbarButton active={editor.isActive('bold')} icon={Bold} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton active={editor.isActive('italic')} icon={Italic} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarButton active={editor.isActive('underline')} icon={UnderlineIcon} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} />
      <ToolbarButton active={editor.isActive('bulletList')} icon={List} label="Bullets" onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton active={editor.isActive('orderedList')} icon={ListOrdered} label="Numbers" onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton active={editor.isActive('codeBlock')} icon={Code2} label="Code" onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
      <ToolbarButton active={editor.isActive('blockquote')} icon={Quote} label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <ToolbarButton active={editor.isActive('taskList')} icon={CheckSquare} label="Tasks" onClick={() => editor.chain().focus().toggleTaskList().run()} />
      <ToolbarButton active={false} icon={ImagePlus} label="Image" onClick={onImageUpload} />
      <ToolbarButton active={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} label="Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} />
      <ToolbarButton active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} label="Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} />
      <ToolbarButton active={editor.isActive({ textAlign: 'right' })} icon={AlignRight} label="Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} />
    </div>
  )
}

type ToolbarButtonProps = {
  active: boolean
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}

function ToolbarButton({ active, icon: Icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition',
        active ? 'border-foreground/30 bg-accent text-foreground' : 'border-border bg-background hover:bg-accent',
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}

type MenuButtonProps = {
  active: boolean
  icon: ComponentType<{ className?: string }>
  onClick: () => void
}

function MenuButton({ active, icon: Icon, onClick }: MenuButtonProps) {
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

  if (!position) {
    return null
  }

  return createPortal(
    <div
      className="fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-2xl border border-border bg-background p-1 shadow-xl"
      style={{ left: position.left, top: position.top }}
    >
      <MenuButton active={editor.isActive('bold')} icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} />
      <MenuButton active={editor.isActive('italic')} icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <MenuButton active={editor.isActive('underline')} icon={UnderlineIcon} onClick={() => editor.chain().focus().toggleUnderline().run()} />
      <MenuButton active={editor.isActive('highlight')} icon={Highlighter} onClick={() => editor.chain().focus().toggleHighlight().run()} />
      <MenuButton active={editor.isActive('code')} icon={Code2} onClick={() => editor.chain().focus().toggleCode().run()} />
      <MenuButton
        active={editor.isActive('link')}
        icon={Link2}
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href as string | undefined
          const url = window.prompt('Enter a URL', previousUrl ?? 'https://')

          if (url === null) {
            return
          }

          if (url === '') {
            editor.chain().focus().unsetLink().run()
            return
          }

          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
      />
    </div>,
    document.body,
  )
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}
