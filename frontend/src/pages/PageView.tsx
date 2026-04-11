import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { api } from '../api/client'
import { PageEditor } from '../components/editor/PageEditor'
import type { Page } from '../types'

type SavePayload = {
  title?: string
  content_json?: Record<string, unknown>
  content_text?: string
  word_count?: number
}

export function PageView() {
  const { pageId } = useParams<{ pageId: string }>()
  const queryClient = useQueryClient()
  const { data: page, isLoading } = useQuery<Page>({
    enabled: Boolean(pageId),
    queryKey: ['pages', pageId],
    queryFn: async () => {
      const response = await api.get(`/pages/${pageId}/`)
      return response.data
    },
  })

  if (!pageId) {
    return null
  }

  if (isLoading) {
    return <PageViewSkeleton />
  }

  if (!page) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-[2rem] border border-border/70 bg-background/80 p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold">Page not found</h2>
        </div>
      </section>
    )
  }

  const handleSave = async (data: SavePayload) => {
    try {
      const response = await api.patch(`/pages/${pageId}/`, data)
      const updatedPage = response.data as Page
      queryClient.setQueryData(['pages', pageId], updatedPage)
      void queryClient.invalidateQueries({ queryKey: ['pages', 'topic', updatedPage.topic_id] })
      await api.post(`/search/index/${pageId}/`)
    } catch {
      toast.error('Could not save page')
      throw new Error('save failed')
    }
  }

  return <PageEditor key={page.id} onSave={handleSave} page={page} />
}

function PageViewSkeleton() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-14 w-3/4 animate-pulse rounded bg-background/70" />
      <div className="mt-6 h-14 animate-pulse rounded-[1.5rem] bg-background/70" />
      <div className="mt-4 h-[520px] animate-pulse rounded-[2rem] bg-background/70" />
    </section>
  )
}
