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
      <main className="min-w-0 flex-1 overflow-y-auto pt-16 md:pt-0">
        <Outlet />
      </main>
      <SearchPalette />
      <ShortcutHelpModal />
    </div>
  )
}
