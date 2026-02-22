import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'

import { requireAdmin } from '@/lib/admin-route'
import {
  listSemestersAction,
  createSemesterAction,
  updateSemesterAction,
} from '@/server/actions/course.actions'
import { createSemesterSchema, type CreateSemesterInput } from '@/server/validators/course.schema'
import type { SessionUser, SemesterListItem } from '@/types/dto'

export const Route = createFileRoute('/admin/semesters/')({
  beforeLoad: async () => ({ user: await requireAdmin() }),
  loader: async () => {
    const semesters = await listSemestersAction()
    return { semesters }
  },
  pendingComponent: () => (
    <div className="p-8">
      <TableSkeleton rows={5} cols={6} />
    </div>
  ),
  component: AdminSemestersPage,
})

function AdminSemestersPage() {
  const { semesters: initialSemesters } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [semesters, setSemesters] = useState<SemesterListItem[]>(initialSemesters)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [confirmActivate, setConfirmActivate] = useState<SemesterListItem | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSemesterInput>({
    resolver: zodResolver(createSemesterSchema) as Resolver<CreateSemesterInput>,
  })

  const refreshSemesters = async () => {
    const data = await listSemestersAction()
    setSemesters(data)
  }

  const handleCreate = async (data: CreateSemesterInput) => {
    setCreating(true)
    try {
      const result = await createSemesterAction({ data })
      if (result.success) {
        toast.success('Semester created successfully')
        setDialogOpen(false)
        reset()
        refreshSemesters()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to create semester')
    } finally {
      setCreating(false)
    }
  }

  const handleSetActive = async (semesterId: string) => {
    const result = await updateSemesterAction({
      data: { id: semesterId, isActive: true },
    })
    if (result.success) {
      toast.success('Semester set as active')
      refreshSemesters()
    } else {
      toast.error(result.error.message)
    }
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString()

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Semesters' },
        ]}
      />

      <div className="space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Semester Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage academic semesters and enrollment periods.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Semester
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Semester</DialogTitle>
                <DialogDescription>
                  Define a new academic semester with enrollment dates.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreate)}>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Semester Name</Label>
                      <Input placeholder="Fall 2026" {...register('name')} error={errors.name?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input placeholder="FA2026" {...register('code')} error={errors.code?.message} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" {...register('startDate')} error={errors.startDate?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" {...register('endDate')} error={errors.endDate?.message} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Enrollment Start</Label>
                      <Input type="date" {...register('enrollmentStart')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Enrollment End</Label>
                      <Input type="date" {...register('enrollmentEnd')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Drop Deadline</Label>
                    <Input type="date" {...register('dropDeadline')} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" loading={creating}>
                    Create Semester
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        {semesters.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No semesters yet"
            description="Create your first semester to start managing courses and enrollments."
            action={{ label: 'Create Semester', onClick: () => setDialogOpen(true) }}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semesters.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono">{s.code}</TableCell>
                    <TableCell>
                      {formatDate(s.startDate)} - {formatDate(s.endDate)}
                    </TableCell>
                    <TableCell>
                      {formatDate(s.enrollmentStart)} - {formatDate(s.enrollmentEnd)}
                    </TableCell>
                    <TableCell>{s.courseCount}</TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? 'success' : 'secondary'}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin/semesters/$id" params={{ id: s.id }}>
                          View
                        </Link>
                      </Button>
                      {!s.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmActivate(s)}
                        >
                          Set Active
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {/* Set Active confirmation dialog */}
        <AlertDialog open={!!confirmActivate} onOpenChange={(open) => !open && setConfirmActivate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Set Active Semester</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to set "{confirmActivate?.name}" as the active semester?
                This may affect enrollment availability and course visibility.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmActivate) {
                    handleSetActive(confirmActivate.id)
                    setConfirmActivate(null)
                  }
                }}
              >
                Set Active
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
