import { createFileRoute, redirect } from '@tanstack/react-router'
import { Users, BookOpen, Calendar, ClipboardList, TrendingUp, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { StatsSkeleton } from '@/components/skeletons/CardSkeleton'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getSession } from '@/server/actions/auth.actions'
import { getAdminDashboardAction } from '@/server/actions/dashboard.actions'
import { GRADE_LABELS } from '@/lib/constants'
import type { AdminAnalytics, SessionUser } from '@/types/dto'

export const Route = createFileRoute('/admin/')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    if (user.role !== 'ADMIN') throw redirect({ to: '/dashboard' })
    return { user }
  },
  loader: async () => {
    const stats = await getAdminDashboardAction()
    return { stats }
  },
  pendingComponent: () => (
    <div className="p-8">
      <StatsSkeleton count={4} />
    </div>
  ),
  component: AdminDashboard,
})

/** Grade color mapping */
const GRADE_COLORS: Record<string, string> = {
  A_PLUS: 'bg-emerald-500',
  A: 'bg-emerald-500',
  A_MINUS: 'bg-emerald-400',
  B_PLUS: 'bg-blue-500',
  B: 'bg-blue-500',
  B_MINUS: 'bg-blue-400',
  C_PLUS: 'bg-amber-500',
  C: 'bg-amber-500',
  D: 'bg-orange-500',
  F: 'bg-red-500',
  P: 'bg-slate-400',
  I: 'bg-slate-400',
  W: 'bg-slate-400',
}

function AdminDashboard() {
  const { stats } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: `${stats.totalStudents} students, ${stats.totalInstructors} instructors`,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      description: 'Across all semesters',
      icon: <BookOpen className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Active Enrollments',
      value: stats.totalEnrollments,
      description: 'Currently enrolled students',
      icon: <ClipboardList className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Active Semesters',
      value: stats.activeSemesters,
      description: 'Currently running',
      icon: <Calendar className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  // Calculate max enrollment for bar scaling
  const maxCapacity = Math.max(
    ...stats.enrollmentByCourse.map((c) => c.capacity),
    1
  )

  // Total graded for percentage
  const totalGraded = stats.gradeDistribution.reduce((sum, g) => sum + g.count, 0)

  // Role distribution for donut
  const adminCount = stats.totalUsers - stats.totalStudents - stats.totalInstructors
  const roleData = [
    { label: 'Students', count: stats.totalStudents, color: 'bg-blue-500' },
    { label: 'Instructors', count: stats.totalInstructors, color: 'bg-emerald-500' },
    { label: 'Admins', count: adminCount > 0 ? adminCount : 1, color: 'bg-purple-500' },
  ]

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Admin' }, { label: 'Dashboard' }]} />
      <div className="space-y-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.firstName}. Here&apos;s an overview of your system.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statCards.map((card, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Row */}
        <div className="grid gap-4 grid-cols-1 min-w-0 lg:grid-cols-2">
          {/* Enrollment by Course */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Enrollment by Course
              </CardTitle>
              <CardDescription>Current enrollment vs capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.enrollmentByCourse.map((course) => {
                  const pct = Math.round((course.enrolled / course.capacity) * 100)
                  return (
                    <div key={course.courseCode} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono font-medium">{course.courseCode}</span>
                        <span className="text-muted-foreground">
                          {course.enrolled}/{course.capacity} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((course.enrolled / maxCapacity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                {stats.enrollmentByCourse.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No courses available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Grade Distribution
              </CardTitle>
              <CardDescription>
                {totalGraded} total grades awarded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalGraded > 0 ? (
                <div className="space-y-3">
                  {/* Stacked bar */}
                  <div className="h-8 rounded-lg overflow-hidden flex">
                    {stats.gradeDistribution
                      .sort((a, b) => {
                        const order = ['A_PLUS', 'A', 'A_MINUS', 'B_PLUS', 'B', 'B_MINUS', 'C_PLUS', 'C', 'D', 'F', 'P', 'I', 'W']
                        return order.indexOf(a.grade) - order.indexOf(b.grade)
                      })
                      .map((g) => (
                        <div
                          key={g.grade}
                          className={`${GRADE_COLORS[g.grade] || 'bg-slate-400'} flex items-center justify-center`}
                          style={{ width: `${(g.count / totalGraded) * 100}%` }}
                          title={`${GRADE_LABELS[g.grade] || g.grade}: ${g.count}`}
                        >
                          {g.count / totalGraded > 0.08 && (
                            <span className="text-xs font-medium text-white">
                              {GRADE_LABELS[g.grade] || g.grade}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3">
                    {stats.gradeDistribution
                      .sort((a, b) => b.count - a.count)
                      .map((g) => (
                        <div key={g.grade} className="flex items-center gap-1.5 text-sm">
                          <div className={`h-3 w-3 rounded-sm ${GRADE_COLORS[g.grade] || 'bg-slate-400'}`} />
                          <span className="text-muted-foreground">
                            {GRADE_LABELS[g.grade] || g.grade}: {g.count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No grades submitted yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid gap-4 grid-cols-1 min-w-0 lg:grid-cols-2">
          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Roles
              </CardTitle>
              <CardDescription>Breakdown of user types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleData.map((role) => (
                  <div key={role.label} className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${role.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{role.label}</span>
                        <span className="text-muted-foreground">{role.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${role.color}`}
                          style={{ width: `${(role.count / stats.totalUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Enrollments
              </CardTitle>
              <CardDescription>Latest student enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentEnrollments.map((enrollment, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {enrollment.studentName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{enrollment.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            Enrolled in{' '}
                            <Badge variant="outline" className="text-xs py-0 px-1">
                              {enrollment.courseCode}
                            </Badge>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent enrollments</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
