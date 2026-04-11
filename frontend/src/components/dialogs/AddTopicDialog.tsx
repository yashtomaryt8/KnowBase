import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { api } from '../../api/client'
import { cn } from '../../utils/cn'

type AddTopicDialogProps = {
  open: boolean
  parentId?: string
  onClose: () => void
  onSuccess?: () => void
}

const ICON_OPTIONS = ['📁', '🧠', '📚', '📝', '⚙️', '🚀', '💡', '🔬']
const COLOR_OPTIONS = ['#C76C3A', '#2F6B5F', '#5562A8', '#9C4F7C', '#A6872F', '#3C7EA6']

export function AddTopicDialog({ open, parentId, onClose, onSuccess }: AddTopicDialogProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICON_OPTIONS[0])
  const [color, setColor] = useState(COLOR_OPTIONS[0])

  const title = useMemo(() => (parentId ? 'Add subtopic' : 'Add topic'), [parentId])

  useEffect(() => {
    if (!open) {
      setName('')
      setIcon(ICON_OPTIONS[0])
      setColor(COLOR_OPTIONS[0])
    }
  }, [open])

  const createTopic = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = {
        name: name.trim(),
        icon,
        color,
      }

      if (parentId) {
        payload.parent_id = parentId
      }

      const response = await api.post('/topics/', payload)
      return response.data
    },
    onSuccess: () => {
      toast.success(parentId ? 'Subtopic created' : 'Topic created')
      void queryClient.invalidateQueries({ queryKey: ['topics', 'tree'] })
      onSuccess?.()
      onClose()
    },
    onError: () => {
      toast.error('Could not create topic')
    },
  })

  if (!open) {
    return null
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      toast.error('Topic name is required')
      return
    }

    createTopic.mutate()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[2rem] border border-border/70 bg-background p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Topics</p>
            <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
          </div>
          <button
            className="rounded-full p-2 transition hover:bg-accent"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="topic-name">
              Name
            </label>
            <input
              required
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
              id="topic-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="React Hooks"
              value={name}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Icon</span>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={cn(
                    'rounded-2xl border border-border px-3 py-3 text-lg transition hover:bg-accent',
                    icon === option && 'border-foreground/30 bg-accent',
                  )}
                  onClick={() => setIcon(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Color</span>
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option}
                  aria-label={option}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition',
                    color === option ? 'scale-110 border-foreground/50' : 'border-transparent',
                  )}
                  onClick={() => setColor(option)}
                  style={{ backgroundColor: option }}
                  type="button"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-2xl border border-border px-4 py-2 text-sm transition hover:bg-accent"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-2xl bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createTopic.isPending}
              type="submit"
            >
              {createTopic.isPending ? 'Creating...' : 'Create topic'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
