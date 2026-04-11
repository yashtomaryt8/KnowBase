import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"
import { jsPDF } from "jspdf"

export async function exportPageAsDocx(
  page: { title: string; content_text: string }
): Promise<void> {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(page.title)] }),
        ...page.content_text.split("\n").filter(Boolean).map(line =>
          new Paragraph({ children: [new TextRun(line)] })
        ),
      ]
    }]
  })
  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = `${page.title}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportPageAsPdf(page: { title: string; content_text: string }): void {
  const doc   = new jsPDF()
  doc.setFontSize(22)
  doc.text(page.title, 20, 30)
  doc.setFontSize(12)
  const lines = doc.splitTextToSize(page.content_text, 170)
  doc.text(lines, 20, 50)
  doc.save(`${page.title}.pdf`)
}
