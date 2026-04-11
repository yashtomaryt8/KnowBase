import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { createTopic } from '../../lib/db'
import { cn } from '../../utils/cn'
import { TOPIC_ICON_OPTIONS } from '../../utils/topicIcons'

type AddTopicDialogProps = {
  open: boolean
  parentId?: string
  onClose: () => void
  onSuccess?: () => void
}

const COLOR_OPTIONS = ['#C76C3A', '#2F6B5F', '#5562A8', '#9C4F7C', '#A6872F', '#3C7EA6']

export function AddTopicDialog({ open, parentId, onClose, onSuccess }: AddTopicDialogProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<string>(TOPIC_ICON_OPTIONS[0].value)
  const [color, setColor] = useState(COLOR_OPTIONS[0])

  const title = useMemo(() => (parentId ? 'Add subtopic' : 'Add topic'), [parentId])

  useEffect(() => {
    if (!open) {
      setName('')
      setIcon(TOPIC_ICON_OPTIONS[0].value)
      setColor(COLOR_OPTIONS[0])
    }
  }, [open])

  const createTopicMutation = useMutation({
    mutationFn: async () => {
      await createTopic({
        name: name.trim(),
        icon,
        color,
        description: '',
        parent_id: parentId,
      })
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

    createTopicMutation.mutate()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-border/70 bg-background p-5 shadow-2xl sm:p-6"
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TOPIC_ICON_OPTIONS.map((option) => {
                const Icon = option.icon

                return (
                  <button
                    key={option.value}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border border-border px-3 py-3 text-left transition hover:bg-accent',
                      icon === option.value && 'border-foreground/30 bg-accent',
                    )}
                    onClick={() => setIcon(option.value)}
                    type="button"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                )
              })}
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
              disabled={createTopicMutation.isPending}
              type="submit"
            >
              {createTopicMutation.isPending ? 'Creating...' : 'Create topic'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
