/**
 * mdImport.ts  —  3-level Knowledge Tree Importer
 *
 * The format your MD files use maps perfectly to a 3-level KnowBase hierarchy:
 *
 *   # Git & Version Control        ← Level 0: Root Topic
 *   ## Git Internals & Concepts    ← Level 1: Subtopic (under root)
 *   - Blob (what it stores · ...)  ← Level 2: Sub-subtopic (under subtopic, visible in sidebar!)
 *                                     + Pages inside it (one per "·" item)
 *
 * So for the line:
 *   - History (Facebook Origins · Jordan Walke · 2013 Open Source Release · React 18 · React 19)
 *
 * We create:
 *   Sub-subtopic "History" (appears nested in sidebar under "React Philosophy & Mental Model")
 *     └─ Page "Facebook Origins"
 *     └─ Page "Jordan Walke"
 *     └─ Page "2013 Open Source Release"
 *     └─ Page "React 18"
 *     └─ Page "React 19"
 *
 * If a bullet has NO "·" items (e.g., just "- JSX"), we still create the
 * sub-subtopic, but give it a single page with the bullet text as content
 * (so the sidebar tree is always fully populated).
 *
 * Bullets that use dot-separated inline text WITHOUT parentheses
 * (e.g. "- Blob · Tree · Commit · Tag · Object Database") are also handled:
 * the entire bullet is split by "·" and each part becomes a page.
 */

import { createPage, createTopic } from './db'

// ── Tiny helpers ───────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function withRetry<T>(
  fn:      () => Promise<T>,
  retries  = 3,
  delay    = 600,
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    const pgCode = (err as Record<string, unknown>).code
    if (typeof pgCode === 'string' && pgCode.startsWith('23')) throw err
    if (retries === 0) throw err
    await sleep(delay)
    return withRetry(fn, retries - 1, delay * 2)
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * One bullet line from the MD file, parsed into a sub-subtopic descriptor.
 *
 * "History (Facebook Origins · Jordan Walke · React 18)"
 *   → { title: "History", pages: ["Facebook Origins", "Jordan Walke", "React 18"] }
 *
 * "- Blob · Tree · Commit · Tag"    (no parens, separator in main line)
 *   → { title: "Blob", pages: ["Blob", "Tree", "Commit", "Tag"] }
 *
 * "- JSX"                           (simple, no items)
 *   → { title: "JSX", pages: ["JSX"] }
 */
export interface MdBullet {
  title: string    // sub-subtopic name (shown in sidebar)
  pages: string[]  // page titles to create inside it
}

export interface MdSection {
  title:   string      // ## heading → subtopic name
  bullets: MdBullet[]  // one per bullet line → sub-subtopics
}

export interface MdImportPlan {
  topicName: string
  sections:  MdSection[]
}

// ── Parser ─────────────────────────────────────────────────────────────────

export function parseMdFile(text: string): MdImportPlan {
  const lines      = text.split('\n')
  let   topicName  = 'Imported Topic'
  const sections: MdSection[] = []
  let   current:  MdSection | null = null

  for (const raw of lines) {
    const line = raw.trimEnd()

    // Root topic: single # heading
    if (/^# (?!#)/.test(line)) {
      topicName = line
        .replace(/^#\s*/, '')
        .replace(/^\d+\.?\s+/, '')
        .trim()
      continue
    }

    // Subtopic: ## heading
    if (/^## /.test(line)) {
      if (current) sections.push(current)
      current = { title: line.replace(/^##\s*/, '').trim(), bullets: [] }
      continue
    }

    // Bullet line → sub-subtopic
    if (current && /^\s*[-*]\s+/.test(line)) {
      const raw_bullet = line.replace(/^\s*[-*]\s+/, '').trim()
      if (raw_bullet && raw_bullet !== '---') {
        current.bullets.push(parseBullet(raw_bullet))
      }
    }
  }

  if (current) sections.push(current)
  return { topicName, sections }
}

/**
 * Converts one raw bullet string into an MdBullet.
 *
 * Priority of parsing strategies:
 *   1. "Title (item1 · item2 · item3)" → title from before parens, pages from inside
 *   2. "item1 · item2 · item3"         → first item is title, all are pages
 *   3. "Simple Title"                  → title = page = same string
 */
function parseBullet(bullet: string): MdBullet {
  // Strategy 1: has parenthesised content with ·
  const parenMatch = bullet.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  if (parenMatch) {
    const titlePart = parenMatch[1].trim()
    const inner     = parenMatch[2]

    if (inner.includes('·')) {
      const pages = inner.split('·').map((s) => s.trim()).filter(Boolean)
      return { title: titlePart || pages[0], pages }
    }

    // Parens but no · — treat inner as a single page description
    return { title: titlePart || bullet, pages: [inner.trim()] }
  }

  // Strategy 2: dot-separated items in the main line (no parens)
  if (bullet.includes('·')) {
    const parts = bullet.split('·').map((s) => s.trim()).filter(Boolean)
    return { title: parts[0], pages: parts }
  }

  // Strategy 3: simple string — becomes both the sub-subtopic name and its single page
  return { title: bullet, pages: [bullet] }
}

// ── TipTap JSON builders ───────────────────────────────────────────────────

/**
 * Builds TipTap JSON for a page whose content is a list of string items.
 * Used when we create individual pages from bullet sub-items.
 */
export function buildBulletPageJson(items: string[]): Record<string, unknown> {
  if (!items.length) return { type: 'doc', content: [] }
  return {
    type: 'doc',
    content: [{
      type: 'bulletList',
      content: items.map((item) => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
      })),
    }],
  }
}

/**
 * Builds TipTap JSON for the overview page of a sub-subtopic.
 * Shows the sub-subtopic title as a heading and all page names as a bullet list.
 */
export function buildOverviewPageJson(title: string, pages: string[]): Record<string, unknown> {
  const content: unknown[] = [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: title }],
    },
  ]
  if (pages.length) {
    content.push({
      type: 'bulletList',
      content: pages.map((p) => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: p }] }],
      })),
    })
  }
  return { type: 'doc', content }
}

