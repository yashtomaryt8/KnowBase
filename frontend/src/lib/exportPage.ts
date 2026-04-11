/**
 * exportPage.ts
 *
 * Converts TipTap editor JSON into polished DOCX and PDF exports.
 * Handles: headings, paragraphs, bold/italic/underline, bullet/ordered lists,
 * task lists, code blocks, blockquotes, tables, and images (base64).
 *
 * Also provides topic-level bulk export: one file containing the topic header,
 * subtopics list, and all pages in order.
 */

import {
  BorderStyle,
  Document,
  HeadingLevel,
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

// ── TipTap JSON types ──────────────────────────────────────────────────────

interface TipTapMark {
  type: string
  attrs?: Record<string, unknown>
}

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: TipTapMark[]
}

// ── Utility: collect plain text from a TipTap node tree ────────────────────

function extractText(node: TipTapNode): string {
  if (node.text) return node.text
  return (node.content ?? []).map(extractText).join('')
}

// ── DOCX helpers ───────────────────────────────────────────────────────────

const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
}

/** Convert a TipTap inline node array into docx TextRuns. */
function inlineToRuns(nodes: TipTapNode[] = []): TextRun[] {
  return nodes.flatMap((node): TextRun[] => {
    if (node.type === 'hardBreak') {
      return [new TextRun({ text: '', break: 1 })]
    }

    if (node.type !== 'text') return []

    const marks = node.marks ?? []
    const bold = marks.some((m) => m.type === 'bold')
    const italic = marks.some((m) => m.type === 'italic')
    const underline = marks.some((m) => m.type === 'underline')
    const code = marks.some((m) => m.type === 'code')

    return [
      new TextRun({
        text: node.text ?? '',
        bold,
        italics: italic,
        underline: underline ? {} : undefined,
        font: code ? 'Courier New' : undefined,
        size: code ? 18 : undefined,
      }),
    ]
  })
}

