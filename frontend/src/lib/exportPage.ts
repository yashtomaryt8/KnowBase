/**
 * exportPage.ts
 *
 * Converts TipTap JSON → polished DOCX and PDF.
 *
 * Key improvements over the previous version:
 *  – Tables in PDF now dynamically size row heights so no text is ever truncated.
 *  – Images in DOCX are embedded as actual images (base64 → Uint8Array).
 *  – Blockquote reconstruction no longer tries to read docx internals (that
 *    was the crash bug); it rebuilds paragraphs from extracted text instead.
 *  – Both single-page and full-topic exports work with content_json as the
 *    source of truth; content_text is only the fallback.
 */

import {
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { jsPDF } from 'jspdf'

// ── TipTap node types ──────────────────────────────────────────────────────

interface TTMark { type: string; attrs?: Record<string, unknown> }
interface TTNode {
  type:     string
  attrs?:   Record<string, unknown>
  content?: TTNode[]
  text?:    string
  marks?:   TTMark[]
}

// Grab plain text from a node subtree (used for PDF rendering estimates)
function extractText(node: TTNode): string {
  if (node.text) return node.text
  return (node.content ?? []).map(extractText).join('')
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCX ENGINE
// ══════════════════════════════════════════════════════════════════════════════

const H_LEVEL: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4, 5: HeadingLevel.HEADING_5, 6: HeadingLevel.HEADING_6,
}

/** Convert a TipTap inline node list into docx TextRun[]. */
function inlineToRuns(nodes: TTNode[] = []): TextRun[] {
  return nodes.flatMap((n): TextRun[] => {
    if (n.type === 'hardBreak') return [new TextRun({ text: '', break: 1 })]
    if (n.type !== 'text')      return []
    const marks = n.marks ?? []
    const bold      = marks.some((m) => m.type === 'bold')
    const italic    = marks.some((m) => m.type === 'italic')
    const underline = marks.some((m) => m.type === 'underline')
    const code      = marks.some((m) => m.type === 'code')
    return [new TextRun({ text: n.text ?? '', bold, italics: italic, underline: underline ? {} : undefined, font: code ? 'Courier New' : undefined, size: code ? 18 : undefined })]
  })
}

/** Attempt to embed a base64 image from TipTap's Image node. */
function tryImageRun(node: TTNode): ImageRun | null {
  try {
    const src = (node.attrs?.src as string) ?? ''
    if (!src.startsWith('data:image/')) return null
    const [header, b64] = src.split(',')
    if (!b64) return null
    const ext = (header.match(/data:image\/(\w+)/) ?? [])[1] ?? 'png'
    const binary = atob(b64)
    const bytes  = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    // Use attrs dimensions if present; otherwise default to a reasonable size
    const w = Math.min((node.attrs?.width  as number) || 480, 480)
    const h = Math.min((node.attrs?.height as number) || 360, 360)
    return new ImageRun({ data: bytes, transformation: { width: w, height: h }, type: ext as any })
  } catch {
    return null
  }
}

function makeBorderedCell(inlineNodes: TTNode[], isHeader = false): TableCell {
  const runs = inlineToRuns(inlineNodes)
  return new TableCell({
    children: [new Paragraph({
      children: runs.length ? runs : [new TextRun({ text: '' })],
      ...(isHeader ? { heading: HeadingLevel.HEADING_4 } : {}),
    })],
    shading: isHeader ? { fill: 'E8ECF2', type: ShadingType.SOLID } : undefined,
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: 'BBBBBB' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'BBBBBB' },
      left:   { style: BorderStyle.SINGLE, size: 1, color: 'BBBBBB' },
      right:  { style: BorderStyle.SINGLE, size: 1, color: 'BBBBBB' },
    },
  })
}

type DocxBlock = Paragraph | Table

