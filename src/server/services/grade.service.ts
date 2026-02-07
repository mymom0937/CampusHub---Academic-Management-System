import { AppError } from '@/server/errors/AppError'
import { GRADE_POINTS } from '@/lib/constants'
import * as enrollmentRepo from '@/server/repositories/enrollment.repository'
import * as courseRepo from '@/server/repositories/course.repository'
import type { StudentGradeEntry } from '@/types/dto'
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

/** Get enrolled students with grades for a course */
export async function getCourseStudentGrades(
  instructorId: string,
  courseId: string
): Promise<StudentGradeEntry[]> {
  // Verify instructor is assigned
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

  return enrollments.map((e) => ({
    enrollmentId: e.id,
    studentId: e.student.id,
    firstName: e.student.firstName,
    lastName: e.student.lastName,
    email: e.student.email,
    status: e.status,
    grade: e.grade,
    gradePoints: e.gradePoints,
    gradedAt: e.gradedAt?.toISOString() || null,
  }))
}