/** Build a simple bordered table cell (header or data). */
function makeCell(children: TipTapNode[], isHeader = false): TableCell {
  const runs = inlineToRuns(children)
  return new TableCell({
    children: [
      new Paragraph({
        children: runs.length ? runs : [new TextRun({ text: '' })],
        ...(isHeader ? { heading: HeadingLevel.HEADING_4 } : {}),
      }),
    ],
    shading: isHeader
      ? { fill: 'E8E8E8', type: ShadingType.SOLID }
      : undefined,
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      left:   { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      right:  { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
    },
  })
}

/**
 * Convert a single TipTap node into an array of docx block elements.
 * Returns an array because lists and tables expand to multiple items.
 */
function nodeToDocx(
  node: TipTapNode,
  listLevel = 0,
  ordered = false,
  listCounter = { count: 0 },
): Array<Paragraph | Table> {
  switch (node.type) {
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1
      return [
        new Paragraph({
          heading: HEADING_MAP[level] ?? HeadingLevel.HEADING_1,
          children: inlineToRuns(node.content),
          spacing: { before: 240, after: 120 },
        }),
      ]
    }

    case 'paragraph': {
      const children = inlineToRuns(node.content)
      return [
        new Paragraph({
          children: children.length ? children : [new TextRun({ text: '' })],
          spacing: { after: 120 },
        }),
      ]
    }

    case 'bulletList': {
      return (node.content ?? []).flatMap((item) =>
        nodeToDocx(item, listLevel, false, listCounter),
      )
    }

    case 'orderedList': {
      const counter = { count: 0 }
      return (node.content ?? []).flatMap((item) =>
        nodeToDocx(item, listLevel, true, counter),
      )
    }

    case 'listItem': {
      listCounter.count += 1
      const prefix = ordered ? `${listCounter.count}. ` : '• '
      const indent = listLevel * 360

      const children = node.content ?? []
      const firstPara = children[0]
      const textRuns = firstPara
        ? [new TextRun({ text: prefix }), ...inlineToRuns(firstPara.content)]
        : [new TextRun({ text: prefix })]

      const result: Array<Paragraph | Table> = [
        new Paragraph({
          children: textRuns,
          indent: { left: 360 + indent },
          spacing: { after: 60 },
        }),
      ]

      // Nested lists
      for (const child of children.slice(1)) {
        result.push(...nodeToDocx(child, listLevel + 1, false, { count: 0 }))
      }
      return result
    }

    case 'taskList': {
      return (node.content ?? []).flatMap((item) => {
        const checked = Boolean(item.attrs?.checked)
        const symbol = checked ? '☑ ' : '☐ '
        const textRuns = [
          new TextRun({ text: symbol }),
          ...inlineToRuns(item.content?.[0]?.content),
        ]
        return [
          new Paragraph({
            children: textRuns,
            indent: { left: 360 },
            spacing: { after: 60 },
          }),
        ]
      })
    }

    case 'taskItem': {
      const checked = Boolean(node.attrs?.checked)
      const symbol = checked ? '☑ ' : '☐ '
      return [
        new Paragraph({
          children: [new TextRun({ text: symbol }), ...inlineToRuns(node.content?.[0]?.content)],
          indent: { left: 360 },
          spacing: { after: 60 },
        }),
      ]
    }

    case 'codeBlock': {
      const code = extractText(node)
      return code.split('\n').map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 18 })],
            shading: { fill: 'F4F4F4', type: ShadingType.SOLID },
            indent: { left: 360, right: 360 },
            spacing: { after: 0 },
          }),
      )
    }

    case 'blockquote': {
      return (node.content ?? []).flatMap((child) => {
        const paras = nodeToDocx(child)
        return paras.map((p) => {
          if (p instanceof Paragraph) {
            return new Paragraph({
              children: (p as any).options?.children ?? (p as any).root ?? [],
              indent: { left: 720 },
              border: {
                left: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA', space: 12 },
              },
              spacing: { after: 80 },
            } as ConstructorParameters<typeof Paragraph>[0])
          }
          return p
        })
      })
    }

    case 'horizontalRule': {
      return [
        new Paragraph({
          children: [new TextRun({ text: '' })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' } },
          spacing: { before: 200, after: 200 },
        }),
      ]
    }

    case 'table': {
      const rows = (node.content ?? []).map((rowNode) => {
        const cells = (rowNode.content ?? []).map((cellNode) => {
          const isHeader = cellNode.type === 'tableHeader'
          const cellContent = cellNode.content ?? []
          // Flatten nested paragraphs inside cells
          const inlineNodes: TipTapNode[] = []
          for (const p of cellContent) {
            if (p.content) inlineNodes.push(...p.content)
          }
          return makeCell(inlineNodes, isHeader)
        })
        return new TableRow({ children: cells })
      })

      return [
        new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
        // Spacer after table
        new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 120 } }),
      ]
    }

    case 'image': {
      // Images stored as base64 — skip in DOCX for now (base64 decoding is complex)
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: `[Image: ${(node.attrs?.alt as string) || 'embedded image'} — view in original KnowBase page]`,
              italics: true,
              color: '888888',
            }),
          ],
          spacing: { after: 120 },
        }),
      ]
    }

    case 'doc': {
      return (node.content ?? []).flatMap((child) => nodeToDocx(child))
    }

    default: {
      // Unknown node: try to extract text gracefully
      if (node.content) {
        return (node.content ?? []).flatMap((c) => nodeToDocx(c))
      }
      return []
    }
  }
}

/** Convert the root TipTap JSON doc to a flat list of docx elements. */
function tiptapToDocxElements(json: Record<string, unknown>): Array<Paragraph | Table> {
  return nodeToDocx(json as unknown as TipTapNode)
}

// ── Divider paragraph ──────────────────────────────────────────────────────

function dividerPara(color = 'DDDDDD'): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '' })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color, space: 6 } },
    spacing: { before: 280, after: 280 },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

type PageExportInput = {
  title: string
  content_json?: Record<string, unknown>
  content_text?: string
}

type TopicExportInput = {
  topic: { name: string; description?: string }
  subtopics: Array<{ name: string }>
  pages: PageExportInput[]
}