function nodeToDocx(node: TTNode, listLevel = 0, ordered = false, counter = { n: 0 }): DocxBlock[] {
  switch (node.type) {
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1
      return [new Paragraph({ heading: H_LEVEL[level] ?? HeadingLevel.HEADING_1, children: inlineToRuns(node.content), spacing: { before: 260, after: 120 } })]
    }

    case 'paragraph': {
      const runs = inlineToRuns(node.content)
      return [new Paragraph({ children: runs.length ? runs : [new TextRun({ text: '' })], spacing: { after: 100 } })]
    }

    case 'bulletList':
      return (node.content ?? []).flatMap((item) => nodeToDocx(item, listLevel, false, { n: 0 }))

    case 'orderedList': {
      const c = { n: 0 }
      return (node.content ?? []).flatMap((item) => nodeToDocx(item, listLevel, true, c))
    }

    case 'listItem': {
      counter.n++
      const prefix = ordered ? `${counter.n}. ` : '• '
      const children = node.content ?? []
      const firstPara = children[0]
      const textRuns = firstPara
        ? [new TextRun({ text: prefix }), ...inlineToRuns(firstPara.content)]
        : [new TextRun({ text: prefix })]
      const result: DocxBlock[] = [new Paragraph({ children: textRuns, indent: { left: 360 + listLevel * 360 }, spacing: { after: 60 } })]
      for (const child of children.slice(1)) result.push(...nodeToDocx(child, listLevel + 1, false, { n: 0 }))
      return result
    }

    case 'taskList':
      return (node.content ?? []).flatMap((item) => {
        const checked = Boolean(item.attrs?.checked)
        return [new Paragraph({ children: [new TextRun({ text: checked ? '☑ ' : '☐ ' }), ...inlineToRuns(item.content?.[0]?.content)], indent: { left: 360 }, spacing: { after: 60 } })]
      })

    case 'taskItem': {
      const checked = Boolean(node.attrs?.checked)
      return [new Paragraph({ children: [new TextRun({ text: checked ? '☑ ' : '☐ ' }), ...inlineToRuns(node.content?.[0]?.content)], indent: { left: 360 }, spacing: { after: 60 } })]
    }

    case 'codeBlock': {
      const lines = extractText(node).split('\n')
      return lines.map((line) => new Paragraph({
        children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 18 })],
        shading: { fill: 'F4F6F8', type: ShadingType.SOLID },
        indent: { left: 360, right: 360 }, spacing: { after: 0 },
      }))
    }

    case 'blockquote': {
      // FIX: previous code tried p.options?.children which doesn't exist in docx.
      // We now simply extract text and build fresh paragraphs — no reflection needed.
      const text = (node.content ?? []).map(extractText).join('\n').trim()
      return [new Paragraph({
        children: [new TextRun({ text: text || ' ', italics: true, color: '666666' })],
        indent: { left: 720 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'CCCCCC', space: 10 } },
        spacing: { before: 80, after: 80 },
      })]
    }

    case 'horizontalRule':
      return [new Paragraph({ children: [new TextRun({ text: '' })], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'DDDDDD' } }, spacing: { before: 200, after: 200 } })]

    case 'table': {
      const rows = (node.content ?? []).map((rowNode) => {
        const cells = (rowNode.content ?? []).map((cellNode) => {
          const isHeader = cellNode.type === 'tableHeader'
          const inlineNodes: TTNode[] = []
          for (const p of cellNode.content ?? []) { if (p.content) inlineNodes.push(...p.content) }
          return makeBorderedCell(inlineNodes, isHeader)
        })
        return new TableRow({ children: cells })
      })
      return [
        new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
        new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 120 } }),
      ]
    }

    case 'image': {
      const imgRun = tryImageRun(node)
      if (imgRun) return [new Paragraph({ children: [imgRun], spacing: { after: 120 } })]
      // Fallback: descriptive text placeholder
      const alt = (node.attrs?.alt as string) || 'image'
      return [new Paragraph({ children: [new TextRun({ text: `[Image: ${alt}]`, italics: true, color: '888888' })], spacing: { after: 120 } })]
    }

    case 'doc':
      return (node.content ?? []).flatMap((c) => nodeToDocx(c))

    default:
      if (node.content) return (node.content ?? []).flatMap((c) => nodeToDocx(c))
      return []
  }
}

function tiptapToDocx(json: Record<string, unknown>): DocxBlock[] {
  return nodeToDocx(json as unknown as TTNode)
}

function dividerPara(color = 'DDDDDD'): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '' })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color, space: 6 } },
    spacing: { before: 280, after: 280 },
  })
}

// ══════════════════════════════════════════════════════════════════════════════
// PDF ENGINE
// ══════════════════════════════════════════════════════════════════════════════

type Margin = { left: number; right: number; top: number; bottom: number }

