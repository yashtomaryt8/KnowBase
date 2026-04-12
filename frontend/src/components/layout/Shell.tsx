import { Outlet } from 'react-router-dom'

import { useGlobalShortcuts } from '../../hooks/useGlobalShortcuts'
import { SearchPalette } from '../search/SearchPalette'
import { Sidebar } from './Sidebar'
import { ShortcutHelpModal } from './ShortcutHelpModal'

export function Shell() {
  useGlobalShortcuts()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      {/*
        On mobile the fixed topbar sits above this panel.
        --main-top-offset is set in index.css:
          mobile → calc(3.75rem + env(safe-area-inset-top, 0px))
          desktop (md:) → 0px
        We apply it as an inline style so it's driven by the CSS variable,
        meaning it automatically adjusts to the actual safe-area value at
        runtime — no JS, no magic numbers.
      */}
      <main
        className="min-w-0 flex-1 overflow-y-auto"
        style={{ paddingTop: 'var(--main-top-offset, 3.75rem)' }}
      >
        <Outlet />
      </main>

      <SearchPalette />
      <ShortcutHelpModal />
    </div>
  )
}
