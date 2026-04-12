/**
 * mdImport.ts
 *
 * Parses a Markdown file into a structured import plan and executes it.
 *
 * Expected MD format:
 *   # Topic Name                          ← root topic
 *   ## Subtopic Name                      ← subtopic (child of root)
 *   - Page Title (item1 · item2 · item3)  ← bullet → one Page; items inside () = bullet content
 *   - Simple Bullet                       ← bullet → one empty Page (fill in later)
 *   ---                                   ← separator, ignored
 *
 * Import result:
 *   Topic "React"
 *     └─ Subtopic "React Philosophy & Mental Model"
 *           ├─ Page "History"           content: • Facebook Origins  • Jordan Walke  • React 18
 *           ├─ Page "Why React"         content: • Composability  • Reusability  • Ecosystem
 *           └─ Page "SPA vs MPA"        content: • Single Page App  • Multi Page App  • ...
 */

import { createPage, createTopic } from './db'

// ── Helpers ────────────────────────────────────────────────────────────────

/** Pause execution for `ms` milliseconds. */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Retry a DB call up to `retries` times with exponential back-off.
 * Constraint violations (PostgreSQL 23xxx codes) are never retried because
 * they are deterministic — retrying cannot help. Those are handled at the
 * call site (e.g. createTopic already retries with slug suffixes).
 */
