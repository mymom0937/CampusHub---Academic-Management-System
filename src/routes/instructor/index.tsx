import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, Users, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsSkeleton } from '@/components/skeletons/CardSkeleton'
import { requireInstructor } from '@/lib/admin-route'
import { getInstructorDashboardAction } from '@/server/actions/dashboard.actions'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/instructor/')({
  beforeLoad: async () => ({ user: await requireInstructor() }),
  loader: async () => {
    const stats = await getInstructorDashboardAction()
    return { stats }
  },
  pendingComponent: () => <div className="p-8"><StatsSkeleton count={4} /></div>,
  component: InstructorDashboard,
})

function InstructorDashboard() {
  const { stats } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }

  const statCards = [
    { title: 'Assigned Courses', value: stats.assignedCourses, description: 'Current assignments', icon: <BookOpen className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Total Students', value: stats.totalStudents, description: 'Across all courses', icon: <Users className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Graded', value: stats.gradedCount, description: 'Students graded', icon: <CheckCircle className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Pending Grades', value: stats.pendingGrades, description: 'Awaiting grades', icon: <Clock className="h-5 w-5 text-muted-foreground" /> },
  ]

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Instructor', href: '/instructor' }, { label: 'Dashboard' }]} />
      <div className="space-y-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome Back, {user.firstName}.</p>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statCards.map((card, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
