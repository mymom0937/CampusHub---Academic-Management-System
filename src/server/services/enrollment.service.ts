import { AppError } from '@/server/errors/AppError'
import { MAX_CREDITS_PER_SEMESTER } from '@/lib/constants'
import * as enrollmentRepo from '@/server/repositories/enrollment.repository'
import * as courseRepo from '@/server/repositories/course.repository'
import * as semesterRepo from '@/server/repositories/semester.repository'
import * as prerequisiteService from '@/server/services/prerequisite.service'
import type { EnrollmentListItem } from '@/types/dto'

/** Enroll student in a course (or join waitlist if full) */
export async function enrollStudent(
  studentId: string,
  courseId: string
): Promise<{ status: 'enrolled' | 'waitlisted'; waitlistPosition?: number }> {
  // 1. Check course exists
  const course = await courseRepo.findCourseById(courseId)
  if (!course) {
    throw new AppError('NOT_FOUND', 'Course not found')
  }

  // 2. Check enrollment period
  const semester = course.semester
  const now = new Date()
  if (now < semester.enrollmentStart || now > semester.enrollmentEnd) {
    throw new AppError(
      'ENROLLMENT_CLOSED',
      'Enrollment period has ended for this semester'
    )
  }

  // 3. Check duplicate enrollment or waitlist
  const existing = await enrollmentRepo.findEnrollmentByStudentAndCourse(
    studentId,
    courseId
  )
  if (existing && existing.status === 'ENROLLED') {
    throw new AppError('CONFLICT', 'You are already enrolled in this course')
  }
  if (existing && existing.status === 'WAITLISTED') {
    throw new AppError('CONFLICT', 'You are already on the waitlist for this course')
  }

  // 4. Check capacity
  const enrolledCount = await enrollmentRepo.countEnrolledInCourse(courseId)
  if (enrolledCount >= course.capacity) {
    // Course is full — add to waitlist
    await enrollmentRepo.createWaitlistEntry({ studentId, courseId })
    const position = await enrollmentRepo.getWaitlistPosition(studentId, courseId)
    return { status: 'waitlisted', waitlistPosition: position ?? undefined }
  }

  // 5. Check prerequisites
  const prereqCheck = await prerequisiteService.checkPrerequisitesMet(
    studentId,
    course.code
  )
  if (!prereqCheck.met) {
    throw new AppError(
      'VALIDATION_ERROR',
      `Missing prerequisites: ${prereqCheck.missing.join(', ')}`,
      { missingPrerequisites: prereqCheck.missing }
    )
  }

  // 6. Check credit limit
  const currentCredits = await enrollmentRepo.countStudentCredits(
    studentId,
    semester.id
  )
  if (currentCredits + course.credits > MAX_CREDITS_PER_SEMESTER) {
    throw new AppError(
      'CREDIT_LIMIT_EXCEEDED',
      `Enrolling would exceed the maximum of ${MAX_CREDITS_PER_SEMESTER} credits per semester`
    )
  }

  // 6. Create enrollment
  await enrollmentRepo.createEnrollment({ studentId, courseId })
  return { status: 'enrolled' }
}

/** Drop a course */
export async function dropCourse(
  studentId: string,
  enrollmentId: string
): Promise<void> {
  const enrollment = await enrollmentRepo.findEnrollmentById(enrollmentId)
  if (!enrollment) {
    throw new AppError('NOT_FOUND', 'Enrollment not found')
  }

  if (enrollment.studentId !== studentId) {
    throw new AppError('FORBIDDEN', 'You can only drop your own enrollments')
  }

  if (enrollment.status !== 'ENROLLED') {
    throw new AppError('VALIDATION_ERROR', 'Can only drop active enrollments')
  }

  // Check if this is the last course
  const semesterId = enrollment.course.semesterId
  const enrollmentCount = await enrollmentRepo.countStudentEnrollments(
    studentId,
    semesterId
  )
  if (enrollmentCount <= 1) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Cannot drop your last enrolled course'
    )
  }

  // Check drop deadline
  const now = new Date()
  const dropDeadline = enrollment.course.semester.dropDeadline

  if (now > dropDeadline) {
    // After deadline: drop with 'W' (Withdrawn) grade on transcript
    await enrollmentRepo.dropWithGrade(enrollmentId, 'W')
  } else {
    // Clean drop before deadline
    await enrollmentRepo.updateEnrollmentStatus(
      enrollmentId,
      'DROPPED',
      new Date()
    )
  }

  // Auto-promote next waitlisted student if any
  const nextWaitlisted = await enrollmentRepo.getNextWaitlisted(enrollment.courseId)
  if (nextWaitlisted) {
    await enrollmentRepo.promoteFromWaitlist(nextWaitlisted.id)
  }
}

/** Leave waitlist */
export async function leaveWaitlist(
  studentId: string,
  enrollmentId: string
): Promise<void> {
  const enrollment = await enrollmentRepo.findEnrollmentById(enrollmentId)
  if (!enrollment) {
    throw new AppError('NOT_FOUND', 'Waitlist entry not found')
  }

  if (enrollment.studentId !== studentId) {
    throw new AppError('FORBIDDEN', 'You can only remove your own waitlist entries')
  }

  if (enrollment.status !== 'WAITLISTED') {
    throw new AppError('VALIDATION_ERROR', 'This enrollment is not waitlisted')
  }

  await enrollmentRepo.updateEnrollmentStatus(
    enrollmentId,
    'DROPPED',
    new Date()
  )
}

/** Get student's current enrollments */
export async function getStudentEnrollments(
  studentId: string,
  semesterId?: string
): Promise<EnrollmentListItem[]> {
  let targetSemesterId = semesterId
  if (!targetSemesterId) {
    const activeSemester = await semesterRepo.findActiveSemester()
    targetSemesterId = activeSemester?.id
  }

  const enrollments = await enrollmentRepo.getStudentEnrollments(
    studentId,
    targetSemesterId
  )

  return enrollments.map((e) => ({
    id: e.id,
    courseCode: e.course.code,
    courseName: e.course.name,
    credits: e.course.credits,
    status: e.status,
    enrolledAt: e.enrolledAt.toISOString(),
    droppedAt: e.droppedAt?.toISOString() || null,
    grade: e.grade,
    gradePoints: e.gradePoints,
    instructorName: e.course.instructorAssignments[0]
      ? `${e.course.instructorAssignments[0].instructor.firstName} ${e.course.instructorAssignments[0].instructor.lastName}`
      : null,
    semesterName: e.course.semester.name,
  }))
}
