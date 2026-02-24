import { prisma } from '@/lib/prisma'
import { AppError } from '@/server/errors/AppError'
import { GRADE_POINTS, percentageToGrade } from '@/lib/constants'
import * as enrollmentRepo from '@/server/repositories/enrollment.repository'
import * as courseRepo from '@/server/repositories/course.repository'
import * as assessmentRepo from '@/server/repositories/assessment.repository'
import type { StudentGradeEntry, CourseAssessmentItem } from '@/types/dto'
import type { GradeValue } from '../../../generated/prisma/client'

/** Submit a grade for a student enrollment */
export async function submitGrade(
  instructorId: string,
  enrollmentId: string,
  gradeValue: string
): Promise<void> {
  const enrollment = await enrollmentRepo.findEnrollmentById(enrollmentId)
  if (!enrollment) {
    throw new AppError('NOT_FOUND', 'Enrollment not found')
  }

  // Only ENROLLED or COMPLETED students can be graded
  if (enrollment.status !== 'ENROLLED' && enrollment.status !== 'COMPLETED') {
    throw new AppError(
      'VALIDATION_ERROR',
      'Can only grade students with ENROLLED or COMPLETED status'
    )
  }

  // Verify instructor is assigned to this course
  const course = await courseRepo.findCourseById(enrollment.courseId)
  if (!course) {
    throw new AppError('NOT_FOUND', 'Course not found')
  }

  const isAssigned = course.instructorAssignments.some(
    (a) => a.instructorId === instructorId
  )
  if (!isAssigned) {
    throw new AppError(
      'FORBIDDEN',
      'You are not assigned to this course'
    )
  }

  // Check grade deadline (semester must not have ended more than 30 days ago)
  const now = new Date()
  const semesterEnd = new Date(course.semester.endDate)
  const gradeDeadline = new Date(semesterEnd)
  gradeDeadline.setDate(gradeDeadline.getDate() + 30) // 30 days after semester ends
  if (now > gradeDeadline) {
    throw new AppError(
      'VALIDATION_ERROR',
      'The grading period has closed for this semester'
    )
  }

  // Calculate grade points
  const gradePoints = GRADE_POINTS[gradeValue]
  const calculatedGradePoints =
    gradePoints !== null ? gradePoints * enrollment.course.credits : null

  await enrollmentRepo.submitGrade(enrollmentId, {
    grade: gradeValue as GradeValue,
    gradePoints: calculatedGradePoints,
    gradedBy: instructorId,
  })
}

/** Update an existing grade for a student enrollment */
export async function updateGrade(
  instructorId: string,
  enrollmentId: string,
  gradeValue: string
): Promise<void> {
  const enrollment = await enrollmentRepo.findEnrollmentById(enrollmentId)
  if (!enrollment) {
    throw new AppError('NOT_FOUND', 'Enrollment not found')
  }

  // Can only update grades on COMPLETED enrollments (already graded)
  if (enrollment.status !== 'COMPLETED') {
    throw new AppError(
      'VALIDATION_ERROR',
      'Can only update grades for completed enrollments'
    )
  }

  // Verify instructor is assigned to this course
  const course = await courseRepo.findCourseById(enrollment.courseId)
  if (!course) {
    throw new AppError('NOT_FOUND', 'Course not found')
  }

  const isAssigned = course.instructorAssignments.some(
    (a) => a.instructorId === instructorId
  )
  if (!isAssigned) {
    throw new AppError(
      'FORBIDDEN',
      'You are not assigned to this course'
    )
  }

  // Check grade deadline
  const now = new Date()
  const semesterEnd = new Date(course.semester.endDate)
  const gradeDeadline = new Date(semesterEnd)
  gradeDeadline.setDate(gradeDeadline.getDate() + 30)
  if (now > gradeDeadline) {
    throw new AppError(
      'VALIDATION_ERROR',
      'The grading period has closed for this semester'
    )
  }

  // Calculate grade points
  const gradePoints = GRADE_POINTS[gradeValue]
  const calculatedGradePoints =
    gradePoints !== null ? gradePoints * enrollment.course.credits : null

  await enrollmentRepo.submitGrade(enrollmentId, {
    grade: gradeValue as GradeValue,
    gradePoints: calculatedGradePoints,
    gradedBy: instructorId,
  })
}

/** Get enrolled students with grades and assessment scores for a course */
export async function getCourseStudentGrades(
  instructorId: string,
  courseId: string
): Promise<StudentGradeEntry[]> {
  const data = await getCourseGradingData(instructorId, courseId)
  return data.students
}

