import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { ClipboardList, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'
import { getSession } from '@/server/actions/auth.actions'
import { getCourseGradesAction, submitGradeAction, updateGradeAction, bulkSubmitGradesAction } from '@/server/actions/grade.actions'
import { GRADE_LABELS } from '@/lib/constants'
import type { SubmitGradeInput } from '@/server/validators/enrollment.schema'
import type { SessionUser, StudentGradeEntry } from '@/types/dto'

export const Route = createFileRoute('/instructor/grades/$courseId')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    if (user.role !== 'INSTRUCTOR') throw redirect({ to: '/dashboard' })
    return { user }
  },
  loader: async ({ params }) => {
    const students = await getCourseGradesAction({ data: { courseId: params.courseId } })
    return { students, courseId: params.courseId }
  },
  pendingComponent: () => <div className="p-8"><TableSkeleton rows={8} cols={5} /></div>,
  component: InstructorGradingPage,
})

function InstructorGradingPage() {
  const { students: initialStudents, courseId } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [students, setStudents] = useState<StudentGradeEntry[]>(initialStudents)
  const [pendingGrades, setPendingGrades] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [confirmGrade, setConfirmGrade] = useState<{ enrollmentId: string; isUpdate: boolean } | null>(null)
  const [bulkImporting, setBulkImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refreshStudents = async () => {
    const data = await getCourseGradesAction({ data: { courseId } })
    setStudents(data)
  }

  const handleGradeChange = (enrollmentId: string, grade: string) => {
    setPendingGrades((prev) => ({ ...prev, [enrollmentId]: grade }))
  }

  const handleSubmitGrade = async (enrollmentId: string, isUpdate: boolean) => {
    const grade = pendingGrades[enrollmentId]
    if (!grade) {
      toast.error('Please select a grade first')
      return
    }
    setSubmitting(enrollmentId)
    try {
      const gradeData: SubmitGradeInput = { enrollmentId, grade: grade as SubmitGradeInput['grade'] }
      const result = isUpdate
        ? await updateGradeAction({ data: gradeData })
        : await submitGradeAction({ data: gradeData })
      if (result.success) {
        toast.success(isUpdate ? 'Grade updated successfully' : 'Grade submitted successfully')
        setPendingGrades((prev) => {
          const copy = { ...prev }
          delete copy[enrollmentId]
          return copy
        })
        refreshStudents()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to submit grade')
    } finally {
      setSubmitting(null)
    }
  }

  const validGradeValues = new Set(Object.keys(GRADE_LABELS))

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setBulkImporting(true)
    try {
      const text = await file.text()
      const lines = text.trim().split('\n').slice(1) // skip header

      const grades: Array<{ enrollmentId: string; grade: string }> = []
      const errors: string[] = []

      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim())
        if (cols.length < 2) {
          errors.push(`Row ${i + 2}: Invalid format`)
          continue
        }

        const email = cols[0].toLowerCase()
        const gradeVal = cols[1].toUpperCase()

        if (!validGradeValues.has(gradeVal)) {
          errors.push(`Row ${i + 2}: Invalid grade "${cols[1]}"`)
          continue
        }

        // Find student by email in current list
        const student = students.find((s) => s.email.toLowerCase() === email)
        if (!student) {
          errors.push(`Row ${i + 2}: Student "${cols[0]}" not found`)
          continue
        }

        grades.push({ enrollmentId: student.enrollmentId, grade: gradeVal })
      }

      if (errors.length > 0) {
        toast.error(`CSV import has ${errors.length} error(s): ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`)
      }

      if (grades.length > 0) {
        const result = await bulkSubmitGradesAction({ data: { courseId, grades } })
        if (result.success) {
          toast.success(`Bulk import complete: ${result.data.successCount} succeeded, ${result.data.failCount} failed`)
          refreshStudents()
        }
      } else {
        toast.error('No valid grades found in CSV')
      }
    } catch {
      toast.error('Failed to parse CSV file')
    } finally {
      setBulkImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const gradeOptions = Object.entries(GRADE_LABELS).map(([value, label]) => ({ value, label }))

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Instructor', href: '/instructor' }, { label: 'Courses', href: '/instructor/courses' }, { label: 'Grading' }]} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Grade Submission</h1>
            <p className="text-muted-foreground mt-1">Submit grades for enrolled students.</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvImport}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={bulkImporting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {bulkImporting ? 'Importing...' : 'Import CSV'}
            </Button>
          </div>
        </div>

        {/* CSV Import Instructions */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Bulk Grade Import</CardTitle>
            <CardDescription className="text-xs">
              Upload a CSV file with columns: <code className="font-mono bg-muted px-1 rounded">email,grade</code>.
              Valid grades: {Object.values(GRADE_LABELS).join(', ')}. Use grade codes (e.g. A_PLUS, B_MINUS).
            </CardDescription>
          </CardHeader>
        </Card>
        {students.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No students enrolled" description="There are no students enrolled in this course." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Grade</TableHead>
                  <TableHead>New Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.enrollmentId}>
                    <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'ENROLLED' ? 'success' : s.status === 'COMPLETED' ? 'secondary' : 'destructive'}>{s.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {s.grade ? <Badge variant="outline">{GRADE_LABELS[s.grade] || s.grade}</Badge> : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <Select value={pendingGrades[s.enrollmentId] || ''} onValueChange={(val) => handleGradeChange(s.enrollmentId, val)}>
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((g) => (
                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={!pendingGrades[s.enrollmentId] || submitting === s.enrollmentId}
                        onClick={() => setConfirmGrade({ enrollmentId: s.enrollmentId, isUpdate: s.status === 'COMPLETED' })}
                      >
                        {submitting === s.enrollmentId ? 'Saving...' : s.status === 'COMPLETED' ? 'Update' : 'Submit'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {/* Grade submission confirmation dialog */}
        <AlertDialog open={!!confirmGrade} onOpenChange={(open) => !open && setConfirmGrade(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmGrade?.isUpdate ? 'Update Grade' : 'Submit Grade'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmGrade?.isUpdate
                  ? 'Are you sure you want to update this grade? The previous grade will be overwritten.'
                  : 'Are you sure you want to submit this grade? This will mark the enrollment as completed.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmGrade) {
                    handleSubmitGrade(confirmGrade.enrollmentId, confirmGrade.isUpdate)
                    setConfirmGrade(null)
                  }
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
