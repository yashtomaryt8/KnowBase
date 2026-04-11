export type TopicSummary = {
  id: string
  name: string
  icon: string
  page_count?: number
}

export type Topic = {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  description: string
  parent?: string | null
  parent_id?: string | null
  parent_topic?: TopicSummary | null
  children?: Array<Topic | TopicSummary>
  page_count?: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type Page = {
  id: string
  topic_id: string
  topic_name?: string
  title: string
  content_json: Record<string, unknown>
  content_text: string
  sort_order: number
  is_pinned: boolean
  word_count: number
  created_at: string
  updated_at: string
}

export type SearchResult = {
  id: string
  page_id?: string
  page_title?: string
  title: string
  topic: string
  excerpt: string
  score?: number
}
