import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Plus, Search } from 'lucide-react'
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'

import { requireAdmin } from '@/lib/admin-route'
import { listCoursesAction, createCourseAction, listSemestersAction } from '@/server/actions/course.actions'
import { createCourseSchema, type CreateCourseInput } from '@/server/validators/course.schema'
import type { SessionUser, CourseListItem, SemesterListItem } from '@/types/dto'
import type { PaginatedData } from '@/types/api'

export const Route = createFileRoute('/admin/courses/')({
  beforeLoad: async () => ({ user: await requireAdmin() }),
  loader: async () => {
    const [courses, semesters] = await Promise.all([
      listCoursesAction({ data: { page: 1, pageSize: 20 } }),
      listSemestersAction(),
    ])
    return { courses, semesters }
  },
  pendingComponent: () => (
    <div className="p-8">
      <TableSkeleton rows={8} cols={6} />
    </div>
  ),
  component: AdminCoursesPage,
})

function AdminCoursesPage() {
  const { courses: initialCourses, semesters } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [courses, setCourses] = useState<PaginatedData<CourseListItem>>(initialCourses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema) as Resolver<CreateCourseInput>,
    defaultValues: { credits: 3, capacity: 30 },
  })

  const handleSearch = async () => {
    const data = await listCoursesAction({
      data: { page: 1, pageSize: 20, search: searchQuery || undefined },
    })
    setCourses(data)
  }

  const handleCreate = async (data: CreateCourseInput) => {
    setCreating(true)
    try {
      const result = await createCourseAction({ data })
      if (result.success) {
        toast.success('Course created successfully')
        setDialogOpen(false)
        reset()
        handleSearch()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to create course')
    } finally {
      setCreating(false)
    }
  }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Courses' },
        ]}
      />

      <div className="space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Course Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage courses across semesters.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to a semester.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreate)}>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Course Code</Label>
                      <Input placeholder="CS101" {...register('code')} error={errors.code?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label>Credits</Label>
                      <Input type="number" {...register('credits')} error={errors.credits?.message} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Course Name</Label>
                    <Input placeholder="Introduction to Programming" {...register('name')} error={errors.name?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Course description..." {...register('description')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Capacity</Label>
                      <Input type="number" {...register('capacity')} error={errors.capacity?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Select onValueChange={(val) => setValue('semesterId', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((s: SemesterListItem) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.semesterId && (
                        <p className="text-sm text-destructive">{errors.semesterId.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" loading={creating}>
                    {creating ? 'Creating Course…' : 'Create Course'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Table */}
        {courses.items.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description="No courses match your search. Create your first course to get started."
            action={{ label: 'Create Course', onClick: () => setDialogOpen(true) }}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Instructor(s)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">{c.code}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.semesterName}</TableCell>
                    <TableCell>{c.credits}</TableCell>
                    <TableCell>
                      <Badge
                        variant={c.enrolledCount >= c.capacity ? 'destructive' : 'secondary'}
                      >
                        {c.enrolledCount}/{c.capacity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.instructors.length > 0
                        ? c.instructors
                            .map((i) => `${i.firstName} ${i.lastName}`)
                            .join(', ')
                        : <span className="text-muted-foreground">Unassigned</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin/courses/$id" params={{ id: c.id }}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          Showing {courses.items.length} of {courses.total} courses
        </div>
      </div>
    </DashboardLayout>
  )
}