function renderNodesToPdf(pdf: jsPDF, nodes: TTNode[], y: number, margin: Margin, contentW: number): number {
  const pageH   = pdf.internal.pageSize.getHeight()
  const checkY  = (h: number) => { if (y + h > pageH - margin.bottom) { pdf.addPage(); y = margin.top } }

  for (const n of nodes) {
    switch (n.type) {
      case 'heading': {
        const level = (n.attrs?.level as number) ?? 1
        const sizes = [0, 22, 18, 15, 13, 12, 11]
        const sz    = sizes[level] ?? 13
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(sz)
        pdf.setTextColor(18, 20, 40)
        const text  = extractText(n)
        const lines = pdf.splitTextToSize(text, contentW) as string[]
        y += level <= 2 ? 10 : 6
        for (const line of lines) { checkY(sz + 5); pdf.text(line, margin.left, y); y += sz + 5 }
        y += 4
        break
      }

      case 'paragraph': {
        const text = extractText(n).trim()
        if (!text) { y += 6; break }
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        pdf.setTextColor(42, 44, 62)
        const lines = pdf.splitTextToSize(text, contentW) as string[]
        for (const line of lines) { checkY(16); pdf.text(line, margin.left, y); y += 16 }
        y += 5
        break
      }

      case 'bulletList':
      case 'orderedList': {
        let idx = 0
        for (const item of n.content ?? []) {
          idx++
          const prefix = n.type === 'orderedList' ? `${idx}.  ` : '•  '
          const text   = extractText(item).trim()
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(11)
          pdf.setTextColor(42, 44, 62)
          const lines = pdf.splitTextToSize(prefix + text, contentW - 18) as string[]
          for (let li = 0; li < lines.length; li++) {
            checkY(16)
            pdf.text(li === 0 ? lines[li] : `    ${lines[li]}`, margin.left + 12, y)
            y += 16
          }
          // Recurse into nested lists inside listItem
          if (item.content && item.content.length > 1) {
            y = renderNodesToPdf(pdf, item.content.slice(1), y, { ...margin, left: margin.left + 16 }, contentW - 16)
          }
        }
        y += 4
        break
      }

      case 'taskList': {
        for (const item of n.content ?? []) {
          const checked = Boolean(item.attrs?.checked)
          const text    = extractText(item).trim()
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(11)
          pdf.setTextColor(42, 44, 62)
          const lines = pdf.splitTextToSize((checked ? '☑  ' : '☐  ') + text, contentW - 18) as string[]
          for (const line of lines) { checkY(16); pdf.text(line, margin.left + 12, y); y += 16 }
        }
        y += 4
        break
      }

      case 'blockquote': {
        const text  = (n.content ?? []).map(extractText).join(' ').trim()
        const lines = pdf.splitTextToSize(text, contentW - 28) as string[]
        pdf.setFont('helvetica', 'italic')
        pdf.setFontSize(11)
        pdf.setTextColor(88, 90, 110)
        const barYStart = y - 10
        for (const line of lines) { checkY(16); pdf.text(line, margin.left + 20, y); y += 16 }
        // Draw the left accent bar after we know the full height
        pdf.setDrawColor(180, 182, 195)
        pdf.setLineWidth(2.5)
        pdf.line(margin.left + 3, barYStart, margin.left + 3, y - 4)
        y += 8
        break
      }

      case 'codeBlock': {
        const code   = extractText(n)
        const lines  = code.split('\n')
        const lineH  = 13
        const pad    = 10
        const blockH = lines.length * lineH + pad * 2

        checkY(Math.min(blockH, 200))
        pdf.setFillColor(242, 244, 248)
        pdf.setDrawColor(210, 212, 220)
        pdf.setLineWidth(0.4)
        pdf.roundedRect(margin.left, y - pad, contentW, blockH, 5, 5, 'FD')

        pdf.setFont('courier', 'normal')
        pdf.setFontSize(9.5)
        pdf.setTextColor(55, 60, 85)
        for (const line of lines) { checkY(lineH); pdf.text(line, margin.left + pad, y); y += lineH }
        y += pad + 6
        break
      }

      case 'table': {
        /* ── Proper multi-line table rendering ────────────────────────────────
           For each row we first MEASURE how many lines each cell will need,
           then SET the row height accordingly. This means even a cell with
           200 characters will not truncate — it will wrap and the whole row
           will be taller.                                                    */
        const rows     = n.content ?? []
        if (!rows.length) break

        const colCount = Math.max(...rows.map((r) => (r.content ?? []).length), 1)
        const colW     = contentW / colCount
        const cellPadX = 7
        const cellPadY = 5
        const lineH    = 12
        const fs       = 9.5

        pdf.setFontSize(fs)

        for (let ri = 0; ri < rows.length; ri++) {
          const cells    = rows[ri].content ?? []
          const isHeader = ri === 0 && cells[0]?.type === 'tableHeader'

          // Measure: compute wrapped lines for each cell
          const cellLines = cells.map((cell) => {
            const t = extractText(cell).trim()
            if (!t) return ['']
            return pdf.splitTextToSize(t, colW - cellPadX * 2) as string[]
          })
          const maxLines = Math.max(...cellLines.map((cl) => cl.length), 1)
          const rowH     = maxLines * lineH + cellPadY * 2

          checkY(rowH)

          // Draw cell backgrounds + borders
          for (let ci = 0; ci < colCount; ci++) {
            const x = margin.left + ci * colW
            if (isHeader) {
              pdf.setFillColor(226, 230, 242)
            } else if (ri % 2 === 0) {
              pdf.setFillColor(255, 255, 255)
            } else {
              pdf.setFillColor(248, 249, 253)
            }
            pdf.setDrawColor(200, 204, 218)
            pdf.setLineWidth(0.3)
            pdf.rect(x, y, colW, rowH, 'FD')
          }

          // Draw text
          pdf.setFont('helvetica', isHeader ? 'bold' : 'normal')
          pdf.setFontSize(fs)
          pdf.setTextColor(isHeader ? 20 : 45, isHeader ? 22 : 47, isHeader ? 50 : 72)

          for (let ci = 0; ci < cells.length; ci++) {
            const x     = margin.left + ci * colW + cellPadX
            const lines = cellLines[ci]
            for (let li = 0; li < lines.length; li++) {
              pdf.text(lines[li], x, y + cellPadY + (li + 1) * lineH - 2)
            }
          }

          y += rowH
        }
        y += 12
        break
      }

      case 'image': {
        /* jsPDF can render base64 images inline. We try to add it; if it
           fails (unsupported format etc.) we fall back to a text note. */
        try {
          const src = (n.attrs?.src as string) ?? ''
          if (src.startsWith('data:image/')) {
            const imgW = Math.min(contentW, 440)
            const imgH = imgW * 0.6 // rough 5:3 ratio fallback
            checkY(imgH + 16)
            pdf.addImage(src, 'PNG', margin.left, y, imgW, imgH)
            y += imgH + 12
            break
          }
        } catch { /* fall through */ }
        pdf.setFont('helvetica', 'italic')
        pdf.setFontSize(10)
        pdf.setTextColor(140, 142, 160)
        pdf.text('[Image]', margin.left, y)
        y += 16
        break
      }

      case 'horizontalRule': {
        y += 10
        pdf.setDrawColor(200, 202, 215)
        pdf.setLineWidth(0.5)
        pdf.line(margin.left, y, margin.left + contentW, y)
        y += 14
        break
      }

      case 'doc':
        y = renderNodesToPdf(pdf, n.content ?? [], y, margin, contentW)
        break

      default:
        // Recursively handle unknown block wrappers
        if (n.content) y = renderNodesToPdf(pdf, n.content, y, margin, contentW)
        break
    }
  }

  return y
}

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

