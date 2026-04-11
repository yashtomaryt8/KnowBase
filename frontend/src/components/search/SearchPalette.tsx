import { useMutation, useQuery } from '@tanstack/react-query'
import { Command } from 'cmdk'
import { LoaderCircle, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

import { api } from '../../api/client'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../utils/cn'
import { useDebounce } from '../../utils/useDebounce'

type TextSearchResult = {
  id: string
  title: string
  topic: string
  excerpt: string
}

type SemanticSearchResult = {
  page_id: string
  page_title: string
  topic: string
  excerpt: string
  score: number
}

export function SearchPalette() {
  const { searchOpen, closeSearch } = useUIStore()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'text' | 'ai'>('text')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!searchOpen) {
      setQuery('')
      setMode('text')
    }
  }, [searchOpen])

  const textSearch = useQuery<{ results: TextSearchResult[] }>({
    enabled: searchOpen && mode === 'text' && debouncedQuery.trim().length >= 2,
    queryKey: ['search', 'text', debouncedQuery],
    queryFn: async () => {
      const response = await api.get(`/search/?q=${encodeURIComponent(debouncedQuery)}`)
      return response.data
    },
  })

  const aiSearch = useMutation<{ results: SemanticSearchResult[] }, Error, string>({
    mutationFn: async (currentQuery) => {
      const response = await api.post('/search/semantic/', { query: currentQuery })
      return response.data
    },
  })

  const normalizedResults = useMemo(() => {
    if (mode === 'text') {
      return (textSearch.data?.results ?? []).map((result) => ({
        id: result.id,
        title: result.title,
        topic: result.topic,
        excerpt: result.excerpt,
        score: undefined,
      }))
    }

    return (aiSearch.data?.results ?? []).map((result) => ({
      id: result.page_id,
      title: result.page_title,
      topic: result.topic,
      excerpt: result.excerpt,
      score: result.score,
    }))
  }, [aiSearch.data?.results, mode, textSearch.data?.results])

  const showTypeMessage = query.trim().length < 2
  const showEmptyState =
    !showTypeMessage &&
    !textSearch.isFetching &&
    !aiSearch.isPending &&
    normalizedResults.length === 0

  const triggerAiSearch = () => {
    const trimmedQuery = query.trim()
    setMode('ai')
    if (trimmedQuery.length >= 2) {
      aiSearch.mutate(trimmedQuery)
    }
  }

  if (!searchOpen) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/60 px-4 backdrop-blur-sm"
      onClick={closeSearch}
    >
      <div
        className="mx-auto mt-[15vh] w-full max-w-xl overflow-hidden rounded-xl border border-border/70 bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Command>
          <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              autoFocus
              className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && mode === 'ai') {
                  event.preventDefault()
                  triggerAiSearch()
                }
              }}
              onValueChange={setQuery}
              placeholder="Search your knowledge base..."
              value={query}
            />
            <div className="flex rounded-xl bg-muted p-1">
              <button
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-medium transition',
                  mode === 'text' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
                )}
                onClick={() => setMode('text')}
                type="button"
              >
                Text
              </button>
              <button
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-medium transition',
                  mode === 'ai' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
                )}
                onClick={triggerAiSearch}
                type="button"
              >
                AI
              </button>
            </div>
          </div>
          <Command.List className="max-h-96 overflow-y-auto p-2">
            {aiSearch.isPending ? (
              <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : null}

            {showTypeMessage ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">Type to search...</div>
            ) : null}

            {showEmptyState ? (
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results found
              </Command.Empty>
            ) : null}

            {normalizedResults.map((result) => (
              <Command.Item
                className="cursor-pointer rounded-lg outline-none data-[selected=true]:bg-accent"
                key={`${mode}-${result.id}`}
                onSelect={() => {
                  navigate(`/page/${result.id}`)
                  closeSearch()
                }}
                value={result.title}
              >
                <div className="w-full rounded-lg px-3 py-3 transition data-[selected=true]:bg-accent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{result.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{result.topic}</div>
                    </div>
                    {typeof result.score === 'number' ? (
                      <span className="shrink-0 rounded-full bg-accent px-2 py-1 text-[11px] font-medium text-foreground">
                        {Math.round(result.score * 100)}% match
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 truncate text-xs italic text-muted-foreground">
                    {result.excerpt.slice(0, 100)}
                  </p>
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>,
    document.body,
  )
}
