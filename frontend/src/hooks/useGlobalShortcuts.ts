import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getPage, getTopicTree } from '../lib/db'
import { usePageShortcutStore } from '../store/pageShortcutStore'
import { useUIStore } from '../store/uiStore'
import type { Page } from '../types'
import { findTopicSiblings, type TreeTopic } from '../utils/topicTree'

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.closest('[contenteditable="true"]') !== null
  )
}

function getRouteId(pathname: string, segment: 'page' | 'topic') {
  const match = pathname.match(new RegExp(`^/${segment}/([^/]+)`))
  return match?.[1]
}

function isShortcutHelpKey(event: KeyboardEvent) {
  return event.key === '?' || (event.key === '/' && event.shiftKey)
}

export function useGlobalShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()
  const pageActions = usePageShortcutStore((state) => state.actions)
  const {
    searchOpen,
    shortcutHelpOpen,
    openSearch,
    closeSearch,
    openShortcutHelp,
    closeShortcutHelp,
    toggleTheme,
  } = useUIStore()

  const topicId = getRouteId(location.pathname, 'topic')
  const pageId = getRouteId(location.pathname, 'page')

  const { data: tree = [] } = useQuery<TreeTopic[]>({
    queryKey: ['topics', 'tree'],
    queryFn: async () => (await getTopicTree()) as TreeTopic[],
    staleTime: 60_000,
  })

  const { data: currentPage } = useQuery<Page>({
    enabled: Boolean(pageId),
    queryKey: ['pages', pageId],
    queryFn: () => getPage(pageId!),
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return
      }

      const modifierPressed = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (modifierPressed && key === 'k') {
        event.preventDefault()
        openSearch()
        return
      }

      if (modifierPressed && key === 's') {
        if (!pageActions) {
          return
        }

        event.preventDefault()
        if (pageActions.isDirty()) {
          void pageActions.save()
        }
        return
      }

      if (modifierPressed && key === 'e') {
        if (!pageActions) {
          return
        }

        event.preventDefault()
        void pageActions.toggleMode()
        return
      }

      if (modifierPressed && key === 'd') {
        event.preventDefault()
        toggleTheme()
        return
      }

      if (event.key === 'Escape') {
        if (searchOpen) {
          event.preventDefault()
          closeSearch()
          return
        }

        if (shortcutHelpOpen) {
          event.preventDefault()
          closeShortcutHelp()
          return
        }

        if (pageActions?.isEditMode()) {
          return
        }

        return
      }

      if (searchOpen || shortcutHelpOpen || isEditableTarget(event.target)) {
        return
      }

      if (isShortcutHelpKey(event)) {
        event.preventDefault()
        openShortcutHelp()
        return
      }

      if (event.key !== '[' && event.key !== ']') {
        return
      }

      const currentTopicId = topicId ?? currentPage?.topic_id
      if (!currentTopicId) {
        return
      }

      const siblingMatch = findTopicSiblings(tree, currentTopicId)
      if (!siblingMatch) {
        return
      }

      const targetIndex =
        event.key === '[' ? siblingMatch.index - 1 : siblingMatch.index + 1
      const targetTopic = siblingMatch.siblings[targetIndex]
      if (!targetTopic) {
        return
      }

      event.preventDefault()
      navigate(`/topic/${targetTopic.id}`)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    closeSearch,
    closeShortcutHelp,
    currentPage?.topic_id,
    navigate,
    openSearch,
    openShortcutHelp,
    pageActions,
    searchOpen,
    shortcutHelpOpen,
    toggleTheme,
    topicId,
    tree,
  ])
}