/** Get full grading data: assessments + students with scores */
export async function getCourseGradingData(
  instructorId: string,
  courseId: string
): Promise<{
  assessments: CourseAssessmentItem[]
  students: StudentGradeEntry[]
}> {
  const course = await courseRepo.findCourseById(courseId)
  if (!course) {
    throw new AppError('NOT_FOUND', 'Course not found')
  }

  const isAssigned = course.instructorAssignments.some(
    (a) => a.instructorId === instructorId
  )
  if (!isAssigned) {
    throw new AppError('FORBIDDEN', 'You are not assigned to this course')
  }

  const enrollments = await enrollmentRepo.getCourseEnrollments(courseId)
  const assessmentList = await assessmentRepo.getCourseAssessments(courseId)
  const enrollmentIds = enrollments.map((e) => e.id)
  const allScores = await assessmentRepo.getEnrollmentScores(enrollmentIds)

  // Fetch grader names for display (instead of showing user ID)
  const graderIds = [...new Set(enrollments.map((e) => e.gradedBy).filter(Boolean))] as string[]
  const graders = graderIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: graderIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : []
  const graderNameMap = new Map(graders.map((g) => [g.id, `${g.firstName} ${g.lastName}`]))

  const scoreMap = new Map<string, Record<string, { score: number | null; maxScore: number }>>()
  for (const s of allScores) {
    if (!scoreMap.has(s.enrollmentId)) {
      scoreMap.set(s.enrollmentId, {})
    }
    const entry = scoreMap.get(s.enrollmentId)!
    entry[s.assessmentId] = {
      score: s.score,
      maxScore: s.assessment.maxScore,
    }
  }

  const assessments: CourseAssessmentItem[] = assessmentList.map((a) => ({
    id: a.id,
    name: a.name,
    weight: a.weight,
    maxScore: a.maxScore,
    sortOrder: a.sortOrder,
  }))

  const students: StudentGradeEntry[] = enrollments.map((e) => ({
    enrollmentId: e.id,
    studentId: e.student.id,
    firstName: e.student.firstName,
    lastName: e.student.lastName,
    email: e.student.email,
    status: e.status,
    grade: e.grade,
    gradePoints: e.gradePoints,
    gradedAt: e.gradedAt?.toISOString() || null,
    gradedByName: e.gradedBy ? graderNameMap.get(e.gradedBy) ?? null : null,
    assessmentScores: scoreMap.get(e.id) ?? {},
  }))

  return { assessments, students }
}

/** Save course assessments (instructor) */
export async function saveCourseAssessments(
  instructorId: string,
  courseId: string,
  assessments: Array<{ name: string; weight: number; maxScore?: number }>
): Promise<CourseAssessmentItem[]> {
  const course = await courseRepo.findCourseById(courseId)
  if (!course) throw new AppError('NOT_FOUND', 'Course not found')
  const isAssigned = course.instructorAssignments.some((a) => a.instructorId === instructorId)
  if (!isAssigned) throw new AppError('FORBIDDEN', 'You are not assigned to this course')

  const total = assessments.reduce((s, a) => s + a.weight, 0)
  if (total !== 100) {
    throw new AppError('VALIDATION_ERROR', 'Assessment weights must total 100%')
  }

  const result = await assessmentRepo.upsertCourseAssessments(courseId, assessments)
  return result.map((a) => ({
    id: a.id,
    name: a.name,
    weight: a.weight,
    maxScore: a.maxScore,
    sortOrder: a.sortOrder,
  }))
}

/** Save assessment scores for an enrollment (instructor) */
export async function saveAssessmentScores(
  instructorId: string,
  enrollmentId: string,
  scores: Array<{ assessmentId: string; score: number | null; maxScore?: number }>
): Promise<void> {
  const enrollment = await enrollmentRepo.findEnrollmentById(enrollmentId)
  if (!enrollment) throw new AppError('NOT_FOUND', 'Enrollment not found')
  const course = await courseRepo.findCourseById(enrollment.courseId)
  if (!course) throw new AppError('NOT_FOUND', 'Course not found')
  const isAssigned = course.instructorAssignments.some((a) => a.instructorId === instructorId)
  if (!isAssigned) throw new AppError('FORBIDDEN', 'You are not assigned to this course')

  await assessmentRepo.upsertEnrollmentScores(enrollmentId, scores)
}

/** Get unique students across all courses taught by instructor (for transcript access) */
export async function getInstructorStudents(
  instructorId: string
): Promise<Array<{ id: string; firstName: string; lastName: string; email: string }>> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: {
        instructorAssignments: {
          some: { instructorId },
        },
      },
    },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  })
  const seen = new Set<string>()
  const students: Array<{ id: string; firstName: string; lastName: string; email: string }> = []
  for (const e of enrollments) {
    if (!seen.has(e.studentId)) {
      seen.add(e.studentId)
      students.push({ ...e.student })
    }
  }
  students.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName))
  return students
}
