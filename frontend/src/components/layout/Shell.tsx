import { Outlet } from 'react-router-dom'

import { useGlobalShortcuts } from '../../hooks/useGlobalShortcuts'
import { SearchPalette } from '../search/SearchPalette'
import { Sidebar } from './Sidebar'
import { ShortcutHelpModal } from './ShortcutHelpModal'

export function Shell() {
  useGlobalShortcuts()

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <SearchPalette />
      <ShortcutHelpModal />
    </div>
  )
}
