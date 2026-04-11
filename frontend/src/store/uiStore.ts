import { create } from 'zustand'

type Theme = 'light' | 'dark'

type UIState = {
  theme: Theme
  searchOpen: boolean
  shortcutHelpOpen: boolean
  toggleTheme: () => void
  openSearch: () => void
  closeSearch: () => void
  openShortcutHelp: () => void
  closeShortcutHelp: () => void
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.classList.toggle('dark', theme === 'dark')
  window.localStorage.setItem('theme', theme)
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useUIStore = create<UIState>((set) => ({
  theme: initialTheme,
  searchOpen: false,
  shortcutHelpOpen: false,
  toggleTheme: () =>
    set((state) => {
      const nextTheme: Theme = state.theme === 'light' ? 'dark' : 'light'
      applyTheme(nextTheme)
      return { theme: nextTheme }
    }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  openShortcutHelp: () => set({ shortcutHelpOpen: true }),
  closeShortcutHelp: () => set({ shortcutHelpOpen: false }),
}))
