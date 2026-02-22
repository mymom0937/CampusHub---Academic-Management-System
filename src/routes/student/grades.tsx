import { createFileRoute } from '@tanstack/react-router'
import { BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'

import { requireStudent } from '@/lib/admin-route'
import { getTranscriptAction } from '@/server/actions/grade.actions'
import { GRADE_LABELS } from '@/lib/constants'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/student/grades')({
  beforeLoad: async () => ({ user: await requireStudent() }),
  loader: async () => {
    const transcript = await getTranscriptAction()
    return { transcript }
  },
  pendingComponent: () => (
    <div className="p-8">
      <TableSkeleton rows={5} cols={5} />
    </div>
  ),
  component: StudentGradesPage,
})

function StudentGradesPage() {
  const { transcript } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const { entries, summary } = transcript

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Student', href: '/student' },
          { label: 'My Grades' },
        ]}
      />

      <div className="space-y-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">My Grades</h1>
          <p className="text-muted-foreground mt-1">
            View your grades across all semesters.
          </p>
        </div>

        {/* GPA Summary */}
        <div className="grid gap-4 grid-cols-1 min-w-0 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summary.cumulativeGpa !== null
                  ? summary.cumulativeGpa.toFixed(3)
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalCredits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Academic Standing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{summary.academicStanding}</div>
            </CardContent>
          </Card>
        </div>

        {/* Grades by semester */}
        {entries.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No grades yet"
            description="Your grades will appear here once instructors submit them."
          />
        ) : (
          entries.map((entry) => (
            <Card key={entry.semesterCode}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{entry.semesterName}</CardTitle>
                  {entry.semesterGpa !== null && (
                    <Badge variant="secondary">
                      GPA: {entry.semesterGpa.toFixed(3)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entry.courses.map((course) => (
                      <TableRow key={course.courseCode}>
                        <TableCell>
                          <span className="font-mono font-medium">{course.courseCode}</span>
                          <span className="ml-2 text-muted-foreground">{course.courseName}</span>
                        </TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          {course.grade ? (
                            <Badge variant="outline">
                              {GRADE_LABELS[course.grade] || course.grade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              course.status === 'COMPLETED'
                                ? 'secondary'
                                : course.status === 'ENROLLED'
                                  ? 'success'
                                  : 'destructive'
                            }
                          >
                            {course.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
