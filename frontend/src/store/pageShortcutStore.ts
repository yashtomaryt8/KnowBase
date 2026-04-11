import { create } from 'zustand'

export type PageShortcutActions = {
  isDirty: () => boolean
  isEditMode: () => boolean
  save: () => Promise<void>
  toggleMode: () => Promise<void>
}

type PageShortcutState = {
  pageId: string | null
  actions: PageShortcutActions | null
  registerPageShortcutActions: (pageId: string, actions: PageShortcutActions) => void
  clearPageShortcutActions: (pageId: string) => void
}

export const usePageShortcutStore = create<PageShortcutState>((set) => ({
  pageId: null,
  actions: null,
  registerPageShortcutActions: (pageId, actions) => set({ pageId, actions }),
  clearPageShortcutActions: (pageId) =>
    set((state) =>
      state.pageId === pageId
        ? {
            pageId: null,
            actions: null,
          }
        : state,
    ),
}))
