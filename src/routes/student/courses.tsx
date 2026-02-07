import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { BookOpen, CheckCircle, Clock, Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsSkeleton } from '@/components/skeletons/CardSkeleton'
import { getSession } from '@/server/actions/auth.actions'
import { getCourseCatalogAction } from '@/server/actions/course.actions'
import { enrollAction } from '@/server/actions/enrollment.actions'
import type { SessionUser, CourseListItem } from '@/types/dto'

export const Route = createFileRoute('/student/courses')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    if (user.role !== 'STUDENT') throw redirect({ to: '/dashboard' })
    return { user }
  },
  loader: async () => {
    const courses = await getCourseCatalogAction({ data: {} })
    return { courses }
  },
  pendingComponent: () => <div className="p-8"><StatsSkeleton count={6} /></div>,
  component: StudentCourseCatalog,
})

function StudentCourseCatalog() {
  const { courses: initialCourses } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [courses, setCourses] = useState<CourseListItem[]>(initialCourses)
  const [searchQuery, setSearchQuery] = useState('')
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)
  const [confirmCourse, setConfirmCourse] = useState<CourseListItem | null>(null)

  const handleSearch = async () => {
    const data = await getCourseCatalogAction({ data: { search: searchQuery || undefined } })
    setCourses(data)
  }

  const handleEnroll = async (courseId: string) => {
    setEnrollingCourseId(courseId)
    try {
      const result = await enrollAction({ data: { courseId } })
      if (result.success) {
        if (result.data.status === 'waitlisted') {
          toast.success(`Added to waitlist! Position: #${result.data.waitlistPosition}`)
        } else {
          toast.success('Successfully enrolled!')
        }
        setConfirmCourse(null)
        const data = await getCourseCatalogAction({ data: { search: searchQuery || undefined } })
        setCourses(data)
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to enroll')
    } finally {
      setEnrollingCourseId(null)
    }
  }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Student', href: '/student' }, { label: 'Course Catalog' }]} />
      <div className="space-y-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Course Catalog</h1>
          <p className="text-muted-foreground mt-1">Browse and enroll in available courses.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <Button variant="outline" onClick={handleSearch}>Search</Button>
        </div>
        {courses.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses available" description="There are no courses available for enrollment in the current semester." />
        ) : (
          <div className="grid gap-4 grid-cols-1 min-w-0 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const isFull = course.enrolledCount >= course.capacity
              return (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono">{course.code}</Badge>
                      <Badge variant={isFull ? 'destructive' : 'success'}>{course.enrolledCount}/{course.capacity}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                    <CardDescription>{course.credits} credits | {course.semesterName}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {course.description && <p className="text-sm text-muted-foreground mb-3">{course.description}</p>}
                    {course.instructors.length > 0 && <p className="text-sm"><span className="text-muted-foreground">Instructor: </span>{course.instructors.map((i) => `${i.firstName} ${i.lastName}`).join(', ')}</p>}
                  </CardContent>
                  <CardFooter>
                    {course.isEnrolled ? (
                      <Button className="w-full" variant="secondary" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />Enrolled
                      </Button>
                    ) : course.isWaitlisted ? (
                      <Button className="w-full" variant="outline" disabled>
                        <Clock className="h-4 w-4 mr-2" />Waitlisted #{course.waitlistPosition}
                      </Button>
                    ) : isFull ? (
                      <Button className="w-full" variant="outline" onClick={() => setConfirmCourse(course)}>
                        <Clock className="h-4 w-4 mr-2" />Join Waitlist
                        {(course.waitlistCount ?? 0) > 0 && (
                          <span className="ml-1 text-xs">({course.waitlistCount} waiting)</span>
                        )}
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => setConfirmCourse(course)}>
                        <UserPlus className="h-4 w-4 mr-2" />Enroll
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      <AlertDialog open={!!confirmCourse} onOpenChange={() => setConfirmCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmCourse && confirmCourse.enrolledCount >= confirmCourse.capacity
                ? 'Join Waitlist'
                : 'Confirm Enrollment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmCourse && confirmCourse.enrolledCount >= confirmCourse.capacity ? (
                <>
                  <strong>{confirmCourse?.code} - {confirmCourse?.name}</strong> is currently full. You will be added to the waitlist and automatically enrolled when a spot opens up.
                </>
              ) : (
                <>
                  Are you sure you want to enroll in <strong>{confirmCourse?.code} - {confirmCourse?.name}</strong>? This will add {confirmCourse?.credits} credits.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmCourse && handleEnroll(confirmCourse.id)} disabled={enrollingCourseId !== null}>
              {enrollingCourseId
                ? 'Processing...'
                : confirmCourse && confirmCourse.enrolledCount >= confirmCourse.capacity
                  ? 'Join Waitlist'
                  : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
