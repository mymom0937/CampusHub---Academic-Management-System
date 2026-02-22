import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, ClipboardList, GraduationCap, TrendingUp, FileText, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AcademicStandingAlert } from '@/components/AcademicStandingAlert'
import { StatsSkeleton } from '@/components/skeletons/CardSkeleton'
import { requireStudent } from '@/lib/admin-route'
import { getStudentDashboardAction } from '@/server/actions/dashboard.actions'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/student/')({
  beforeLoad: async () => ({ user: await requireStudent() }),
  loader: async () => {
    const stats = await getStudentDashboardAction()
    return { stats }
  },
  pendingComponent: () => (
    <div className="p-8"><StatsSkeleton count={4} /></div>
  ),
  component: StudentDashboard,
})

function StudentDashboard() {
  const { stats } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }

  const statCards = [
    { title: 'Enrolled Courses', value: stats.enrolledCourses, description: 'This semester', icon: <BookOpen className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Completed Courses', value: stats.completedCourses, description: 'All time', icon: <ClipboardList className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Current Credits', value: stats.totalCredits, description: 'This semester', icon: <GraduationCap className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Cumulative GPA', value: stats.currentGpa !== null ? stats.currentGpa.toFixed(2) : 'N/A', description: stats.currentGpa !== null ? (stats.currentGpa >= 3.5 ? "Dean's List" : stats.currentGpa >= 2.0 ? 'Good Standing' : 'Academic Probation') : 'No grades yet', icon: <TrendingUp className="h-5 w-5 text-muted-foreground" /> },
  ]

  // GPA chart constants
  const GPA_MAX = 4.0
  const CHART_HEIGHT = 160

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Student', href: '/student' }, { label: 'Dashboard' }]} />
      <div className="space-y-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.firstName}.</p>
        </div>

        {/* Academic Standing Alert */}
        <AcademicStandingAlert gpa={stats.currentGpa} firstName={user.firstName} />

        {/* Stat Cards */}
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

        {/* GPA Trend + Quick Links */}
        <div className="grid gap-4 grid-cols-1 min-w-0 lg:grid-cols-3">
          {/* GPA Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                GPA Trend
              </CardTitle>
              <CardDescription>Your semester-by-semester GPA performance</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.gpaTrend.length > 0 ? (
                <div className="space-y-4">
                  {/* Chart area */}
                  <div className="relative" style={{ height: CHART_HEIGHT }}>
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((val) => (
                      <div
                        key={val}
                        className="absolute left-8 right-0 border-t border-dashed border-muted"
                        style={{ bottom: `${(val / GPA_MAX) * 100}%` }}
                      >
                        <span className="absolute -left-8 -top-2.5 text-xs text-muted-foreground w-6 text-right">
                          {val.toFixed(1)}
                        </span>
                      </div>
                    ))}

                    {/* Dean's List threshold line */}
                    <div
                      className="absolute left-8 right-0 border-t-2 border-emerald-500/40"
                      style={{ bottom: `${(3.5 / GPA_MAX) * 100}%` }}
                    >
                      <span className="absolute right-0 -top-4 text-[10px] text-emerald-600 font-medium">
                        Dean&apos;s List (3.5)
                      </span>
                    </div>

                    {/* Bars */}
                    <div className="absolute left-8 right-0 bottom-0 top-0 flex items-end justify-around gap-2 px-2">
                      {stats.gpaTrend.map((point, idx) => {
                        const heightPct = (point.gpa / GPA_MAX) * 100
                        const isGood = point.gpa >= 3.5
                        const isWarning = point.gpa < 2.0
                        return (
                          <div key={idx} className="flex flex-col items-center flex-1 max-w-20">
                            {/* GPA value on top */}
                            <span className="text-xs font-bold mb-1">{point.gpa.toFixed(2)}</span>
                            {/* Bar */}
                            <div
                              className={`w-full rounded-t-md transition-all ${
                                isGood
                                  ? 'bg-emerald-500'
                                  : isWarning
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                              }`}
                              style={{ height: `${heightPct}%`, minHeight: 4 }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="flex items-center justify-around pl-8 gap-2">
                    {stats.gpaTrend.map((point, idx) => (
                      <div key={idx} className="text-center flex-1 max-w-20">
                        <span className="text-xs text-muted-foreground font-mono">
                          {point.semesterCode}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                      <span>Dean&apos;s List (3.5+)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                      <span>Good Standing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                      <span>Probation (&lt;2.0)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">GPA trend will appear once you have graded courses.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Links</CardTitle>
              <CardDescription>Navigate to common pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/student/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/student/enrollment">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  My Enrollments
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/student/grades">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  View Grades
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/student/transcript">
                  <FileText className="h-4 w-4 mr-2" />
                  Transcript
                </Link>
              </Button>

              {/* Academic standing badge */}
              {stats.currentGpa !== null && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Academic Standing</p>
                  <Badge
                    variant={
                      stats.currentGpa >= 3.5
                        ? 'success'
                        : stats.currentGpa >= 2.0
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="text-sm"
                  >
                    {stats.currentGpa >= 3.5
                      ? "Dean's List"
                      : stats.currentGpa >= 2.0
                        ? 'Good Standing'
                        : 'Academic Probation'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