// ── Single page — DOCX ─────────────────────────────────────────────────────

export async function exportPageAsDocx(page: PageExportInput): Promise<void> {
  const bodyElements: Array<Paragraph | Table> = [
    // Title
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: page.title, bold: true })],
      spacing: { after: 240 },
    }),
    dividerPara(),
  ]

  if (page.content_json) {
    bodyElements.push(...tiptapToDocxElements(page.content_json))
  } else if (page.content_text) {
    // Fallback: plain text paragraphs
    for (const line of page.content_text.split('\n')) {
      bodyElements.push(
        new Paragraph({
          children: [new TextRun({ text: line || '' })],
          spacing: { after: 120 },
        }),
      )
    }
  }

  const doc = new Document({
    creator: 'KnowBase',
    title: page.title,
    sections: [{ children: bodyElements }],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${sanitizeFilename(page.title)}.docx`)
}

// ── Single page — PDF ─────────────────────────────────────────────────────

export function exportPageAsPdf(page: PageExportInput): void {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = { left: 56, right: 56, top: 60, bottom: 60 }
  const pageW = pdf.internal.pageSize.getWidth()
  const contentW = pageW - margin.left - margin.right

  let y = margin.top

  const checkPage = (lineH: number) => {
    const pageH = pdf.internal.pageSize.getHeight()
    if (y + lineH > pageH - margin.bottom) {
      pdf.addPage()
      y = margin.top
    }
  }

  // Title
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(26)
  pdf.setTextColor(20, 20, 40)
  checkPage(36)
  pdf.text(page.title, margin.left, y)
  y += 36

  // Divider
  y += 6
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.75)
  pdf.line(margin.left, y, pageW - margin.right, y)
  y += 18

  // Body: walk TipTap JSON for PDF
  if (page.content_json) {
    y = renderTipTapToPdf(pdf, page.content_json as unknown as TipTapNode, y, margin, contentW)
  } else if (page.content_text) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(40, 40, 60)
    const lines = pdf.splitTextToSize(page.content_text, contentW) as string[]
    for (const line of lines) {
      checkPage(16)
      pdf.text(line, margin.left, y)
      y += 16
    }
  }

  pdf.save(`${sanitizeFilename(page.title)}.pdf`)
}

// ── Topic bulk export — DOCX ───────────────────────────────────────────────

export async function exportTopicAsDocx({ topic, subtopics, pages }: TopicExportInput): Promise<void> {
  const elements: Array<Paragraph | Table> = []

  // Cover: topic name
  elements.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: topic.name, bold: true })],
      spacing: { after: 200 },
    }),
  )

  if (topic.description) {
    elements.push(
      new Paragraph({
        children: [new TextRun({ text: topic.description, italics: true, color: '666666' })],
        spacing: { after: 120 },
      }),
    )
  }

  elements.push(dividerPara())

  // Subtopics list
  if (subtopics.length > 0) {
    elements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: 'Subtopics' })],
        spacing: { before: 160, after: 80 },
      }),
    )
    for (const sub of subtopics) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${sub.name}` })],
          indent: { left: 360 },
          spacing: { after: 60 },
        }),
      )
    }
    elements.push(dividerPara())
  }

  // Pages
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]

    elements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: page.title })],
        pageBreakBefore: i > 0, // each page on its own docx page
        spacing: { after: 200 },
      }),
    )

    if (page.content_json) {
      elements.push(...tiptapToDocxElements(page.content_json))
    } else if (page.content_text) {
      for (const line of page.content_text.split('\n')) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: line || '' })],
            spacing: { after: 100 },
          }),
        )
      }
    }

    if (i < pages.length - 1) {
      elements.push(dividerPara('BBBBBB'))
    }
  }

  const doc = new Document({
    creator: 'KnowBase',
    title: topic.name,
    sections: [{ children: elements }],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${sanitizeFilename(topic.name)}.docx`)
}

// ── Topic bulk export — PDF ────────────────────────────────────────────────

export function exportTopicAsPdf({ topic, subtopics, pages }: TopicExportInput): void {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = { left: 56, right: 56, top: 60, bottom: 60 }
  const pageW = pdf.internal.pageSize.getWidth()
  const contentW = pageW - margin.left - margin.right

  let y = margin.top

  const checkPage = (lineH: number) => {
    const pageH = pdf.internal.pageSize.getHeight()
    if (y + lineH > pageH - margin.bottom) {
      pdf.addPage()
      y = margin.top
    }
  }

  const hr = () => {
    y += 8
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.5)
    pdf.line(margin.left, y, pageW - margin.right, y)
    y += 16
  }

  // Cover title
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(28)
  pdf.setTextColor(15, 15, 35)
  pdf.text(topic.name, margin.left, y)
  y += 40

  if (topic.description) {
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(12)
    pdf.setTextColor(90, 90, 110)
    const descLines = pdf.splitTextToSize(topic.description, contentW) as string[]
    for (const line of descLines) {
      checkPage(16)
      pdf.text(line, margin.left, y)
      y += 16
    }
    y += 8
  }

  hr()

  // Subtopics
  if (subtopics.length > 0) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(16)
    pdf.setTextColor(30, 30, 55)
    checkPage(24)
    pdf.text('Subtopics', margin.left, y)
    y += 24

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(55, 55, 75)
    for (const sub of subtopics) {
      checkPage(16)
      pdf.text(`• ${sub.name}`, margin.left + 16, y)
      y += 18
    }
    y += 6
    hr()
  }

  // Pages
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]

    if (i > 0) {
      pdf.addPage()
      y = margin.top
    }

    // Page title
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.setTextColor(15, 15, 35)
    checkPage(30)
    pdf.text(page.title, margin.left, y)
    y += 30
    hr()

    // Content
    if (page.content_json) {
      y = renderTipTapToPdf(pdf, page.content_json as unknown as TipTapNode, y, margin, contentW)
    } else if (page.content_text) {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(40, 40, 60)
      const lines = pdf.splitTextToSize(page.content_text, contentW) as string[]
      for (const line of lines) {
        checkPage(16)
        pdf.text(line, margin.left, y)
        y += 16
      }
    }
  }

  pdf.save(`${sanitizeFilename(topic.name)}.pdf`)
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF rendering engine for TipTap JSON
// ─────────────────────────────────────────────────────────────────────────────

type Margin = { left: number; right: number; top: number; bottom: number }

function renderTipTapToPdf(
  pdf: jsPDF,
  node: TipTapNode,
  startY: number,
  margin: Margin,
  contentW: number,
): number {
  let y = startY
  const pageH = pdf.internal.pageSize.getHeight()
  const checkPage = (h: number) => {
    if (y + h > pageH - margin.bottom) {
      pdf.addPage()
      y = margin.top
    }
  }

  const nodes = node.type === 'doc' ? (node.content ?? []) : [node]

  for (const n of nodes) {
    switch (n.type) {
      case 'heading': {
        const level = (n.attrs?.level as number) ?? 1
        const sizeMap: Record<number, number> = { 1: 20, 2: 17, 3: 15, 4: 13, 5: 12, 6: 11 }
        const sz = sizeMap[level] ?? 13
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(sz)
        pdf.setTextColor(15, 15, 35)
        const text = extractText(n)
        const lines = pdf.splitTextToSize(text, contentW) as string[]
        y += 8
        for (const line of lines) {
          checkPage(sz + 4)
          pdf.text(line, margin.left, y)
          y += sz + 4
        }
        y += 6
        break
      }

      case 'paragraph': {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        pdf.setTextColor(40, 40, 60)
        const text = extractText(n)
        if (!text.trim()) { y += 8; break }
        const lines = pdf.splitTextToSize(text, contentW) as string[]
        for (const line of lines) {
          checkPage(16)
          pdf.text(line, margin.left, y)
          y += 16
        }
        y += 4
        break
      }

      case 'bulletList':
      case 'orderedList': {
        let idx = 0
        for (const item of n.content ?? []) {
          idx++
          const prefix = n.type === 'orderedList' ? `${idx}.  ` : '•  '
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(11)
          pdf.setTextColor(40, 40, 60)
          const text = extractText(item)
          const lines = pdf.splitTextToSize(prefix + text, contentW - 20) as string[]
          for (let li = 0; li < lines.length; li++) {
            checkPage(16)
            pdf.text(li === 0 ? lines[li] : '    ' + lines[li], margin.left + 12, y)
            y += 16
          }
        }
        y += 4
        break
      }

      case 'taskList': {
        for (const item of n.content ?? []) {
          const checked = Boolean(item.attrs?.checked)
          const symbol = checked ? '☑  ' : '☐  '
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(11)
          pdf.setTextColor(40, 40, 60)
          const text = extractText(item)
          const lines = pdf.splitTextToSize(symbol + text, contentW - 20) as string[]
          for (const line of lines) {
            checkPage(16)
            pdf.text(line, margin.left + 12, y)
            y += 16
          }
        }
        y += 4
        break
      }

      case 'blockquote': {
        pdf.setFont('helvetica', 'italic')
        pdf.setFontSize(11)
        pdf.setTextColor(90, 90, 110)
        const text = extractText(n)
        const lines = pdf.splitTextToSize(text, contentW - 32) as string[]
        // Left bar
        const barX = margin.left
        const barYStart = y - 12
        for (const line of lines) {
          checkPage(16)
          pdf.text(line, margin.left + 20, y)
          y += 16
        }
        pdf.setDrawColor(180, 180, 180)
        pdf.setLineWidth(3)
        pdf.line(barX, barYStart, barX, y - 4)
        y += 8
        break
      }

      case 'codeBlock': {
        const code = extractText(n)
        const lines = code.split('\n')
        const blockH = lines.length * 14 + 16

        checkPage(Math.min(blockH, 200))
        // Light background rect
        pdf.setFillColor(244, 244, 246)
        pdf.roundedRect(margin.left, y - 12, contentW, blockH, 4, 4, 'F')

        pdf.setFont('courier', 'normal')
        pdf.setFontSize(10)
        pdf.setTextColor(60, 60, 80)
        for (const line of lines) {
          checkPage(14)
          pdf.text(line, margin.left + 10, y)
          y += 14
        }
        y += 12
        break
      }

      case 'table': {
        // Simple table rendering: header row + data rows
        const rows = n.content ?? []
        if (!rows.length) break

        const colCount = Math.max(...rows.map((r) => (r.content ?? []).length))
        const colW = contentW / colCount

        for (let ri = 0; ri < rows.length; ri++) {
          const row = rows[ri]
          const cells = row.content ?? []
          const isHeader = ri === 0 && cells[0]?.type === 'tableHeader'
          const rowH = 20
          checkPage(rowH)

          pdf.setFillColor(isHeader ? 230 : ri % 2 === 0 ? 255 : 248, isHeader ? 230 : ri % 2 === 0 ? 255 : 248, isHeader ? 235 : 255)
          pdf.rect(margin.left, y - 14, contentW, rowH, 'FD')
          pdf.setDrawColor(200, 200, 200)
          pdf.setLineWidth(0.3)

          pdf.setFont('helvetica', isHeader ? 'bold' : 'normal')
          pdf.setFontSize(10)
          pdf.setTextColor(isHeader ? 30 : 50, isHeader ? 30 : 50, isHeader ? 50 : 70)

          for (let ci = 0; ci < cells.length; ci++) {
            const cellText = extractText(cells[ci]).trim()
            const truncated = cellText.length > 40 ? cellText.slice(0, 37) + '…' : cellText
            pdf.text(truncated, margin.left + ci * colW + 6, y)
          }
          y += rowH
        }
        y += 10
        break
      }

      case 'horizontalRule': {
        y += 10
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.5)
        pdf.line(margin.left, y, margin.left + contentW, y)
        y += 18
        break
      }

      default: {
        // Recurse into unknown block nodes
        if (n.content) {
          y = renderTipTapToPdf(pdf, { ...n, type: 'doc' }, y, margin, contentW)
        }
        break
      }
    }
  }

  return y
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'export'
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}