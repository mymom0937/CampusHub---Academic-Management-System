import { createFileRoute, redirect } from '@tanstack/react-router'
import { Download, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FormSkeleton } from '@/components/skeletons/FormSkeleton'

import { getSession } from '@/server/actions/auth.actions'
import { getTranscriptAction } from '@/server/actions/grade.actions'
import { GRADE_LABELS } from '@/lib/constants'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/student/transcript')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    if (user.role !== 'STUDENT') throw redirect({ to: '/dashboard' })
    return { user }
  },
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
            <Button onClick={handleDownloadPdf} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
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
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Credits: {entry.semesterCredits}
                  </span>
                  {entry.semesterGpa !== null && (
                    <span className="font-medium">
                      Semester GPA: {entry.semesterGpa.toFixed(3)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Summary */}
        {entries.length > 0 && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">Cumulative Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Total Credits: {summary.totalCredits}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Cumulative GPA</p>
                  <p className="text-3xl font-bold">
                    {summary.cumulativeGpa !== null
                      ? summary.cumulativeGpa.toFixed(3)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
