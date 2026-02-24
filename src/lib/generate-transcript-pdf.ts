import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { GRADE_LABELS } from '@/lib/constants'
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

  // ─── Semester Sections (Grade Report: semester as primary unit) ────────────
  for (const entry of entries) {
    if (y > 250) {
      doc.addPage()
      y = 15
    }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`${entry.semesterName} (${entry.semesterCode})`, 14, y)
    y += 6

    // Course table with Totals row (semester overall)
    const courseRows = entry.courses.map((course) => [
      course.courseCode,
      course.courseName,
      String(course.credits),
      course.grade ? (GRADE_LABELS[course.grade] || course.grade) : '-',
      course.gradePoints !== null && course.gradePoints !== undefined
        ? course.gradePoints.toFixed(2)
        : '-',
    ])
    const totalsRow = [
      'Totals',
      '',
      String(entry.semesterCredits),
      '',
      entry.semesterGradePoints.toFixed(2),
    ]
    const tableData = [...courseRows, totalsRow]

    autoTable(doc, {
      startY: y,
      head: [['Code', 'Course Title', 'Credit Hr', 'Grade', 'Grade Point']],
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
        0: { cellWidth: 28, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 28, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
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

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2

    // Semester GPA (overall for that semester)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(
      `Semester GPA: ${entry.semesterGpa !== null ? entry.semesterGpa.toFixed(2) : 'N/A'}`,
      pageWidth - 14,
      y,
      { align: 'right' }
    )
    doc.setFont('helvetica', 'normal')
    y += 10
  }

  // ─── Academic Summary (Previous Total → Semester Total → Cumulative) ──────
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
  doc.text('Academic Summary', 14, y)
  y += 7

  const prog = summary.progression
  const summaryRows: string[][] = prog
    ? [
        [
          'Previous Total',
          String(prog.previousTotalCredits),
          prog.previousTotalGradePoints.toFixed(2),
          prog.previousGpa !== null ? prog.previousGpa.toFixed(2) : 'N/A',
        ],
        [
          'Semester Total',
          String(prog.lastSemesterCredits),
          prog.lastSemesterGradePoints.toFixed(2),
          prog.lastSemesterGpa !== null ? prog.lastSemesterGpa.toFixed(2) : 'N/A',
        ],
        [
          'Cumulative Average',
          String(prog.cumulativeCredits),
          prog.cumulativeGradePoints.toFixed(2),
          prog.cumulativeGpa !== null ? prog.cumulativeGpa.toFixed(2) : 'N/A',
        ],
        ['Academic Status', prog.academicStatus, '', ''],
      ]
    : [
        ['Total Credits', String(summary.totalCredits), String(summary.totalGradePoints), summary.cumulativeGpa !== null ? summary.cumulativeGpa.toFixed(2) : 'N/A'],
        ['Academic Status', summary.academicStanding, '', ''],
      ]

  autoTable(doc, {
    startY: y,
    head: [['', 'Credit Hours', 'Grade Points', 'GPA']],
    body: summaryRows,
    theme: 'plain',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  // ─── Save ────────────────────────────────────────────────
  const filename = `transcript_${user.lastName}_${user.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
