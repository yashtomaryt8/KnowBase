import { supabase } from "../api/client"
import type { Topic, Page, SearchResult } from "../types"
import slugify from "slugify"

const TOPIC_SELECT =
  "id, name, slug, icon, color, description, parent_id, sort_order, created_at, updated_at"
const PAGE_SELECT =
  "id, topic_id, title, content_json, content_text, sort_order, is_pinned, word_count, created_at, updated_at"

type TopicRow = Pick<
  Topic,
  | "id"
  | "name"
  | "slug"
  | "icon"
  | "color"
  | "description"
  | "parent_id"
  | "sort_order"
  | "created_at"
  | "updated_at"
>

type TopicParentRow = {
  id: string
  name: string
  icon: string
}

type PageRow = Pick<
  Page,
  | "id"
  | "topic_id"
  | "title"
  | "content_json"
  | "content_text"
  | "sort_order"
  | "is_pinned"
  | "word_count"
  | "created_at"
  | "updated_at"
>

type TopicJoin = { name: string } | Array<{ name: string }> | null
type PageWithTopicRow = PageRow & { topics?: TopicJoin }
type SearchRow = {
  id: string
  title: string
  content_text: string
  topic_id: string
  topics?: TopicJoin
}

function mapTopicRow(row: TopicRow): Topic {
  return {
    ...row,
    parent_id: row.parent_id ?? null,
    children: [],
  }
}

function getTopicName(join: TopicJoin | undefined): string {
  if (Array.isArray(join)) {
    return join[0]?.name ?? ""
  }

  return join?.name ?? ""
}

function buildTopicUpdatePayload(data: Partial<Topic>) {
  const payload: Partial<TopicRow> = {}

  if (data.name !== undefined) payload.name = data.name
  if (data.slug !== undefined) payload.slug = data.slug
  if (data.icon !== undefined) payload.icon = data.icon
  if (data.color !== undefined) payload.color = data.color
  if (data.description !== undefined) payload.description = data.description
  if (data.parent_id !== undefined) payload.parent_id = data.parent_id
  if (data.sort_order !== undefined) payload.sort_order = data.sort_order

  return payload
}

function buildPageUpdatePayload(data: Partial<Page>) {
  const payload: Partial<PageRow> = {}

  if (data.topic_id !== undefined) payload.topic_id = data.topic_id
  if (data.title !== undefined) payload.title = data.title
  if (data.content_json !== undefined) payload.content_json = data.content_json
  if (data.content_text !== undefined) payload.content_text = data.content_text
  if (data.sort_order !== undefined) payload.sort_order = data.sort_order
  if (data.is_pinned !== undefined) payload.is_pinned = data.is_pinned
  if (data.word_count !== undefined) payload.word_count = data.word_count

  return payload
}

export async function getTopicTree(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as TopicRow[]
  const topicMap = new Map<string, Topic>()

  for (const row of rows) {
    topicMap.set(row.id, mapTopicRow(row))
  }

  const roots: Topic[] = []

  for (const row of rows) {
    const topic = topicMap.get(row.id)

    if (!topic) {
      continue
    }

    if (row.parent_id) {
      const parent = topicMap.get(row.parent_id)

      if (parent) {
        const children = (parent.children ?? []) as Topic[]
        children.push(topic)
        parent.children = children
      }
      // If parent_id is set but parent doesn't exist (orphan / deleted parent),
      // skip this topic entirely — do NOT push it to roots, which caused the
      // "topics breaking out of their folder" visual bug.
      continue
    }

    roots.push(topic)
  }

  return roots
}

export async function getTopic(id: string): Promise<Topic> {
  const { data: topicData, error: topicError } = await supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .eq("id", id)
    .single()

  if (topicError) throw topicError

  const topic = mapTopicRow(topicData as TopicRow)

  const { data: childData, error: childError } = await supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .eq("parent_id", id)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (childError) throw childError

  topic.children = ((childData ?? []) as TopicRow[]).map(mapTopicRow)

  if (topic.parent_id) {
    const { data: parentData, error: parentError } = await supabase
      .from("topics")
      .select("id, name, icon")
      .eq("id", topic.parent_id)
      .single()

    if (parentError) throw parentError

    topic.parent_topic = parentData as TopicParentRow
  } else {
    topic.parent_topic = null
  }

  return topic
}

