import { createFileRoute } from '@tanstack/react-router'
import { Download, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FormSkeleton } from '@/components/skeletons/FormSkeleton'

import { requireStudent } from '@/lib/admin-route'
import { getTranscriptAction } from '@/server/actions/grade.actions'
import { GRADE_LABELS } from '@/lib/constants'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/student/transcript')({
  beforeLoad: async () => ({ user: await requireStudent() }),
  loader: async () => {
    const transcript = await getTranscriptAction()
    return { transcript }
  },
  pendingComponent: () => (
    <div className="p-8">
      <FormSkeleton fields={6} />
    </div>
  ),
  component: StudentTranscriptPage,
})

function StudentTranscriptPage() {
  const { transcript } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const { entries, summary } = transcript

  const handleDownloadPdf = async () => {
    try {
      const { generateTranscriptPdf } = await import('@/lib/generate-transcript-pdf')
      generateTranscriptPdf({ user, entries, summary })
      toast.success('Transcript PDF downloaded!')
    } catch {
      toast.error('Failed to generate PDF. Please try again.')
    }
  }

  const handlePrint = () => window.print()

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Student', href: '/student' },
          { label: 'Transcript' },
        ]}
      />

      <div className="space-y-6 min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Academic Transcript</h1>
            <p className="text-muted-foreground mt-1">
              Your official academic record.
            </p>
          </div>
          {entries.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownloadPdf} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          )}
        </div>

        {/* Student Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 min-w-0 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cumulative GPA</p>
                <p className="font-bold text-lg">
                  {summary.cumulativeGpa !== null
                    ? summary.cumulativeGpa.toFixed(3)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Standing</p>
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
                >
                  {summary.academicStanding}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcript entries */}
        {entries.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No transcript data"
            description="Your transcript will appear here once you have completed coursework."
          />
        ) : (
          entries.map((entry) => (
            <Card key={entry.semesterCode}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{entry.semesterName}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">
                      {entry.semesterCode}
                    </p>
                  </div>
                  <div className="text-right">
                    {entry.semesterGpa !== null && (
                      <div>
                        <p className="text-sm text-muted-foreground">Semester GPA</p>
                        <p className="text-xl font-bold">{entry.semesterGpa.toFixed(3)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground font-medium mb-2">
                  <span>Code</span>
                  <span>Course Title</span>
                  <span className="text-center">Credit Hr</span>
                  <span className="text-right">Grade · Points</span>
                </div>
                <div className="space-y-2">
                  {entry.courses.map((course) => (
                    <div
                      key={course.courseCode}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium w-20">
                          {course.courseCode}
                        </span>
                        <span className="text-sm">{course.courseName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {course.credits} cr
                        </span>
                        {course.grade ? (
                          <Badge variant="outline" className="min-w-12 justify-center">
                            {GRADE_LABELS[course.grade] || course.grade}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="min-w-12 justify-center text-muted-foreground">
                            -
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {course.gradePoints !== null && course.gradePoints !== undefined
                            ? course.gradePoints.toFixed(2)
                            : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-sm font-medium">
                  <span>
                    Totals: {entry.semesterCredits} cr · {entry.semesterGradePoints.toFixed(2)} pts
                  </span>
                  {entry.semesterGpa !== null && (
                    <span>Semester GPA: {entry.semesterGpa.toFixed(2)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Academic Summary */}
        {entries.length > 0 && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Academic Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.progression ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <span className="text-muted-foreground font-medium"></span>
                    <span className="text-center font-medium">Credit Hrs</span>
                    <span className="text-center font-medium">Grade Pts</span>
                    <span className="text-center font-medium">GPA</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <span className="text-muted-foreground">Previous Total</span>
                    <span className="text-center">{summary.progression.previousTotalCredits}</span>
                    <span className="text-center">{summary.progression.previousTotalGradePoints.toFixed(2)}</span>
                    <span className="text-center">{summary.progression.previousGpa !== null ? summary.progression.previousGpa.toFixed(2) : 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <span className="text-muted-foreground">Semester Total</span>
                    <span className="text-center">{summary.progression.lastSemesterCredits}</span>
                    <span className="text-center">{summary.progression.lastSemesterGradePoints.toFixed(2)}</span>
                    <span className="text-center">{summary.progression.lastSemesterGpa !== null ? summary.progression.lastSemesterGpa.toFixed(2) : 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium">
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
                  <div>
                    <p className="text-sm text-muted-foreground">Total Credits: {summary.totalCredits}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Cumulative GPA</p>
                    <p className="text-2xl font-bold">
                      {summary.cumulativeGpa !== null ? summary.cumulativeGpa.toFixed(3) : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
