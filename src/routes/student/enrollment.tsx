import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ClipboardList, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'
import { requireStudent } from '@/lib/admin-route'
import { getStudentEnrollmentsAction, dropAction } from '@/server/actions/enrollment.actions'
import { GRADE_LABELS } from '@/lib/constants'
import type { SessionUser, EnrollmentListItem } from '@/types/dto'

export const Route = createFileRoute('/student/enrollment')({
  beforeLoad: async () => ({ user: await requireStudent() }),
  loader: async () => {
    const enrollments = await getStudentEnrollmentsAction()
    return { enrollments }
  },
  pendingComponent: () => <div className="p-8"><TableSkeleton rows={5} cols={6} /></div>,
  component: StudentEnrollmentPage,
})

function StudentEnrollmentPage() {
  const { enrollments: initialEnrollments } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [enrollments, setEnrollments] = useState<EnrollmentListItem[]>(initialEnrollments)
  const [droppingId, setDroppingId] = useState<string | null>(null)
  const [confirmDrop, setConfirmDrop] = useState<EnrollmentListItem | null>(null)

  const refreshEnrollments = async () => {
    const data = await getStudentEnrollmentsAction()
    setEnrollments(data)
  }

  const handleDrop = async (enrollmentId: string) => {
    setDroppingId(enrollmentId)
    try {
      const result = await dropAction({ data: { enrollmentId } })
      if (result.success) {
        toast.success('Course dropped successfully')
        setConfirmDrop(null)
        refreshEnrollments()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to drop course')
    } finally {
      setDroppingId(null)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ENROLLED': return <Badge variant="success">Enrolled</Badge>
      case 'DROPPED': return <Badge variant="destructive">Dropped</Badge>
      case 'COMPLETED': return <Badge variant="secondary">Completed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Student', href: '/student' }, { label: 'My Enrollment' }]} />
      <div className="space-y-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">My Enrollments</h1>
          <p className="text-muted-foreground mt-1">View and manage your current course enrollments.</p>
        </div>
        {enrollments.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No enrollments yet" description="Browse the course catalog to enroll in courses." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div><span className="font-mono font-medium">{e.courseCode}</span><p className="text-sm text-muted-foreground">{e.courseName}</p></div>
                    </TableCell>
                    <TableCell>{e.credits}</TableCell>
                    <TableCell>{e.instructorName || <span className="text-muted-foreground">TBA</span>}</TableCell>
                    <TableCell>{statusBadge(e.status)}</TableCell>
                    <TableCell>{e.grade ? <Badge variant="outline">{GRADE_LABELS[e.grade] || e.grade}</Badge> : <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="text-right">
                      {e.status === 'ENROLLED' && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirmDrop(e)}>
                          <Trash2 className="h-4 w-4 mr-1" />Drop
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <AlertDialog
        open={!!confirmDrop}
        onOpenChange={(open) => !open && setConfirmDrop(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Drop Course</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to drop <strong>{confirmDrop?.courseCode} - {confirmDrop?.courseName}</strong>?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDrop && handleDrop(confirmDrop.id)} disabled={droppingId !== null} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {droppingId ? 'Dropping...' : 'Drop Course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
