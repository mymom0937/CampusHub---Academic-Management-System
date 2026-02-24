import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useMemo } from 'react'
import { ClipboardList, Upload, Settings2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'
import { requireInstructor } from '@/lib/admin-route'
import {
  getCourseGradingDataAction,
  submitGradeAction,
  updateGradeAction,
  bulkSubmitGradesAction,
  saveCourseAssessmentsAction,
  saveAssessmentScoresAction,
} from '@/server/actions/grade.actions'
import { GRADE_LABELS, DEFAULT_ASSESSMENT_WEIGHTS, percentageToGrade } from '@/lib/constants'
import { calculateWeightedPercentage } from '@/lib/grade-utils'
import type { SubmitGradeInput } from '@/server/validators/enrollment.schema'
import type { SessionUser, StudentGradeEntry, CourseAssessmentItem } from '@/types/dto'

export const Route = createFileRoute('/instructor/grades/$courseId')({
  beforeLoad: async () => ({ user: await requireInstructor() }),
  loader: async ({ params }) => {
    const data = await getCourseGradingDataAction({ data: { courseId: params.courseId } })
    return { ...data, courseId: params.courseId }
  },
  pendingComponent: () => <div className="p-8"><TableSkeleton rows={8} cols={5} /></div>,
  component: InstructorGradingPage,
})

type AssessmentFormItem = { id?: string; name: string; weight: number; maxScore: number }

function InstructorGradingPage() {
  const { assessments: initialAssessments, students: initialStudents, courseId } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [assessments, setAssessments] = useState<CourseAssessmentItem[]>(initialAssessments)
  const [students, setStudents] = useState<StudentGradeEntry[]>(initialStudents)
  const [pendingGrades, setPendingGrades] = useState<Record<string, string>>({})
  const [pendingScores, setPendingScores] = useState<Record<string, Record<string, number | ''>>>({})
  const [assessmentForm, setAssessmentForm] = useState<AssessmentFormItem[]>(
    initialAssessments.length > 0
      ? initialAssessments.map((a) => ({ id: a.id, name: a.name, weight: a.weight, maxScore: a.maxScore }))
      : DEFAULT_ASSESSMENT_WEIGHTS.map((a) => ({ name: a.name, weight: a.weight, maxScore: a.maxScore }))
  )
  const [savingAssessments, setSavingAssessments] = useState(false)
  const [assessmentOpen, setAssessmentOpen] = useState(initialAssessments.length === 0)

  const toggleAssessmentOpen = () => {
    if (!assessmentOpen) {
      setAssessmentForm(
        assessments.length > 0
          ? assessments.map((a) => ({ id: a.id, name: a.name, weight: a.weight, maxScore: a.maxScore }))
          : DEFAULT_ASSESSMENT_WEIGHTS.map((a) => ({ name: a.name, weight: a.weight, maxScore: a.maxScore }))
      )
    }
    setAssessmentOpen((o) => !o)
  }
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [confirmGrade, setConfirmGrade] = useState<{ enrollmentId: string; isUpdate: boolean } | null>(null)
  const [bulkImporting, setBulkImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refreshData = async () => {
    const data = await getCourseGradingDataAction({ data: { courseId } })
    setAssessments(data.assessments)
    setStudents(data.students)
  }

  const handleGradeChange = (enrollmentId: string, grade: string) => {
    setPendingGrades((prev) => ({ ...prev, [enrollmentId]: grade }))
  }

  const handleScoreChange = (enrollmentId: string, assessmentId: string, value: number | '') => {
    setPendingScores((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...(prev[enrollmentId] ?? {}),
        [assessmentId]: value,
      },
    }))
  }

  const getEffectiveScores = (s: StudentGradeEntry) => {
    const base = s.assessmentScores ?? {}
    const pending = pendingScores[s.enrollmentId] ?? {}
    const result: Record<string, { score: number | null; maxScore: number }> = {}
    for (const a of assessments) {
      const p = pending[a.id]
      const b = base[a.id]
      result[a.id] = {
        score: p !== undefined && p !== '' ? p : (b?.score ?? null),
        maxScore: b?.maxScore ?? a.maxScore,
      }
    }
    return result
  }

  const calculatedPercentage = (s: StudentGradeEntry) => {
    const scores = getEffectiveScores(s)
    return calculateWeightedPercentage(assessments, scores)
  }

  const suggestedGrade = (s: StudentGradeEntry) => {
    const pct = calculatedPercentage(s)
    return pct !== null ? percentageToGrade(pct) : null
  }

  const handleSaveAssessments = async () => {
    const total = assessmentForm.reduce((s, a) => s + a.weight, 0)
    if (total !== 100) {
      toast.error('Assessment weights must total 100%')
      return
    }
    setSavingAssessments(true)
    try {
      const result = await saveCourseAssessmentsAction({
        data: {
          courseId,
          assessments: assessmentForm.map((a) => ({
            name: a.name,
            weight: a.weight,
            maxScore: a.maxScore,
          })),
        },
      })
      if (result.success) {
        setAssessments(result.data.assessments)
        setAssessmentOpen(false)
        toast.success('Assessment weights saved')
        refreshData()
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save assessments')
    } finally {
      setSavingAssessments(false)
    }
  }

  const handleSaveScores = async (enrollmentId: string) => {
    const pending = pendingScores[enrollmentId] ?? {}
    const scores = Object.entries(pending).map(([assessmentId, score]) => ({
      assessmentId,
      score: score === '' ? null : score,
    }))
    if (scores.length === 0) return
    try {
      await saveAssessmentScoresAction({ data: { enrollmentId, scores } })
      toast.success('Scores saved')
      setPendingScores((prev) => {
        const copy = { ...prev }
        delete copy[enrollmentId]
        return copy
      })
      await refreshData()
      // Auto-fill Final Grade from calculated percentage (merge saved + existing)
      const student = students.find((s) => s.enrollmentId === enrollmentId)
      const baseScores = student?.assessmentScores ?? {}
      const merged: Record<string, { score: number | null; maxScore: number }> = {}
      for (const a of assessments) {
        const p = pending[a.id]
        const b = baseScores[a.id]
        const score = p !== undefined && p !== '' ? p : (b?.score ?? null)
        merged[a.id] = { score, maxScore: b?.maxScore ?? a.maxScore }
      }
      // Update merged with just-saved values (they overwrite base)
      for (const { assessmentId, score } of scores) {
        if (score !== null) {
          const a = assessments.find((x) => x.id === assessmentId)
          merged[assessmentId] = { score, maxScore: a?.maxScore ?? 100 }
        }
      }
      const pct = calculateWeightedPercentage(assessments, merged)
      if (pct !== null) {
        setPendingGrades((prev) => ({ ...prev, [enrollmentId]: percentageToGrade(pct) }))
      }
    } catch {
      toast.error('Failed to save scores')
    }
  }

  const handleSubmitGrade = async (enrollmentId: string, isUpdate: boolean) => {
    const student = students.find((s) => s.enrollmentId === enrollmentId)
    const pct = student ? calculatedPercentage(student) : null
    const grade = pendingGrades[enrollmentId] ?? student?.grade ?? (pct !== null ? percentageToGrade(pct) : null)
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
        toast.success(isUpdate ? 'Grade updated' : 'Grade submitted')
        setPendingGrades((prev) => {
          const copy = { ...prev }
          delete copy[enrollmentId]
          return copy
        })
        refreshData()
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
  const gradeOptions = useMemo(() => Object.entries(GRADE_LABELS).map(([value, label]) => ({ value, label })), [])

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setBulkImporting(true)
    try {
      const text = await file.text()
      const lines = text.trim().split('\n').slice(1)
      const grades: Array<{ enrollmentId: string; grade: string }> = []
      const errors: string[] = []
      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim())
        if (cols.length < 2) {
          errors.push(`Row ${i + 2}: Invalid format`)
          continue
        }
        const email = cols[0].toLowerCase()
        const raw = cols[1].toUpperCase().trim()
        const gradeVal = raw.replace(/\+/g, '_PLUS').replace(/-/g, '_MINUS')
        if (!validGradeValues.has(gradeVal)) {
          errors.push(`Row ${i + 2}: Invalid grade "${cols[1]}"`)
          continue
        }
        const student = students.find((s) => s.email.toLowerCase() === email)
        if (!student) {
          errors.push(`Row ${i + 2}: Student "${cols[0]}" not found`)
          continue
        }
        grades.push({ enrollmentId: student.enrollmentId, grade: gradeVal })
      }
      if (errors.length > 0) {
        toast.error(`CSV errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`)
      }
      if (grades.length > 0) {
        const result = await bulkSubmitGradesAction({ data: { courseId, grades } })
        if (result.success) {
          toast.success(`Imported: ${result.data.successCount} succeeded, ${result.data.failCount} failed`)
          refreshData()
        }
      } else {
        toast.error('No valid grades in CSV')
      }
    } catch {
      toast.error('Failed to parse CSV')
    } finally {
      setBulkImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const addAssessmentRow = () => {
    setAssessmentForm((prev) => [...prev, { name: '', weight: 0, maxScore: 100 }])
  }

  const removeAssessmentRow = (idx: number) => {
    setAssessmentForm((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateAssessmentForm = (idx: number, field: keyof AssessmentFormItem, value: string | number) => {
    setAssessmentForm((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const gradableStudents = students.filter((s) => s.status === 'ENROLLED' || s.status === 'COMPLETED')

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Instructor', href: '/instructor' }, { label: 'Courses', href: '/instructor/courses' }, { label: 'Grading' }]} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Grade Submission</h1>
            <p className="text-muted-foreground mt-1">Configure assessment weights and submit grades.</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={bulkImporting}>
              <Upload className="h-4 w-4 mr-2" />
              {bulkImporting ? 'Importing...' : 'Import CSV'}
            </Button>
          </div>
        </div>

        {/* Assessment weights */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors py-4"
            onClick={toggleAssessmentOpen}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Assessment Weights
                  <span className="text-muted-foreground font-normal text-sm">
                    {assessmentOpen ? '▼' : '▶'}
                  </span>
                </CardTitle>
                <CardDescription>
                  {assessments.length > 0
                    ? assessments.map((a) => `${a.name} (${a.weight}%)`).join(', ')
                    : 'Set weights for tests, exams, assignments, etc. Total must equal 100%.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {assessmentOpen && (
            <CardContent className="space-y-4 pt-0 border-t">
                <p className="text-sm text-muted-foreground">
                  Define assessment categories and their percentage weights. Weights must total 100%.
                  Set &quot;max pts&quot; to the max points for each assessment (e.g. Test 1 max 15 if it&apos;s out of 15).
                </p>
                <div className="space-y-2">
                  {assessmentForm.map((a, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Name (e.g. Test 1)"
                        value={a.name}
                        onChange={(e) => updateAssessmentForm(idx, 'name', e.target.value)}
                        className="w-40"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="%"
                        value={a.weight || ''}
                        onChange={(e) => updateAssessmentForm(idx, 'weight', parseInt(e.target.value, 10) || 0)}
                        className="w-20"
                      />
                      <span className="text-muted-foreground text-sm">%</span>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Max"
                        value={a.maxScore}
                        onChange={(e) => updateAssessmentForm(idx, 'maxScore', parseInt(e.target.value, 10) || 100)}
                        className="w-16"
                      />
                      <span className="text-muted-foreground text-xs">max pts</span>
                      <Button variant="ghost" size="icon" onClick={() => removeAssessmentRow(idx)} className="shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addAssessmentRow}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add custom
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAssessments}
                    disabled={savingAssessments || assessmentForm.reduce((s, a) => s + a.weight, 0) !== 100}
                  >
                    {savingAssessments ? 'Saving...' : 'Save weights'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total: {assessmentForm.reduce((s, a) => s + a.weight, 0)}%
                  {assessmentForm.reduce((s, a) => s + a.weight, 0) !== 100 && ' (must be 100%)'}
                </p>
              </CardContent>
          )}
        </Card>

        {/* Bulk import hint */}
        <Card className="border-dashed">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Bulk Grade Import</CardTitle>
            <CardDescription className="text-xs">
              CSV columns: <code className="font-mono bg-muted px-1 rounded">email,grade</code>.
              Valid grades: {Object.values(GRADE_LABELS).join(', ')}.
            </CardDescription>
          </CardHeader>
        </Card>

        {gradableStudents.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No students to grade" description="No enrolled or completed students in this course." />
        ) : (
          <>
            {assessments.length === 0 && (
              <Card className="border-primary/30">
                <CardContent className="py-4">
                  <p className="text-sm">
                    <strong>To add each student&apos;s scores per assessment:</strong> Save your assessment weights above first (click &quot;Save weights&quot;). 
                    Then columns for Test 1, Mid-Exam, Assignment, Quiz, Final Exam will appear here where you can enter each student&apos;s score.
                  </p>
                </CardContent>
              </Card>
            )}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  {assessments.map((a) => (
                    <TableHead key={a.id} className="text-center min-w-[70px]">
                      {a.name} ({a.weight}%)
                    </TableHead>
                  ))}
                  {assessments.length > 0 && <TableHead className="text-center">Calc %</TableHead>}
                  <TableHead>Final Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradableStudents.map((s) => {
                  const pct = calculatedPercentage(s)
                  const suggested = suggestedGrade(s)
                  const scores = getEffectiveScores(s)
                  const hasPendingScores = Object.keys(pendingScores[s.enrollmentId] ?? {}).length > 0
                  return (
                    <TableRow key={s.enrollmentId}>
                      <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{s.email}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'ENROLLED' ? 'success' : s.status === 'COMPLETED' ? 'secondary' : 'destructive'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      {assessments.map((a) => {
                        const val = pendingScores[s.enrollmentId]?.[a.id]
                        const base = scores[a.id]?.score
                        const display = val !== undefined ? (val === '' ? '' : val) : (base ?? '')
                        return (
                          <TableCell key={a.id} className="p-1">
                            <Input
                              type="number"
                              min={0}
                              max={a.maxScore}
                              step={0.5}
                              placeholder={`/ ${a.maxScore}`}
                              value={display}
                              onChange={(e) => {
                                const v = e.target.value
                                handleScoreChange(s.enrollmentId, a.id, v === '' ? '' : parseFloat(v))
                              }}
                              className="h-8 w-16 text-center text-sm"
                            />
                          </TableCell>
                        )
                      })}
                      {assessments.length > 0 && (
                        <TableCell className="text-center text-sm font-medium">
                          {pct !== null ? `${pct}%` : '-'}
                          {suggested && pct !== null && (
                            <span className="block text-xs text-muted-foreground">→ {GRADE_LABELS[suggested]}</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <Select
                            value={pendingGrades[s.enrollmentId] ?? (s.grade ?? (suggested ?? ''))}
                            onValueChange={(val) => handleGradeChange(s.enrollmentId, val)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                              {gradeOptions.map((g) => (
                                <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {s.gradedByName && (
                            <span className="text-xs text-muted-foreground">by {s.gradedByName}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {hasPendingScores && (
                          <Button size="sm" variant="outline" onClick={() => handleSaveScores(s.enrollmentId)}>
                            Save scores
                          </Button>
                        )}
                        <Button
                          size="sm"
                          disabled={!(pendingGrades[s.enrollmentId] ?? s.grade ?? suggested)}
                          loading={submitting === s.enrollmentId}
                          onClick={() => setConfirmGrade({ enrollmentId: s.enrollmentId, isUpdate: s.status === 'COMPLETED' })}
                        >
                          {submitting === s.enrollmentId ? 'Saving...' : s.status === 'COMPLETED' ? 'Update' : 'Submit'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          </>
        )}

        <AlertDialog open={!!confirmGrade} onOpenChange={(open) => !open && setConfirmGrade(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmGrade?.isUpdate ? 'Update Grade' : 'Submit Grade'}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmGrade?.isUpdate
                  ? 'This will overwrite the existing grade.'
                  : 'This will mark the enrollment as completed.'}
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