export type PageExportInput = {
  title: string
  content_json?: Record<string, unknown>
  content_text?: string
}

export type TopicExportInput = {
  topic: { name: string; description?: string }
  subtopics: Array<{ name: string }>
  pages: PageExportInput[]
}

// ── Single page — DOCX ─────────────────────────────────────────────────────

export async function exportPageAsDocx(page: PageExportInput): Promise<void> {
  const els: DocxBlock[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: page.title, bold: true })], spacing: { after: 240 } }),
    dividerPara(),
  ]

  if (page.content_json) {
    els.push(...tiptapToDocx(page.content_json))
  } else if (page.content_text) {
    for (const line of page.content_text.split('\n'))
      els.push(new Paragraph({ children: [new TextRun({ text: line || '' })], spacing: { after: 100 } }))
  }

  const blob = await Packer.toBlob(new Document({ creator: 'KnowBase', title: page.title, sections: [{ children: els }] }))
  downloadBlob(blob, `${sanitise(page.title)}.docx`)
}

// ── Single page — PDF ─────────────────────────────────────────────────────

export function exportPageAsPdf(page: PageExportInput): void {
  const pdf      = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin   = { left: 56, right: 56, top: 60, bottom: 60 }
  const contentW = pdf.internal.pageSize.getWidth() - margin.left - margin.right
  let y = margin.top

  // Title
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(24); pdf.setTextColor(18, 20, 40)
  const titleLines = pdf.splitTextToSize(page.title, contentW) as string[]
  for (const l of titleLines) { pdf.text(l, margin.left, y); y += 30 }
  y += 4
  pdf.setDrawColor(200, 202, 215); pdf.setLineWidth(0.75)
  pdf.line(margin.left, y, margin.left + contentW, y)
  y += 20

  if (page.content_json) {
    y = renderNodesToPdf(pdf, (page.content_json as unknown as TTNode).content ?? [], y, margin, contentW)
  } else if (page.content_text) {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.setTextColor(42, 44, 62)
    const lines = pdf.splitTextToSize(page.content_text, contentW) as string[]
    for (const l of lines) { if (y + 16 > pdf.internal.pageSize.getHeight() - margin.bottom) { pdf.addPage(); y = margin.top } pdf.text(l, margin.left, y); y += 16 }
  }

  pdf.save(`${sanitise(page.title)}.pdf`)
}

