import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { GRADE_LABELS, GRADE_POINTS } from '@/lib/constants'
import type { TranscriptEntry, GpaSummary, SessionUser } from '@/types/dto'

interface TranscriptPdfData {
  user: SessionUser
  entries: TranscriptEntry[]
  summary: GpaSummary
}

/**
 * Generates a professional PDF transcript and triggers a download.
 */
export function generateTranscriptPdf({ user, entries, summary }: TranscriptPdfData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 15

  // ─── Header ──────────────────────────────────────────────
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('CampusHub University', pageWidth / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Official Academic Transcript', pageWidth / 2, y, { align: 'center' })
  y += 4

  // Divider line
  doc.setDrawColor(59, 130, 246) // blue
  doc.setLineWidth(0.8)
  doc.line(14, y, pageWidth - 14, y)
  y += 8

  // ─── Student Information ─────────────────────────────────
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Student Name:', 14, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${user.firstName} ${user.lastName}`, 50, y)

  doc.setFont('helvetica', 'bold')
  doc.text('Email:', pageWidth / 2, y)
  doc.setFont('helvetica', 'normal')
  doc.text(user.email, pageWidth / 2 + 20, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Cumulative GPA:', 14, y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    summary.cumulativeGpa !== null ? summary.cumulativeGpa.toFixed(3) : 'N/A',
    50,
    y
  )

  doc.setFont('helvetica', 'bold')
  doc.text('Standing:', pageWidth / 2, y)
  doc.setFont('helvetica', 'normal')
  doc.text(summary.academicStanding, pageWidth / 2 + 20, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Total Credits:', 14, y)
  doc.setFont('helvetica', 'normal')
  doc.text(String(summary.totalCredits), 50, y)

  doc.setFont('helvetica', 'bold')
  doc.text('Date Issued:', pageWidth / 2, y)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }), pageWidth / 2 + 20, y)
  y += 4

  // Divider
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(14, y, pageWidth - 14, y)
  y += 6

  // ─── Semester Sections ───────────────────────────────────
  for (const entry of entries) {
    // Check if we need a new page (leave room for header + at least a few rows)
    if (y > 250) {
      doc.addPage()
      y = 15
    }

    // Semester header
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`${entry.semesterName} (${entry.semesterCode})`, 14, y)

    if (entry.semesterGpa !== null) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const gpaText = `Semester GPA: ${entry.semesterGpa.toFixed(3)}`
      doc.text(gpaText, pageWidth - 14, y, { align: 'right' })
    }
    y += 2

    // Course table
    const tableData = entry.courses.map((course) => [
      course.courseCode,
      course.courseName,
      String(course.credits),
      course.grade ? (GRADE_LABELS[course.grade] || course.grade) : '-',
      course.gradePoints !== null && course.gradePoints !== undefined
        ? course.gradePoints.toFixed(2)
        : '-',
    ])

    autoTable(doc, {
      startY: y,
      head: [['Code', 'Course Name', 'Credits', 'Grade', 'Points']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        // footer on each page
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(150)
        doc.text(
          'This is an unofficial transcript generated from CampusHub.',
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
        doc.setTextColor(0)
      },
    })

    // Get the final Y position from autotable
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4

    // Semester credits summary
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Semester Credits: ${entry.semesterCredits}`, pageWidth - 14, y, {
      align: 'right',
    })
    doc.setTextColor(0)
    y += 8
  }

  // ─── Cumulative Summary ──────────────────────────────────
  if (y > 240) {
    doc.addPage()
    y = 15
  }

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.8)
  doc.line(14, y, pageWidth - 14, y)
  y += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Cumulative Summary', 14, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const summaryRows = [
    ['Total Credits Attempted', String(summary.totalCredits)],
    [
      'Cumulative GPA',
      summary.cumulativeGpa !== null ? summary.cumulativeGpa.toFixed(3) : 'N/A',
    ],
    ['Academic Standing', summary.academicStanding],
  ]

  autoTable(doc, {
    startY: y,
    body: summaryRows,
    theme: 'plain',
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'left' },
    },
    margin: { left: 14, right: 14 },
  })

  // ─── Save ────────────────────────────────────────────────
  const filename = `transcript_${user.lastName}_${user.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
