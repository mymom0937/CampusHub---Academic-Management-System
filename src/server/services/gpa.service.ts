import { prisma } from '@/lib/prisma'
import { GRADE_POINTS, ACADEMIC_STANDING } from '@/lib/constants'
import { AppError } from '@/server/errors/AppError'
import type { TranscriptEntry, GpaSummary } from '@/types/dto'

/** Calculate GPA from grade entries */
function calculateGpa(
  entries: Array<{ grade: string | null; credits: number; gradePoints: number | null }>
): number | null {
  let totalPoints = 0
  let totalCredits = 0

  for (const entry of entries) {
    if (!entry.grade) continue
    const points = GRADE_POINTS[entry.grade]
    if (points === null) continue // Skip P, I, W, DO, NG

    totalPoints += points * entry.credits
    totalCredits += entry.credits
  }

  if (totalCredits === 0) return null
  return Math.round((totalPoints / totalCredits) * 1000) / 1000
}

/** Get academic standing based on GPA */
function getAcademicStanding(gpa: number | null): string {
  if (gpa === null) return 'N/A'
  if (gpa >= ACADEMIC_STANDING.DEANS_LIST) return "Dean's List"
  if (gpa >= ACADEMIC_STANDING.GOOD_STANDING) return 'Good Standing'
  return 'Academic Probation'
}

/** Academic status for grade report (e.g. Promoted) */
function getAcademicStatus(gpa: number | null): string {
  if (gpa === null) return 'N/A'
  if (gpa >= ACADEMIC_STANDING.GOOD_STANDING) return 'Promoted'
  return 'Academic Probation'
}

/**
 * Deduplicate repeated courses: when a student takes the same course code
 * multiple times, only the latest enrollment counts toward GPA (uniportal_docs.txt).
 * Returns a Set of enrollment IDs that should count for GPA.
 * Only COMPLETED enrollments with letter grades count toward GPA.
 */
function getGpaEligibleEnrollments(
  enrollments: Array<{
    id: string
    course: { code: string; semester: { startDate: Date } }
    grade: string | null
    status: string
  }>
): Set<string> {
  const latestByCourseCode = new Map<string, string>()
  const latestDateByCourseCode = new Map<string, Date>()

  for (const enrollment of enrollments) {
    // Only COMPLETED enrollments with letter grades count (uniportal_docs.txt)
    if (enrollment.status !== 'COMPLETED') continue
    if (!enrollment.grade || GRADE_POINTS[enrollment.grade] === null) continue

    const code = enrollment.course.code
    const date = enrollment.course.semester.startDate
    const existingDate = latestDateByCourseCode.get(code)
    if (!existingDate || date > existingDate) {
      latestByCourseCode.set(code, enrollment.id)
      latestDateByCourseCode.set(code, date)
    }
  }

  return new Set(latestByCourseCode.values())
}

