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
import { requireAdmin } from '@/lib/admin-route'
import { listUsersAction } from '@/server/actions/user.actions'
import { getStudentTranscriptAction } from '@/server/actions/grade.actions'
import type { SessionUser, UserListItem } from '@/types/dto'
import type { PaginatedData } from '@/types/api'

export const Route = createFileRoute('/admin/transcripts')({
  beforeLoad: async () => ({ user: await requireAdmin() }),
  loader: async () => {
    const data = await listUsersAction({
      data: { page: 1, pageSize: 100, role: 'STUDENT' },
    })
    return { students: data }
  },
  component: AdminTranscriptsPage,
})

function AdminTranscriptsPage() {
  const { students: initialData } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [students, setStudents] = useState<PaginatedData<UserListItem>>(initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<UserListItem | null>(null)

  const handleSearch = async () => {
    const data = await listUsersAction({
      data: {
        page: 1,
        pageSize: 100,
        role: 'STUDENT',
        search: searchQuery || undefined,
      },
    })
    setStudents(data)
  }

  const studentList = students.items

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Transcripts' },
        ]}
      />

      <div className="space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Student Transcripts
          </h1>
          <p className="text-muted-foreground mt-1">
            View and print grade reports for any student.
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {studentList.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No students found"
            description="Search for students to view their transcripts."
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
                {studentList.map((s) => (
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
            student={{
              id: selectedStudent.id,
              firstName: selectedStudent.firstName,
              lastName: selectedStudent.lastName,
              email: selectedStudent.email,
            }}
            onFetchTranscript={(studentId) =>
              getStudentTranscriptAction({ data: { studentId } })
            }
          />
        )}
      </div>
    </DashboardLayout>
  )
}
