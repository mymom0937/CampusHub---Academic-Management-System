import { useState, useEffect } from 'react'
import { Download, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GRADE_LABELS } from '@/lib/constants'
import type { TranscriptEntry, GpaSummary } from '@/types/dto'

type TranscriptData = {
  transcript: { entries: TranscriptEntry[]; summary: GpaSummary }
  student: { id: string; firstName: string; lastName: string; email: string }
}

interface TranscriptViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: { id: string; firstName: string; lastName: string; email: string }
  /** Preloaded transcript (from server loader). When provided, no client fetch. */
  preloadedData?: TranscriptData | null
  /** Fallback: fetch transcript when preloadedData is not provided */
  onFetchTranscript?: (studentId: string) => Promise<TranscriptData>
}

const DEFAULT_SUMMARY: GpaSummary = {
  cumulativeGpa: null,
  totalCredits: 0,
  totalGradePoints: 0,
  academicStanding: 'N/A',
}

export function TranscriptViewDialog({
  open,
  onOpenChange,
  student,
  preloadedData,
  onFetchTranscript,
}: TranscriptViewDialogProps) {
  const [loading, setLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState<TranscriptData | null>(null)

  const data = preloadedData ?? fetchedData

  // Fetch transcript when dialog opens (Radix may not call onOpenChange on open)
  useEffect(() => {
    if (!open) {
      setFetchedData(null)
      return
    }
    if (student.id && !data && onFetchTranscript) {
      setLoading(true)
      onFetchTranscript(student.id)
        .then(setFetchedData)
        .catch(() => {
          toast.error('Failed to load transcript')
          onOpenChange(false)
        })
        .finally(() => setLoading(false))
    }
  }, [open, student.id])

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen && student.id && !data && onFetchTranscript) {
      setLoading(true)
      try {
        const result = await onFetchTranscript(student.id)
        setFetchedData(result)
      } catch {
        toast.error('Failed to load transcript')
        onOpenChange(false)
      } finally {
        setLoading(false)
      }
    } else if (!isOpen) {
      setFetchedData(null)
    }
    onOpenChange(isOpen)
  }

  const handleDownloadPdf = async () => {
    if (!data) return
    const d = data
    try {
      const { generateTranscriptPdf } = await import('@/lib/generate-transcript-pdf')
      generateTranscriptPdf({
        user: { ...d.student, id: d.student.id, role: 'STUDENT', isActive: true, emailVerified: false },
        entries: d.transcript.entries,
        summary: d.transcript.summary,
      })
      toast.success('Transcript PDF downloaded!')
    } catch {
      toast.error('Failed to generate PDF. Please try again.')
    }
  }

  const handlePrint = () => {
    if (!data) return
    window.print()
  }

  const { entries, summary } = data?.transcript ?? { entries: [], summary: DEFAULT_SUMMARY }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto print:max-w-full print:max-h-none print:shadow-none print:overflow-visible [&>button.absolute]:print:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Academic Transcript — {student.firstName} {student.lastName}
          </DialogTitle>
          <DialogDescription>
            View and export this student&apos;s official transcript.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading transcript...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 print:hidden">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownloadPdf} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>

            {/* Student Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <p className="text-sm text-muted-foreground shrink-0">Student Name</p>
                    <p className="font-medium truncate" title={`${student.firstName} ${student.lastName}`}>
                      {student.firstName} {student.lastName}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <p className="text-sm text-muted-foreground shrink-0">Email</p>
                    <p className="font-medium truncate" title={student.email}>
                      {student.email}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <p className="text-sm text-muted-foreground shrink-0">Cumulative GPA</p>
                    <p className="font-bold text-lg">
                      {summary.cumulativeGpa !== null
                        ? summary.cumulativeGpa.toFixed(3)
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <p className="text-sm text-muted-foreground shrink-0">Academic Standing</p>
                    <Badge
                      variant={
                        summary.academicStanding === "Dean's List"
                          ? 'success'
                          : summary.academicStanding === 'Good Standing'
                            ? 'secondary'
                            : summary.academicStanding === 'Academic Probation'
                              ? 'destructive'
                              : 'outline'
                      }
                      className="w-fit"
                    >
                      {summary.academicStanding}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcript entries */}
            {entries.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                No transcript data yet. Student has no completed coursework.
              </p>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <Card key={entry.semesterCode}>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{entry.semesterName}</CardTitle>
                          <p className="text-xs text-muted-foreground font-mono">
                            {entry.semesterCode}
                          </p>
                        </div>
                        {entry.semesterGpa !== null && (
                          <p className="text-sm font-medium">
                            GPA: {entry.semesterGpa.toFixed(3)}
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-[5rem_1fr_5rem_4rem_5rem] gap-x-2 gap-y-2 text-xs text-muted-foreground font-medium mb-2">
                        <span>Code</span>
                        <span>Course Title</span>
                        <span className="text-center">Credit Hr</span>
                        <span className="text-center">Grade</span>
                        <span className="text-right">Points</span>
                      </div>
                      <div className="space-y-2">
                        {entry.courses.map((course) => (
                          <div
                            key={course.courseCode}
                            className="grid grid-cols-[5rem_1fr_5rem_4rem_5rem] gap-x-2 items-center py-1.5 text-sm"
                          >
                            <span className="font-mono font-medium truncate">{course.courseCode}</span>
                            <span className="truncate min-w-0">{course.courseName}</span>
                            <span className="text-center text-muted-foreground">{course.credits} cr</span>
                            <div className="flex justify-center min-w-0">
                              {course.grade ? (
                                <Badge variant="outline" className="justify-center text-xs w-10">
                                  {GRADE_LABELS[course.grade] || course.grade}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                            <span className="text-muted-foreground tabular-nums text-right">
                              {course.grade && course.gradePoints != null ? course.gradePoints.toFixed(2) : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-sm font-medium">
                        <span>Totals: {entry.semesterCredits} cr · {entry.semesterGradePoints.toFixed(2)} pts</span>
                        {entry.semesterGpa !== null && (
                          <span>Semester GPA: {entry.semesterGpa.toFixed(2)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {entries.length > 0 && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Academic Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {summary.progression ? (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-[1fr_5rem_5rem_5rem] gap-4 font-medium">
                        <span className="text-muted-foreground"></span>
                        <span className="text-center">Credit Hrs</span>
                        <span className="text-center">Grade Pts</span>
                        <span className="text-center">GPA</span>
                      </div>
                      <div className="grid grid-cols-[1fr_5rem_5rem_5rem] gap-4">
                        <span className="text-muted-foreground">Previous Total</span>
                        <span className="text-center">{summary.progression.previousTotalCredits}</span>
                        <span className="text-center">{summary.progression.previousTotalGradePoints.toFixed(2)}</span>
                        <span className="text-center">{summary.progression.previousGpa !== null ? summary.progression.previousGpa.toFixed(2) : 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-[1fr_5rem_5rem_5rem] gap-4">
                        <span className="text-muted-foreground">Semester Total</span>
                        <span className="text-center">{summary.progression.lastSemesterCredits}</span>
                        <span className="text-center">{summary.progression.lastSemesterGradePoints.toFixed(2)}</span>
                        <span className="text-center">{summary.progression.lastSemesterGpa !== null ? summary.progression.lastSemesterGpa.toFixed(2) : 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-[1fr_5rem_5rem_5rem] gap-4 font-medium">
                        <span className="text-muted-foreground">Cumulative Average</span>
                        <span className="text-center">{summary.progression.cumulativeCredits}</span>
                        <span className="text-center">{summary.progression.cumulativeGradePoints.toFixed(2)}</span>
                        <span className="text-center">{summary.progression.cumulativeGpa !== null ? summary.progression.cumulativeGpa.toFixed(2) : 'N/A'}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-muted-foreground">Academic Status: </span>
                        <Badge variant={summary.progression.academicStatus === 'Promoted' ? 'success' : 'destructive'}>
                          {summary.progression.academicStatus}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Total Credits: {summary.totalCredits}</p>
                      <p className="text-lg font-bold">
                        {summary.cumulativeGpa !== null ? summary.cumulativeGpa.toFixed(3) : 'N/A'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
