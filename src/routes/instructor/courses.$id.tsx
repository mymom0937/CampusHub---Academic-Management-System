import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { BookOpen, Users, GraduationCap, ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'
import { getSession } from '@/server/actions/auth.actions'
import { getInstructorCourseDetailAction } from '@/server/actions/course.actions'
import { getCourseGradesAction } from '@/server/actions/grade.actions'
import { GRADE_LABELS } from '@/lib/constants'
import type { SessionUser, StudentGradeEntry, CourseListItem } from '@/types/dto'

export const Route = createFileRoute('/instructor/courses/$id')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    if (user.role !== 'INSTRUCTOR') throw redirect({ to: '/dashboard' })
    return { user }
  },
  loader: async ({ params }) => {
    const [course, students] = await Promise.all([
      getInstructorCourseDetailAction({ data: { id: params.id } }),
      getCourseGradesAction({ data: { courseId: params.id } }),
    ])
    return { course, students }
  },
  pendingComponent: () => (
    <div className="p-8">
      <TableSkeleton rows={8} cols={5} />
    </div>
  ),
  component: InstructorCourseDetailPage,
})

function InstructorCourseDetailPage() {
  const { course, students } = Route.useLoaderData() as {
    course: CourseListItem
    students: StudentGradeEntry[]
  }
  const { user } = Route.useRouteContext() as { user: SessionUser }

  const enrolledCount = students.filter((s) => s.status === 'ENROLLED').length
  const gradedCount = students.filter((s) => s.grade !== null).length
  const pendingCount = students.filter(
    (s) => s.status === 'ENROLLED' && s.grade === null
  ).length

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'My Courses', href: '/instructor/courses' },
          { label: course.code },
        ]}
      />

      <div className="space-y-6 min-w-0">
        {/* Course Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-sm">
                {course.code}
              </Badge>
              <Badge variant="secondary">{course.semesterName}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
              {course.name}
            </h1>
            {course.description && (
              <p className="text-muted-foreground mt-1">
                {course.description}
              </p>
            )}
          </div>
          <Button asChild>
            <Link
              to="/instructor/grades/$courseId"
              params={{ courseId: course.id }}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Grade Students
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 min-w-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course.credits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Enrolled Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enrolledCount}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  / {course.capacity}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gradedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Grades
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>
              Students currently enrolled in this course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students enrolled"
                description="There are no students enrolled in this course yet."
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.enrollmentId}>
                        <TableCell className="font-medium">
                          {s.firstName} {s.lastName}
                        </TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              s.status === 'ENROLLED'
                                ? 'success'
                                : s.status === 'COMPLETED'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {s.grade ? (
                            <Badge variant="outline">
                              {GRADE_LABELS[s.grade] || s.grade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              Not graded
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