/** Get full transcript for a student - fetches all enrollments (ENROLLED, COMPLETED, DROPPED) per uniportal_docs */
export async function getTranscript(
  studentId: string
): Promise<{ entries: TranscriptEntry[]; summary: GpaSummary }> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          semester: {
            select: { id: true, name: true, code: true, startDate: true },
          },
        },
      },
    },
  })
  // Sort by semester start date (in-memory to avoid nested orderBy adapter issues)
  enrollments.sort((a, b) => {
    const dA = a.course?.semester?.startDate
    const dB = b.course?.semester?.startDate
    if (!dA || !dB) return 0
    return new Date(dA).getTime() - new Date(dB).getTime()
  })

  // Determine which enrollments count for GPA (latest per repeated course)
  const gpaEligible = getGpaEligibleEnrollments(
    enrollments.map((e) => ({
      id: e.id,
      course: {
        code: e.course.code,
        semester: { startDate: new Date(e.course.semester.startDate) },
      },
      grade: e.grade,
      status: e.status,
    }))
  )

  // Group by semester
  const semesterMap = new Map<
    string,
    {
      semesterName: string
      semesterCode: string
      semesterStartDate: Date
      courses: Array<{
        courseCode: string
        courseName: string
        credits: number
        grade: string | null
        gradePoints: number | null
        status: string
        enrollmentId: string
      }>
    }
  >()

  for (const enrollment of enrollments) {
    if (!enrollment.course?.semester) continue
    const semesterId = enrollment.course.semester.id
    if (!semesterMap.has(semesterId)) {
      semesterMap.set(semesterId, {
        semesterName: enrollment.course.semester.name,
        semesterCode: enrollment.course.semester.code,
        semesterStartDate: new Date(enrollment.course.semester.startDate),
        courses: [],
      })
    }

    semesterMap.get(semesterId)!.courses.push({
      courseCode: enrollment.course.code,
      courseName: enrollment.course.name,
      credits: enrollment.course.credits,
      grade: enrollment.grade,
      gradePoints: enrollment.gradePoints,
      status: enrollment.status,
      enrollmentId: enrollment.id,
    })
  }

  // Build transcript entries (semester-focused) and sort by date ascending
  const rawEntries: Array<{
    semesterName: string
    semesterCode: string
    semesterStartDate: Date
    courses: Array<{ courseCode: string; courseName: string; credits: number; grade: string | null; gradePoints: number | null; status: string; enrollmentId: string }>
    semesterCredits: number
    semesterGradePoints: number
    semesterGpa: number | null
  }> = []

  for (const semesterData of semesterMap.values()) {
    const gpaEligibleCourses = semesterData.courses.filter((c) =>
      gpaEligible.has(c.enrollmentId)
    )

    const semesterGpa = calculateGpa(
      gpaEligibleCourses.map((c) => ({
        grade: c.grade,
        credits: c.credits,
        gradePoints: c.gradePoints,
      }))
    )

    let semesterCredits = 0
    let semesterGradePoints = 0
    for (const course of gpaEligibleCourses) {
      if (course.grade && GRADE_POINTS[course.grade] !== null) {
        const pts = GRADE_POINTS[course.grade] ?? 0
        semesterCredits += course.credits
        semesterGradePoints += pts * course.credits
      }
    }

    rawEntries.push({
      semesterName: semesterData.semesterName,
      semesterCode: semesterData.semesterCode,
      semesterStartDate: semesterData.semesterStartDate,
      courses: semesterData.courses.map(({ enrollmentId, ...rest }) => rest),
      semesterCredits,
      semesterGradePoints,
      semesterGpa,
    })
  }

  rawEntries.sort((a, b) => a.semesterStartDate.getTime() - b.semesterStartDate.getTime())

  const entries: TranscriptEntry[] = rawEntries.map((e) => ({
    semesterName: e.semesterName,
    semesterCode: e.semesterCode,
    semesterStartDate: e.semesterStartDate.toISOString(),
    courses: e.courses,
    semesterCredits: e.semesterCredits,
    semesterGradePoints: e.semesterGradePoints,
    semesterGpa: e.semesterGpa,
  }))

  const allTotalCredits = rawEntries.reduce((s, e) => s + e.semesterCredits, 0)
  const allTotalPoints = rawEntries.reduce((s, e) => s + e.semesterGradePoints, 0)
  const cumulativeGpa =
    allTotalCredits > 0
      ? Math.round((allTotalPoints / allTotalCredits) * 1000) / 1000
      : null

  // Build cumulative progression (Previous Total → Last Semester → Cumulative)
  const lastEntry = rawEntries[rawEntries.length - 1]
  const previousCredits = lastEntry
    ? allTotalCredits - lastEntry.semesterCredits
    : 0
  const previousGradePoints = lastEntry
    ? allTotalPoints - lastEntry.semesterGradePoints
    : 0
  const previousGpa =
    previousCredits > 0
      ? Math.round((previousGradePoints / previousCredits) * 1000) / 1000
      : null

  const progression =
    lastEntry
      ? {
          previousTotalCredits: previousCredits,
          previousTotalGradePoints: previousGradePoints,
          previousGpa,
          lastSemesterCredits: lastEntry.semesterCredits,
          lastSemesterGradePoints: lastEntry.semesterGradePoints,
          lastSemesterGpa: lastEntry.semesterGpa,
          cumulativeCredits: allTotalCredits,
          cumulativeGradePoints: allTotalPoints,
          cumulativeGpa,
          academicStatus: getAcademicStatus(cumulativeGpa),
        }
      : undefined

  const summary: GpaSummary = {
    cumulativeGpa,
    totalCredits: allTotalCredits,
    totalGradePoints: allTotalPoints,
    academicStanding: getAcademicStanding(cumulativeGpa),
    progression,
  }

  return { entries, summary }
}

/** Get GPA summary for student dashboard */
export async function getGpaSummary(studentId: string): Promise<GpaSummary> {
  const { summary } = await getTranscript(studentId)
  return summary
}

/** Get student transcript for admin/instructor. Instructors may only view students in their courses. */
export async function getStudentTranscriptForStaff(
  staffId: string,
  staffRole: string,
  studentId: string
): Promise<{
  transcript: { entries: TranscriptEntry[]; summary: GpaSummary }
  student: { id: string; firstName: string; lastName: string; email: string }
}> {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  })
  if (!student) {
    throw new AppError('NOT_FOUND', 'Student not found')
  }
  if (student.role !== 'STUDENT') {
    throw new AppError('BAD_REQUEST', 'Only student transcripts can be viewed')
  }

  if (staffRole === 'INSTRUCTOR') {
    const hasAccess = await prisma.enrollment.findFirst({
      where: {
        studentId,
        course: {
          instructorAssignments: {
            some: { instructorId: staffId },
          },
        },
      },
    })
    if (!hasAccess) {
      throw new AppError('FORBIDDEN', 'You can only view transcripts of students in your courses')
    }
  }

  const transcript = await getTranscript(studentId)
  return {
    transcript,
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
    },
  }
}
