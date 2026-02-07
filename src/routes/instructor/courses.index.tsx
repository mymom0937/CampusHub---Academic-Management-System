import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { BookOpen, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsSkeleton } from '@/components/skeletons/CardSkeleton'
import { getSession } from '@/server/actions/auth.actions'
import { getInstructorCoursesAction } from '@/server/actions/course.actions'
import type { SessionUser, CourseListItem } from '@/types/dto'

export const Route = createFileRoute('/instructor/courses/')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    if (user.role !== 'INSTRUCTOR') throw redirect({ to: '/dashboard' })
    return { user }
  },
  loader: async () => {
    const courses = await getInstructorCoursesAction()
    return { courses }
  },
  pendingComponent: () => {
    return <div className="p-8"><StatsSkeleton count={4} /></div>
  },
  component: InstructorCoursesPage,
})

function InstructorCoursesPage() {
  const { courses } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[
        { label: 'Instructor', href: '/instructor' },
        { label: 'My Courses' },
      ]} />
      <div className="space-y-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Courses assigned to you for grading.
          </p>
        </div>
        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No assigned courses"
            description="You have not been assigned to any courses yet."
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 min-w-0 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: CourseListItem) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono">
                      {course.code}
                    </Badge>
                    <Badge variant="secondary">
                      {course.enrolledCount} students
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                  <CardDescription>
                    {course.credits} credits | {course.semesterName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.description && (
                    <p className="text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link
                      to="/instructor/courses/$id"
                      params={{ id: course.id }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Details
                    </Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link
                      to="/instructor/grades/$courseId"
                      params={{ courseId: course.id }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Grade
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
