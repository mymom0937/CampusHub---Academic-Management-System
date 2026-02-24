import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { TranscriptViewDialog } from '@/components/transcript/TranscriptViewDialog'
import { requireInstructor } from '@/lib/admin-route'
import { getInstructorStudentsAction, getStudentTranscriptAction } from '@/server/actions/grade.actions'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/instructor/transcripts')({
  beforeLoad: async () => ({ user: await requireInstructor() }),
  loader: async () => {
    const students = await getInstructorStudentsAction()
    return { students }
  },
  component: InstructorTranscriptsPage,
})

function InstructorTranscriptsPage() {
  const { students: initialStudents } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [students] = useState(initialStudents)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string
    firstName: string
    lastName: string
    email: string
  } | null>(null)

  const filtered = searchQuery.trim()
    ? students.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Transcripts' },
        ]}
      />

      <div className="space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Student Transcripts
          </h1>
          <p className="text-muted-foreground mt-1">
            View and print grade reports for students in your courses.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No students found"
            description={
              students.length === 0
                ? "You don't have any students in your courses yet."
                : 'No students match your search.'
            }
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {s.firstName} {s.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(s)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Transcript
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {selectedStudent && (
          <TranscriptViewDialog
            open={!!selectedStudent}
            onOpenChange={(open) => !open && setSelectedStudent(null)}
            student={selectedStudent}
            onFetchTranscript={(studentId) =>
              getStudentTranscriptAction({ data: { studentId } })
            }
          />
        )}
      </div>
    </DashboardLayout>
  )
}