async function withRetry<T>(
  fn:      () => Promise<T>,
  retries  = 3,
  delay    = 600,
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    // Don't retry PostgreSQL integrity constraint violations
    const pgCode = (err as Record<string, unknown>).code
    if (typeof pgCode === 'string' && pgCode.startsWith('23')) throw err
    if (retries === 0) throw err
    await sleep(delay)
    return withRetry(fn, retries - 1, delay * 2)
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * One bullet line parsed into a page entry.
 *
 * "History (Facebook Origins · Jordan Walke · React 18)"
 *   → { title: "History", items: ["Facebook Origins", "Jordan Walke", "React 18"] }
 *
 * "JSX"
 *   → { title: "JSX", items: [] }
 */
export interface MdPage {
  title: string    // text before "(" (or full bullet if no · items)
  items: string[]  // sub-items split by "·" inside "()", empty if none
}

export interface MdSection {
  title: string   // ## heading text
  pages: MdPage[] // one page per bullet line
}

export interface MdImportPlan {
  topicName: string
  sections:  MdSection[]
}

// ── Parser ─────────────────────────────────────────────────────────────────

/**
 * Parses raw Markdown text into a structured import plan.
 *
 * - Single `#` → root topic name
 * - `##` → subtopic (section)
 * - `- ` or `* ` → bullet line → one page under the current section
 *   - If the bullet contains `(item1 · item2)`, items become page content
 *   - If no `·` items, the page is created with empty content
 */
export function parseMdFile(text: string): MdImportPlan {
  const lines       = text.split('\n')
  let   topicName   = 'Imported Topic'
  const sections:   MdSection[] = []
  let   current:    MdSection | null = null

  for (const raw of lines) {
    const line = raw.trimEnd()

    // ── Root topic heading (single #, not ##) ──────────────────────────────
    if (/^# (?!#)/.test(line)) {
      topicName = line
        .replace(/^#\s*/, '')
        .replace(/^\d+\.?\s+/, '')
        .trim()
      continue
    }

    // ── Subtopic / section heading (##) ────────────────────────────────────
    if (/^## /.test(line)) {
      if (current) sections.push(current)
      current = { title: line.replace(/^##\s*/, '').trim(), pages: [] }
      continue
    }

    // ── Bullet line → becomes a page ───────────────────────────────────────
    if (current && /^\s*[-*]\s+/.test(line)) {
      const bullet = line.replace(/^\s*[-*]\s+/, '').trim()
      if (bullet && bullet !== '---') {
        current.pages.push(parseBulletToPage(bullet))
      }
    }
  }

  if (current) sections.push(current)
  return { topicName, sections }
}

/**
 * Converts a single bullet string into an MdPage.
 *
 * Three cases — every page always gets at least one item (nothing ever blank):
 *
 *   1. "History (Facebook Origins · Jordan Walke · React 18)"
 *      → { title: "History", items: ["Facebook Origins", "Jordan Walke", "React 18"] }
 *
 *   2. "CRA (Create React App)"   ← parens but no ·
 *      → { title: "CRA", items: ["Create React App"] }
 *
 *   3. "JSX"                       ← no parens at all
 *      → { title: "JSX", items: ["JSX"] }
 */
function parseBulletToPage(bullet: string): MdPage {
  // Match everything before the last "( ... )" group
  const parenMatch = bullet.match(/^(.*?)\s*\(([^)]+)\)\s*$/)

  if (parenMatch) {
    const titlePart    = parenMatch[1].trim()
    const innerContent = parenMatch[2]

    if (innerContent.includes('·')) {
      // Case 1: multiple items separated by · → bullet list
      const items = innerContent.split('·').map((s) => s.trim()).filter(Boolean)
      return { title: titlePart || bullet, items }
    }

    // Case 2: parens but no · → description/expansion; title = before parens
    if (titlePart) {
      return { title: titlePart, items: [innerContent.trim()] }
    }
  }

  // Case 3: no parens or empty title → full bullet is both title and content item
  return { title: bullet, items: [bullet] }
}

// ── TipTap JSON builder ────────────────────────────────────────────────────

/**
 * Builds TipTap JSON doc content for a page.
 * Each item from the bullet's "(item1 · item2)" becomes a bullet-list entry.
 * Returns an empty doc if the page has no items.
 */
export function buildPageTipTapJson(page: MdPage): Record<string, unknown> {
  if (!page.items.length) return { type: 'doc', content: [] }

  const bulletItems = page.items.map((item) => ({
    type: 'listItem',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
  }))

  return { type: 'doc', content: [{ type: 'bulletList', content: bulletItems }] }
}

/** Count words in a TipTap JSON doc (needed for the word_count field). */
export function countWordsInJson(json: Record<string, unknown>): number {
  const text = extractPlainText(json as { content?: unknown[] })
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function extractPlainText(node: { text?: string; content?: unknown[] }): string {
  if (node.text) return node.text as string
  return (node.content ?? []).map((c) => extractPlainText(c as typeof node)).join(' ')
}

// ── Icon / color helpers ───────────────────────────────────────────────────

const ICONS   = ['book', 'brain', 'note', 'rocket', 'idea', 'science', 'settings', 'folder']
const COLORS  = ['#C76C3A', '#2F6B5F', '#5562A8', '#9C4F7C', '#A6872F', '#3C7EA6']

function pickIcon(index: number)  { return ICONS[index % ICONS.length] }
function pickColor(index: number) { return COLORS[index % COLORS.length] }

// ── Import executor ────────────────────────────────────────────────────────

export interface ImportProgress {
  step:    string
  current: number
  total:   number
}

/**
 * Executes an import plan against the database.
 *
 * Hierarchy created:
 *   Root topic  (1 createTopic)
 *     └─ Subtopic per ## section  (N createTopic)
 *           └─ Page per bullet line  (M createPage + updatePage if has items)
 *
 * @param plan       The parsed import plan
 * @param parentId   Optional parent topic to nest under (null = root level)
 * @param onProgress Progress callback for the UI
 * @returns          ID of the newly created root topic
 */
export async function executeMdImport(
  plan:       MdImportPlan,
  parentId:   string | null,
  onProgress: (p: ImportProgress) => void,
): Promise<string> {
  const totalPageCount = plan.sections.reduce((s, sec) => s + sec.pages.length, 0)
  // 1 root + 1 per subtopic + 1 per page
  const total   = 1 + plan.sections.length + totalPageCount
  let   current = 0

  // ── Step 1: create root topic ────────────────────────────────────────────
  onProgress({ step: `Creating topic "${plan.topicName}"`, current, total })
  const rootTopic = await withRetry(() => createTopic({
    name:        plan.topicName,
    icon:        'book',
    color:       '#5562A8',
    description: '',
    parent_id:   parentId,
  }))
  current++

  // Pre-import updatePage once (avoids repeated dynamic imports inside the loop)
  const { updatePage } = await import('./db')

  // ── Steps 2…N: subtopics + their pages ──────────────────────────────────
  for (let i = 0; i < plan.sections.length; i++) {
    const section = plan.sections[i]

    // Pace requests: short pause between sections, longer every 7th
    if (i > 0) await sleep(i % 7 === 0 ? 1000 : 200)

    // Create subtopic
    onProgress({ step: `Creating subtopic "${section.title}"`, current, total })
    const subtopic = await withRetry(() => createTopic({
      name:        section.title,
      icon:        pickIcon(i + 1),
      color:       pickColor(i),
      description: '',
      parent_id:   rootTopic.id,
      sort_order:  i,          // preserve MD file order
    }))
    current++

    // Create one page per bullet line
    for (let j = 0; j < section.pages.length; j++) {
      const mdPage = section.pages[j]

      // Small pause every 5 pages within a section
      if (j > 0 && j % 5 === 0) await sleep(150)

      onProgress({ step: `Adding page "${mdPage.title}"`, current, total })

      const contentJson = buildPageTipTapJson(mdPage)
      const contentText = mdPage.items.join('\n')
      const wordCount   = countWordsInJson(contentJson)

      const page = await withRetry(() =>
        createPage({ topic_id: subtopic.id, title: mdPage.title }),
      )

      if (mdPage.items.length > 0) {
        await withRetry(() =>
          updatePage(page.id, {
            content_json: contentJson,
            content_text: contentText,
            word_count:   wordCount,
          }),
        )
      }

      current++
    }
  }

  return rootTopic.id
}