export function countWordsInJson(json: Record<string, unknown>): number {
  const text = extractPlainText(json as { content?: unknown[] })
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function extractPlainText(node: { text?: string; content?: unknown[] }): string {
  if (node.text) return node.text as string
  return (node.content ?? []).map((c) => extractPlainText(c as typeof node)).join(' ')
}

// ── Icon / color pickers ───────────────────────────────────────────────────

const ICONS  = ['book', 'brain', 'note', 'rocket', 'idea', 'science', 'settings', 'folder']
const COLORS = ['#C76C3A', '#2F6B5F', '#5562A8', '#9C4F7C', '#A6872F', '#3C7EA6']

function pickIcon(i: number)  { return ICONS[i  % ICONS.length] }
function pickColor(i: number) { return COLORS[i % COLORS.length] }

// ── Progress type ──────────────────────────────────────────────────────────

export interface ImportProgress {
  step:    string
  current: number
  total:   number
}

// ── Import executor ────────────────────────────────────────────────────────

/**
 * Executes the import plan against Supabase.
 *
 * For each MD file this creates the following DB records:
 *
 *   1× root topic             (from #)
 *   N× subtopics              (from ## headings)
 *   M× sub-subtopics          (from - bullet lines, nested under subtopics)
 *   P× pages per sub-subtopic (from · items inside each bullet)
 *
 * The sub-subtopics appear in the KnowBase sidebar as nested children,
 * so the full 3-level tree is immediately visible and navigable.
 */
export async function executeMdImport(
  plan:       MdImportPlan,
  parentId:   string | null,
  onProgress: (p: ImportProgress) => void,
): Promise<string> {
  // Pre-calculate total API calls
  const totalBullets = plan.sections.reduce((s, sec) => s + sec.bullets.length, 0)
  // Steps: 1 root + N subtopics + M sub-subtopics + M pages (1 per sub-subtopic, not 1 per item)
  const total   = 1 + plan.sections.length + totalBullets * 2
  let   current = 0

  const progress = (step: string) => onProgress({ step, current: current++, total })

  // ── Step 1: root topic ─────────────────────────────────────────────────
  progress(`Creating topic "${plan.topicName}"`)
  const rootTopic = await withRetry(() => createTopic({
    name: plan.topicName, icon: 'book', color: '#5562A8', description: '', parent_id: parentId,
  }))

  const { updatePage } = await import('./db')

  // ── Steps 2…N: subtopics (parallel bullets per section) ───────────────
  for (let si = 0; si < plan.sections.length; si++) {
    const section = plan.sections[si]

    if (si > 0) await sleep(si % 5 === 0 ? 600 : 80)

    progress(`Subtopic: "${section.title}"`)
    const subtopic = await withRetry(() => createTopic({
      name: section.title, icon: pickIcon(si + 1), color: pickColor(si),
      description: '', parent_id: rootTopic.id, sort_order: si,
    }))

    // ── Bullets in parallel batches of 5 (much faster!) ─────────────────
    const BATCH = 5
    for (let bStart = 0; bStart < section.bullets.length; bStart += BATCH) {
      const batch = section.bullets.slice(bStart, bStart + BATCH)

      await Promise.all(
        batch.map(async (bullet, batchIdx) => {
          const bi = bStart + batchIdx
          progress(`  Sub-topic: "${bullet.title}"`)

          const subsubtopic = await withRetry(() => createTopic({
            name: bullet.title, icon: pickIcon(bi + 2), color: pickColor(bi + 1),
            description: '', parent_id: subtopic.id, sort_order: bi,
          }))

          progress(`    Page: "${bullet.title}"`)
          const json  = buildBulletPageJson(bullet.pages)
          const text  = bullet.pages.join('\n')
          const words = countWordsInJson(json)

          const page = await withRetry(() =>
            createPage({ topic_id: subsubtopic.id, title: bullet.title }),
          )
          await withRetry(() =>
            updatePage(page.id, { content_json: json, content_text: text, word_count: words }),
          )
        }),
      )

      // Small pause between batches to respect the DB connection pool
      if (bStart + BATCH < section.bullets.length) await sleep(60)
    }
  }

  return rootTopic.id
}
