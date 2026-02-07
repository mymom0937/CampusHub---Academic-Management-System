import { Calendar, Clock, BookOpen, AlertTriangle, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SemesterListItem } from '@/types/dto'

interface AcademicCalendarProps {
  semesters: SemesterListItem[]
}

export function AcademicCalendar({ semesters }: AcademicCalendarProps) {
  const now = new Date()

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const getStatus = (semester: SemesterListItem) => {
    const start = new Date(semester.startDate)
    const end = new Date(semester.endDate)
    if (now < start) return 'upcoming'
    if (now > end) return 'completed'
    return 'active'
  }

  const getEnrollmentStatus = (semester: SemesterListItem) => {
    const enrollStart = new Date(semester.enrollmentStart)
    const enrollEnd = new Date(semester.enrollmentEnd)
    if (now < enrollStart) return 'upcoming'
    if (now > enrollEnd) return 'closed'
    return 'open'
  }

  const isDropDeadlinePassed = (semester: SemesterListItem) => {
    return now > new Date(semester.dropDeadline)
  }

  return (
    <div className="space-y-6">
      {semesters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No semesters available.</p>
          </CardContent>
        </Card>
      ) : (
        semesters.map((semester) => {
          const status = getStatus(semester)
          const enrollStatus = getEnrollmentStatus(semester)
          const dropPassed = isDropDeadlinePassed(semester)

          return (
            <Card key={semester.id} className={status === 'active' ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {semester.name}
                      <span className="font-mono text-sm text-muted-foreground">({semester.code})</span>
                    </CardTitle>
                    <CardDescription>{semester.courseCount} courses</CardDescription>
                  </div>
                  <Badge
                    variant={
                      status === 'active' ? 'success' : status === 'upcoming' ? 'secondary' : 'outline'
                    }
                  >
                    {status === 'active' ? 'Current' : status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 min-w-0 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Semester Period */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Semester Period</p>
                      <p className="text-xs text-muted-foreground">{formatDate(semester.startDate)}</p>
                      <p className="text-xs text-muted-foreground">to {formatDate(semester.endDate)}</p>
                    </div>
                  </div>

                  {/* Enrollment Period */}
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        Enrollment
                        <Badge variant={enrollStatus === 'open' ? 'success' : enrollStatus === 'upcoming' ? 'secondary' : 'destructive'} className="text-[10px] px-1.5 py-0">
                          {enrollStatus === 'open' ? 'Open' : enrollStatus === 'upcoming' ? 'Not yet' : 'Closed'}
                        </Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(semester.enrollmentStart)}</p>
                      <p className="text-xs text-muted-foreground">to {formatDate(semester.enrollmentEnd)}</p>
                    </div>
                  </div>

                  {/* Drop Deadline */}
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        Drop Deadline
                        {dropPassed && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Passed</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(semester.dropDeadline)}</p>
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-xs text-muted-foreground">
                        {semester.isActive ? 'Active semester' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
