import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Calendar, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FormSkeleton } from '@/components/skeletons/FormSkeleton'

import { requireAdmin } from '@/lib/admin-route'
import {
  getSemesterDetailAction,
  updateSemesterAction,
  listCoursesAction,
} from '@/server/actions/course.actions'
import { updateSemesterSchema } from '@/server/validators/course.schema'
import type { SessionUser, SemesterListItem } from '@/types/dto'

export const Route = createFileRoute('/admin/semesters/$id')({
  beforeLoad: async () => ({ user: await requireAdmin() }),
  loader: async ({ params }) => {
    const [semester, courses] = await Promise.all([
      getSemesterDetailAction({ data: { id: params.id } }),
      listCoursesAction({
        data: { page: 1, pageSize: 50, semesterId: params.id },
      }),
    ])
    return { semester, courses }
  },
  pendingComponent: () => (
    <div className="p-8">
      <FormSkeleton fields={6} />
    </div>
  ),
  component: AdminSemesterDetailPage,
})

function AdminSemesterDetailPage() {
  const { semester: initialSemester, courses } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const navigate = useNavigate()
  const [semester, setSemester] = useState<SemesterListItem>(initialSemester)
  const [saving, setSaving] = useState(false)

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString()
  const toInputDate = (iso: string) => new Date(iso).toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateSemesterSchema.omit({ id: true })),
    defaultValues: {
      name: semester.name,
      startDate: toInputDate(semester.startDate),
      endDate: toInputDate(semester.endDate),
      enrollmentStart: toInputDate(semester.enrollmentStart),
      enrollmentEnd: toInputDate(semester.enrollmentEnd),
      dropDeadline: toInputDate(semester.dropDeadline),
    },
  })

  const refreshSemester = async () => {
    const updated = await getSemesterDetailAction({
      data: { id: semester.id },
    })
    setSemester(updated)
  }

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const result = await updateSemesterAction({
        data: { id: semester.id, ...data },
      })
      if (result.success) {
        toast.success('Semester updated successfully')
        refreshSemester()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to update semester')
    } finally {
      setSaving(false)
    }
  }

  const handleSetActive = async () => {
    const result = await updateSemesterAction({
      data: { id: semester.id, isActive: true },
    })
    if (result.success) {
      toast.success('Semester set as active')
      refreshSemester()
    } else {
      toast.error(result.error.message)
    }
  }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Semesters', href: '/admin/semesters' },
          { label: semester.name },
        ]}
      />

      <div className="max-w-3xl space-y-6 min-w-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/semesters">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Semesters
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
              {semester.name}
            </h1>
            <p className="text-muted-foreground mt-1 font-mono">
              {semester.code}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={semester.isActive ? 'success' : 'secondary'}>
              {semester.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {!semester.isActive && (
              <Button size="sm" onClick={handleSetActive}>
                Set Active
              </Button>
            )}
          </div>
        </div>

        {/* Semester Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Semester Details
            </CardTitle>
            <CardDescription>
              Dates and enrollment periods.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Semester Period</p>
                <p className="font-medium">
                  {formatDate(semester.startDate)} -{' '}
                  {formatDate(semester.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Enrollment Period
                </p>
                <p className="font-medium">
                  {formatDate(semester.enrollmentStart)} -{' '}
                  {formatDate(semester.enrollmentEnd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Drop Deadline</p>
                <p className="font-medium">
                  {formatDate(semester.dropDeadline)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Courses</p>
                <p className="font-medium">{semester.courseCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses in this semester */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Courses ({courses.total})
            </CardTitle>
            <CardDescription>
              Courses offered in this semester.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.items.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses"
                description="No courses have been added to this semester yet."
                action={{
                  label: 'Go to Courses',
                  onClick: () => navigate({ to: '/admin/courses' }),
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Instructor(s)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.items.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-medium">
                        {c.code}
                      </TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.credits}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.enrolledCount >= c.capacity
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {c.enrolledCount}/{c.capacity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {c.instructors.length > 0
                          ? c.instructors
                              .map((i) => `${i.firstName} ${i.lastName}`)
                              .join(', ')
                          : (
                              <span className="text-muted-foreground">
                                Unassigned
                              </span>
                            )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            to="/admin/courses/$id"
                            params={{ id: c.id }}
                          >
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Edit Form */}
        <Card>
          <form onSubmit={handleSubmit(handleSave)}>
            <CardHeader>
              <CardTitle>Edit Semester</CardTitle>
              <CardDescription>
                Update semester dates and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Semester Name</Label>
                <Input
                  {...register('name')}
                  error={errors.name?.message}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" {...register('startDate')} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" {...register('endDate')} />
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
            </CardContent>
            <CardFooter>
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