export async function createTopic(data: {
  name: string
  icon: string
  color: string
  description: string
  parent_id?: string | null
  sort_order?: number | null
}): Promise<Topic> {
  const baseSlug = slugify(data.name, { lower: true, strict: true })

  for (let attempt = 0; attempt <= 10; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`
    const payload: Record<string, unknown> = {
      name:        data.name,
      slug,
      icon:        data.icon,
      color:       data.color,
      description: data.description,
      parent_id:   data.parent_id ?? null,
    }
    if (data.sort_order !== undefined) payload.sort_order = data.sort_order

    const { data: topicData, error } = await supabase
      .from('topics')
      .insert(payload)
      .select(TOPIC_SELECT)
      .single()

    if (!error) return mapTopicRow(topicData as TopicRow)

    // 23505 = unique_violation — the slug is taken, try next suffix
    if (error.code === '23505') continue

    // Any other DB / network error — surface it immediately
    throw error
  }

  throw new Error(`Could not create a unique slug for topic "${data.name}" after 10 attempts`)
}

export async function updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
  const payload = buildTopicUpdatePayload(data)
  const { data: topicData, error } = await supabase
    .from("topics")
    .update(payload)
    .eq("id", id)
    .select(TOPIC_SELECT)
    .single()

  if (error) throw error

  return mapTopicRow(topicData as TopicRow)
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase.from("topics").delete().eq("id", id)

  if (error) throw error
}

export async function reorderTopics(parentId: string | null, orderedIds: string[]): Promise<void> {
  void parentId

  await Promise.all(
    orderedIds.map(async (topicId, index) => {
      const { error } = await supabase
        .from("topics")
        .update({ sort_order: index })
        .eq("id", topicId)

      if (error) throw error
    }),
  )
}

export async function getPagesByTopic(topicId: string): Promise<Page[]> {
  const { data, error } = await supabase
    .from("pages")
    .select(PAGE_SELECT)
    .eq("topic_id", topicId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) throw error

  return ((data ?? []) as PageRow[]).map((page) => ({ ...page }))
}

export async function getPage(id: string): Promise<Page> {
  const { data, error } = await supabase
    .from("pages")
    .select(`${PAGE_SELECT}, topics(name)`)
    .eq("id", id)
    .single()

  if (error) throw error

  const { topics, ...page } = data as PageWithTopicRow

  return {
    ...page,
    topic_name: getTopicName(topics),
  }
}

export async function createPage(data: { topic_id: string; title: string }): Promise<Page> {
  const { data: pageData, error } = await supabase
    .from("pages")
    .insert({
      topic_id: data.topic_id,
      title: data.title,
      content_json: {},
    })
    .select(PAGE_SELECT)
    .single()

  if (error) throw error

  return { ...(pageData as PageRow) }
}

export async function updatePage(id: string, data: Partial<Page>): Promise<Page> {
  const payload = {
    ...buildPageUpdatePayload(data),
    updated_at: new Date().toISOString(),
  }

  const { data: pageData, error } = await supabase
    .from("pages")
    .update(payload)
    .eq("id", id)
    .select(PAGE_SELECT)
    .single()

  if (error) throw error

  return { ...(pageData as PageRow) }
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from("pages").delete().eq("id", id)

  if (error) throw error
}

export async function getRecentPages(limit = 6): Promise<Page[]> {
  const { data, error } = await supabase
    .from("pages")
    .select(`${PAGE_SELECT}, topics(name)`)
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as PageWithTopicRow[]).map(({ topics, ...page }) => ({
    ...page,
    topic_name: getTopicName(topics),
  }))
}

export async function searchPages(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return []
  }

  const { data, error } = await supabase
    .from("pages")
    .select("id, title, content_text, topic_id, topics(name)")
    .or(`title.ilike.%${query}%,content_text.ilike.%${query}%`)

  if (error) throw error

  return ((data ?? []) as SearchRow[]).map((row) => ({
    id: row.id,
    page_id: row.id,
    title: row.title,
    topic: getTopicName(row.topics),
    excerpt: row.content_text.slice(0, 200),
  }))
}
