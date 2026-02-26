import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, BookOpen, Users, UserPlus, Trash2, Link2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FormSkeleton } from '@/components/skeletons/FormSkeleton'

import { requireAdmin } from '@/lib/admin-route'
import {
  getCourseDetailAction,
  updateCourseAction,
  assignInstructorAction,
  removeInstructorAction,
} from '@/server/actions/course.actions'
import {
  getCoursePrerequisitesAction,
  addPrerequisiteAction,
  removePrerequisiteAction,
} from '@/server/actions/prerequisite.actions'
import { listInstructorsAction } from '@/server/actions/user.actions'
import {
  updateCourseSchema,
} from '@/server/validators/course.schema'
import type { SessionUser, CourseListItem, PrerequisiteItem } from '@/types/dto'

export const Route = createFileRoute('/admin/courses/$id')({
  beforeLoad: async () => ({ user: await requireAdmin() }),
  loader: async ({ params }) => {
    const [course, instructors] = await Promise.all([
      getCourseDetailAction({ data: { id: params.id } }),
      listInstructorsAction(),
    ])
    return { course, instructors }
  },
  pendingComponent: () => (
    <div className="p-8">
      <FormSkeleton fields={6} />
    </div>
  ),
  component: AdminCourseDetailPage,
})

function AdminCourseDetailPage() {
  const { course: initialCourse, instructors } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [course, setCourse] = useState<CourseListItem>(initialCourse)
  const [saving, setSaving] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedInstructorId, setSelectedInstructorId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [removingInstructor, setRemovingInstructor] = useState<{
    id: string
    name: string
  } | null>(null)

  // Prerequisite state
  const [prerequisites, setPrerequisites] = useState<PrerequisiteItem[]>([])
  const [newPrereqCode, setNewPrereqCode] = useState('')
  const [addingPrereq, setAddingPrereq] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateCourseSchema.omit({ id: true })),
    defaultValues: {
      name: course.name,
      description: course.description || '',
      credits: course.credits,
      capacity: course.capacity,
    },
  })

  const refreshCourse = async () => {
    const updated = await getCourseDetailAction({
      data: { id: course.id },
    })
    setCourse(updated)
  }

  const refreshPrerequisites = async () => {
    try {
      const prereqs = await getCoursePrerequisitesAction({ data: { courseCode: course.code } })
      setPrerequisites(prereqs)
    } catch {
      // Silently fail
    }
  }

  useEffect(() => {
    refreshPrerequisites()
  }, [course.code])

  const handleAddPrerequisite = async () => {
    if (!newPrereqCode.trim()) {
      toast.error('Enter a prerequisite course code')
      return
    }
    setAddingPrereq(true)
    try {
      const result = await addPrerequisiteAction({
        data: { courseCode: course.code, prerequisiteCode: newPrereqCode.toUpperCase().trim() },
      })
      if (result.success) {
        toast.success('Prerequisite added')
        setNewPrereqCode('')
        refreshPrerequisites()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to add prerequisite')
    } finally {
      setAddingPrereq(false)
    }
  }

  const handleRemovePrerequisite = async (id: string) => {
    const result = await removePrerequisiteAction({ data: { id } })
    if (result.success) {
      toast.success('Prerequisite removed')
      refreshPrerequisites()
    } else {
      toast.error(result.error.message)
    }
  }

  const handleSave = async (data: {
    name?: string
    description?: string | null
    credits?: number
    capacity?: number
  }) => {
    setSaving(true)
    try {
      const result = await updateCourseAction({
        data: { id: course.id, ...data },
      })
      if (result.success) {
        toast.success('Course updated successfully')
        refreshCourse()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to update course')
    } finally {
      setSaving(false)
    }
  }

  const handleAssignInstructor = async () => {
    if (!selectedInstructorId) {
      toast.error('Please select an instructor')
      return
    }
    setAssigning(true)
    try {
      const result = await assignInstructorAction({
        data: {
          courseId: course.id,
          instructorId: selectedInstructorId,
          isPrimary: course.instructors.length === 0,
        },
      })
      if (result.success) {
        toast.success('Instructor assigned successfully')
        setAssignDialogOpen(false)
        setSelectedInstructorId('')
        refreshCourse()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to assign instructor')
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveInstructor = async (instructorId: string) => {
    try {
      const result = await removeInstructorAction({
        data: { courseId: course.id, instructorId },
      })
      if (result.success) {
        toast.success('Instructor removed successfully')
        setRemovingInstructor(null)
        refreshCourse()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to remove instructor')
    }
  }

  // Filter out already-assigned instructors
  const availableInstructors = instructors.filter(
    (i: { id: string }) => !course.instructors.some((ci) => ci.id === i.id)
  )

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Courses', href: '/admin/courses' },
          { label: `${course.code} - ${course.name}` },
        ]}
      />

      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
              <span className="font-mono">{course.code}</span> - {course.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {course.semesterName} | {course.credits} credits
            </p>
          </div>
          <Badge
            variant={
              course.enrolledCount >= course.capacity
                ? 'destructive'
                : 'secondary'
            }
          >
            {course.enrolledCount}/{course.capacity} enrolled
          </Badge>
        </div>

        {/* Course Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Information
            </CardTitle>
            <CardDescription>
              Overview and enrollment details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 min-w-0 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-mono font-medium">{course.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits</p>
                <p className="font-medium">{course.credits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-medium">{course.capacity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
                <p className="font-medium">{course.enrolledCount}</p>
              </div>
            </div>
            {course.description && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{course.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Instructors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Instructors
              </CardTitle>
              <CardDescription>
                Instructors assigned to teach this course.
              </CardDescription>
            </div>
            <Dialog
              open={assignDialogOpen}
              onOpenChange={setAssignDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Instructor</DialogTitle>
                  <DialogDescription>
                    Select an instructor to assign to this course.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label>Instructor</Label>
                  <Select
                    value={selectedInstructorId}
                    onValueChange={setSelectedInstructorId}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInstructors.length === 0 ? (
                        <SelectItem value="_none" disabled>
                          No available instructors
                        </SelectItem>
                      ) : (
                        availableInstructors.map(
                          (i: {
                            id: string
                            firstName: string
                            lastName: string
                          }) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.firstName} {i.lastName}
                            </SelectItem>
                          )
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAssignInstructor}
                    loading={assigning}
                    disabled={!selectedInstructorId}
                  >
                    {assigning ? 'Assigning…' : 'Assign Instructor'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {course.instructors.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No instructors assigned"
                description="Assign an instructor to this course using the button above."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.instructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="font-medium">
                        {instructor.firstName} {instructor.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={instructor.isPrimary ? 'default' : 'outline'}>
                          {instructor.isPrimary ? 'Primary' : 'Co-Instructor'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setRemovingInstructor({
                              id: instructor.id,
                              name: `${instructor.firstName} ${instructor.lastName}`,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Course Prerequisites
            </CardTitle>
            <CardDescription>
              Students must complete these courses before enrolling in {course.code}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prerequisites.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((p) => (
                  <Badge key={p.id} variant="secondary" className="text-sm gap-1.5 pr-1">
                    <span className="font-mono">{p.prerequisiteCode}</span>
                    <button
                      onClick={() => handleRemovePrerequisite(p.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Course code (e.g. CS101)"
                value={newPrereqCode}
                onChange={(e) => setNewPrereqCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPrerequisite()}
                className="max-w-xs font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPrerequisite}
                disabled={addingPrereq}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Edit Form */}
        <Card>
          <form onSubmit={handleSubmit(handleSave)}>
            <CardHeader>
              <CardTitle>Edit Course</CardTitle>
              <CardDescription>
                Update course details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Course Name</Label>
                <Input
                  {...register('name')}
                  error={errors.name?.message}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...register('description')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input
                    type="number"
                    {...register('credits')}
                    error={errors.credits?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    {...register('capacity')}
                    error={errors.capacity?.message}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" loading={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Remove instructor confirmation */}
      <AlertDialog
        open={!!removingInstructor}
        onOpenChange={() => setRemovingInstructor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Instructor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>{removingInstructor?.name}</strong> from this course?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                removingInstructor &&
                handleRemoveInstructor(removingInstructor.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