// ── Topic bulk — DOCX ─────────────────────────────────────────────────────

export async function exportTopicAsDocx({ topic, subtopics, pages }: TopicExportInput): Promise<void> {
  const els: DocxBlock[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: topic.name, bold: true })], spacing: { after: 200 } }),
  ]
  if (topic.description) els.push(new Paragraph({ children: [new TextRun({ text: topic.description, italics: true, color: '666666' })], spacing: { after: 120 } }))
  els.push(dividerPara())

  if (subtopics.length) {
    els.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Subtopics' })], spacing: { before: 160, after: 80 } }))
    for (const s of subtopics)
      els.push(new Paragraph({ children: [new TextRun({ text: `• ${s.name}` })], indent: { left: 360 }, spacing: { after: 60 } }))
    els.push(dividerPara())
  }

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    els.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: p.title })], pageBreakBefore: i > 0, spacing: { after: 200 } }))
    if (p.content_json) els.push(...tiptapToDocx(p.content_json))
    else if (p.content_text)
      for (const line of p.content_text.split('\n'))
        els.push(new Paragraph({ children: [new TextRun({ text: line || '' })], spacing: { after: 100 } }))
    if (i < pages.length - 1) els.push(dividerPara('BBBBBB'))
  }

  const blob = await Packer.toBlob(new Document({ creator: 'KnowBase', title: topic.name, sections: [{ children: els }] }))
  downloadBlob(blob, `${sanitise(topic.name)}.docx`)
}

// ── Topic bulk — PDF ──────────────────────────────────────────────────────

export function exportTopicAsPdf({ topic, subtopics, pages }: TopicExportInput): void {
  const pdf      = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin   = { left: 56, right: 56, top: 60, bottom: 60 }
  const pageW    = pdf.internal.pageSize.getWidth()
  const contentW = pageW - margin.left - margin.right
  let y = margin.top

  const hr = () => { y += 8; pdf.setDrawColor(200, 202, 215); pdf.setLineWidth(0.5); pdf.line(margin.left, y, pageW - margin.right, y); y += 16 }

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(26); pdf.setTextColor(15, 18, 38)
  pdf.text(topic.name, margin.left, y); y += 36

  if (topic.description) {
    pdf.setFont('helvetica', 'italic'); pdf.setFontSize(12); pdf.setTextColor(88, 90, 110)
    const lines = pdf.splitTextToSize(topic.description, contentW) as string[]
    for (const l of lines) { pdf.text(l, margin.left, y); y += 16 }
    y += 6
  }
  hr()

  if (subtopics.length) {
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15); pdf.setTextColor(28, 30, 55)
    pdf.text('Subtopics', margin.left, y); y += 22
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.setTextColor(52, 54, 75)
    for (const s of subtopics) { pdf.text(`• ${s.name}`, margin.left + 14, y); y += 18 }
    y += 4; hr()
  }

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    if (i > 0) { pdf.addPage(); y = margin.top }
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20); pdf.setTextColor(15, 18, 38)
    pdf.text(p.title, margin.left, y); y += 28; hr()
    if (p.content_json) {
      y = renderNodesToPdf(pdf, (p.content_json as unknown as TTNode).content ?? [], y, margin, contentW)
    } else if (p.content_text) {
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.setTextColor(42, 44, 62)
      const lines = pdf.splitTextToSize(p.content_text, contentW) as string[]
      for (const l of lines) { if (y + 16 > pdf.internal.pageSize.getHeight() - margin.bottom) { pdf.addPage(); y = margin.top } pdf.text(l, margin.left, y); y += 16 }
    }
  }

  pdf.save(`${sanitise(topic.name)}.pdf`)
}

// ── Utilities ──────────────────────────────────────────────────────────────

function sanitise(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'export'
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
