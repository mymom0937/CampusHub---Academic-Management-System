import { createFileRoute, redirect } from '@tanstack/react-router'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AcademicCalendar } from '@/components/AcademicCalendar'
import { CardSkeleton } from '@/components/skeletons/CardSkeleton'
import { getSession } from '@/server/actions/auth.actions'
import { listSemestersAction } from '@/server/actions/course.actions'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/admin/calendar')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    if (user.role !== 'ADMIN') throw redirect({ to: '/dashboard' })
    return { user }
  },
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
  component: AdminCalendarPage,
})

function AdminCalendarPage() {
  const { semesters } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Academic Calendar' }]} />
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
