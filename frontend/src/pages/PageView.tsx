import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PageEditor } from '../components/editor/PageEditor'
import { getPage, updatePage, deletePage } from '../lib/db'
import type { Page } from '../types'

type SavePayload = {
  title?: string
  content_json?: Record<string, unknown>
  content_text?: string
  word_count?: number
}

export function PageView() {
  const { pageId } = useParams<{ pageId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const deletePageMutation = useMutation({
    mutationFn: () => deletePage(pageId!),
    onSuccess: () => {
      toast.success('Page deleted')
      queryClient.setQueryData(['pages', pageId], null)
      navigate(-1) // go back to the topic or previous page
    },
    onError: () => toast.error('Could not delete page'),
  })

  const { data: page, isLoading } = useQuery<Page>({
    enabled: Boolean(pageId),
    queryKey: ['pages', pageId],
    queryFn: () => getPage(pageId!),
  })

  if (!pageId) {
    return null
  }

  if (isLoading) {
    return <PageViewSkeleton />
  }

  if (!page) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-[2rem] border border-border/70 bg-background/80 p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold">Page not found</h2>
        </div>
      </section>
    )
  }

  const handleSave = async (data: SavePayload) => {
    try {
      const updatedPage = await updatePage(pageId!, data)
      queryClient.setQueryData(['pages', pageId], updatedPage)
      void queryClient.invalidateQueries({ queryKey: ['pages', 'topic', updatedPage.topic_id] })
    } catch {
      toast.error('Could not save page')
      throw new Error('save failed')
    }
  }

  return (
    <PageEditor 
      key={page.id} 
      onSave={handleSave} 
      page={page} 
      onDelete={() => {
        if (window.confirm('Are you sure you want to delete this page?')) {
          deletePageMutation.mutate()
        }
      }}
      isDeleting={deletePageMutation.isPending}
    />
  )
}

function PageViewSkeleton() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-14 w-3/4 animate-pulse rounded bg-background/70" />
      <div className="mt-6 h-14 animate-pulse rounded-[1.5rem] bg-background/70" />
      <div className="mt-4 h-[520px] animate-pulse rounded-[2rem] bg-background/70" />
    </section>
  )
}
