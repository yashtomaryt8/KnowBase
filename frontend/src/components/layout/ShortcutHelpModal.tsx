import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { useUIStore } from '../../store/uiStore'

const SHORTCUT_ROWS = [
  { keys: 'Ctrl/Cmd + K', description: 'Open search palette' },
  { keys: 'Ctrl/Cmd + S', description: 'Save current page' },
  { keys: 'Ctrl/Cmd + E', description: 'Toggle edit/read mode on a page' },
  { keys: 'Ctrl/Cmd + D', description: 'Toggle dark/light theme' },
  { keys: '[', description: 'Go to previous topic in the same level' },
  { keys: ']', description: 'Go to next topic in the same level' },
  { keys: 'Esc', description: 'Close the search palette' },
  { keys: '?', description: 'Open this keyboard shortcut help' },
]

export function ShortcutHelpModal() {
  const { shortcutHelpOpen, closeShortcutHelp } = useUIStore()

  if (!shortcutHelpOpen) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 backdrop-blur-sm sm:items-center sm:pb-0"
      onClick={closeShortcutHelp}
    >
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-border/70 bg-background p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Keyboard</p>
            <h2 className="mt-2 text-2xl font-semibold">Shortcut Reference</h2>
          </div>
          <button
            className="rounded-full p-2 transition hover:bg-accent"
            onClick={closeShortcutHelp}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border/70">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3 font-medium">Shortcut</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {SHORTCUT_ROWS.map((row) => (
                <tr className="border-t border-border/70" key={row.keys}>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.keys}</td>
                  <td className="px-4 py-3">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  )
}
