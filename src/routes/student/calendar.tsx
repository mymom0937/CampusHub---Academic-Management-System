import { createFileRoute } from '@tanstack/react-router'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AcademicCalendar } from '@/components/AcademicCalendar'
import { CardSkeleton } from '@/components/skeletons/CardSkeleton'
import { requireStudent } from '@/lib/admin-route'
import { listSemestersAction } from '@/server/actions/course.actions'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/student/calendar')({
  beforeLoad: async () => ({ user: await requireStudent() }),
  loader: async () => {
    const semesters = await listSemestersAction()
    return { semesters }
  },
  pendingComponent: () => (
    <div className="p-8 space-y-4">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  ),
  component: StudentCalendarPage,
})

function StudentCalendarPage() {
  const { semesters } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Student', href: '/student' }, { label: 'Academic Calendar' }]} />
      <div className="space-y-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Academic Calendar</h1>
          <p className="text-muted-foreground mt-1">View semester schedules, enrollment periods, and important deadlines.</p>
        </div>
        <AcademicCalendar semesters={semesters} />
      </div>
    </DashboardLayout>
  )
}
