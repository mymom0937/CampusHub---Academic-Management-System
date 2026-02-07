import { GRADE_POINTS, ACADEMIC_STANDING } from '@/lib/constants'
import * as enrollmentRepo from '@/server/repositories/enrollment.repository'
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

/**
 * Deduplicate repeated courses: when a student takes the same course code
 * multiple times, only the latest enrollment counts toward GPA.
 * Returns a Set of enrollment IDs that should count for GPA.
 */
function getGpaEligibleEnrollments(
  enrollments: Array<{
    id: string
    course: { code: string; semester: { startDate: Date } }
    grade: string | null
    status: string
  }>
): Set<string> {
  // Group by course code, keep latest (by semester start date) for GPA
  const latestByCourseCode = new Map<string, string>() // courseCode -> enrollmentId
  const latestDateByCourseCode = new Map<string, Date>() // courseCode -> startDate

  for (const enrollment of enrollments) {
    const code = enrollment.course.code
    const date = enrollment.course.semester.startDate

    // Only consider completed enrollments with letter grades for dedup
    if (!enrollment.grade || GRADE_POINTS[enrollment.grade] === null) continue

    const existingDate = latestDateByCourseCode.get(code)
    if (!existingDate || date > existingDate) {
      latestByCourseCode.set(code, enrollment.id)
      latestDateByCourseCode.set(code, date)
    }
  }

  return new Set(latestByCourseCode.values())
}

/** Get full transcript for a student */
export async function getTranscript(
  studentId: string
): Promise<{ entries: TranscriptEntry[]; summary: GpaSummary }> {
  const enrollments = await enrollmentRepo.getAllStudentEnrollments(studentId)

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
    const semesterId = enrollment.course.semester.id
    if (!semesterMap.has(semesterId)) {
      semesterMap.set(semesterId, {
        semesterName: enrollment.course.semester.name,
        semesterCode: enrollment.course.semester.code,
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

  // Build transcript entries with per-semester GPA
  const entries: TranscriptEntry[] = []
  let allTotalPoints = 0
  let allTotalCredits = 0

  for (const [, semesterData] of semesterMap) {
    // Only GPA-eligible enrollments count for semester GPA
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
    for (const course of gpaEligibleCourses) {
      if (course.grade && GRADE_POINTS[course.grade] !== null) {
        semesterCredits += course.credits
        allTotalPoints += (GRADE_POINTS[course.grade] ?? 0) * course.credits
        allTotalCredits += course.credits
      }
    }

    entries.push({
      semesterName: semesterData.semesterName,
      semesterCode: semesterData.semesterCode,
      courses: semesterData.courses.map(({ enrollmentId, ...rest }) => rest),
      semesterGpa,
      semesterCredits,
    })
  }

  const cumulativeGpa =
    allTotalCredits > 0
      ? Math.round((allTotalPoints / allTotalCredits) * 1000) / 1000
      : null

  const summary: GpaSummary = {
    cumulativeGpa,
    totalCredits: allTotalCredits,
    totalGradePoints: allTotalPoints,
    academicStanding: getAcademicStanding(cumulativeGpa),
  }

  return { entries, summary }
}

/** Get GPA summary for student dashboard */
export async function getGpaSummary(studentId: string): Promise<GpaSummary> {
  const { summary } = await getTranscript(studentId)
  return summary
}
