import { prisma } from '@/lib/prisma'
import type { EnrollmentStatus, GradeValue } from '../../../generated/prisma/client'

/** Find enrollment by ID */
export async function findEnrollmentById(id: string) {
  return prisma.enrollment.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          semester: true,
        },
      },
      student: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  })
}

/** Find enrollment by student and course */
export async function findEnrollmentByStudentAndCourse(
  studentId: string,
  courseId: string
) {
  return prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId, courseId },
    },
  })
}

/** Create enrollment */
export async function createEnrollment(data: {
  studentId: string
  courseId: string
}) {
  return prisma.enrollment.create({ data })
}

/** Update enrollment status */
export async function updateEnrollmentStatus(
  id: string,
  status: EnrollmentStatus,
  droppedAt?: Date
) {
  return prisma.enrollment.update({
    where: { id },
    data: {
      status,
      ...(droppedAt && { droppedAt }),
    },
  })
}

/** Drop enrollment with a grade (e.g. 'W' for late drops) */
export async function dropWithGrade(
  id: string,
  grade: GradeValue
) {
  return prisma.enrollment.update({
    where: { id },
    data: {
      status: 'DROPPED',
      droppedAt: new Date(),
      grade,
      gradePoints: null,
      gradedAt: new Date(),
    },
  })
}

/** Submit grade for enrollment */
export async function submitGrade(
  id: string,
  data: {
    grade: GradeValue
    gradePoints: number | null
    gradedBy: string
  }
) {
  return prisma.enrollment.update({
    where: { id },
    data: {
      grade: data.grade,
      gradePoints: data.gradePoints,
      gradedBy: data.gradedBy,
      gradedAt: new Date(),
      status: 'COMPLETED',
    },
  })
}

/** Get student enrollments */
export async function getStudentEnrollments(
  studentId: string,
  semesterId?: string
) {
  return prisma.enrollment.findMany({
    where: {
      studentId,
      ...(semesterId && {
        course: { semesterId },
      }),
    },
    include: {
      course: {
        include: {
          semester: { select: { id: true, name: true, code: true } },
          instructorAssignments: {
            where: { isPrimary: true },
            include: {
              instructor: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })
}

/** Get all enrollments for a student (for GPA/transcript) */
export async function getAllStudentEnrollments(studentId: string) {
  return prisma.enrollment.findMany({
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
    orderBy: { course: { semester: { startDate: 'desc' } } },
  })
}

/** Get enrolled students for a course */
export async function getCourseEnrollments(courseId: string) {
  return prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { student: { lastName: 'asc' } },
  })
}

/** Count enrolled students in a course */
export async function countEnrolledInCourse(courseId: string) {
  return prisma.enrollment.count({
    where: { courseId, status: 'ENROLLED' },
  })
}

/** Count student's credits in a semester */
export async function countStudentCredits(
  studentId: string,
  semesterId: string
) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: 'ENROLLED',
      course: { semesterId },
    },
    include: {
      course: { select: { credits: true } },
    },
  })
  return enrollments.reduce((sum, e) => sum + e.course.credits, 0)
}

/** Count student's active enrollments in a semester */
export async function countStudentEnrollments(
  studentId: string,
  semesterId: string
) {
  return prisma.enrollment.count({
    where: {
      studentId,
      status: 'ENROLLED',
      course: { semesterId },
    },
  })
}

/** Count total enrollments */
export async function countTotalEnrollments() {
  return prisma.enrollment.count()
}

/** Create a waitlist entry */
export async function createWaitlistEntry(data: {
  studentId: string
  courseId: string
}) {
  return prisma.enrollment.create({
    data: {
      ...data,
      status: 'WAITLISTED',
    },
  })
}

/** Get the next waitlisted student for a course (oldest first) */
export async function getNextWaitlisted(courseId: string) {
  return prisma.enrollment.findFirst({
    where: { courseId, status: 'WAITLISTED' },
    orderBy: { enrolledAt: 'asc' },
  })
}

/** Promote a waitlisted enrollment to ENROLLED */
export async function promoteFromWaitlist(enrollmentId: string) {
  return prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: 'ENROLLED',
      enrolledAt: new Date(),
    },
  })
}

/** Get waitlist position for a student in a course */
export async function getWaitlistPosition(
  studentId: string,
  courseId: string
): Promise<number | null> {
  const waitlisted = await prisma.enrollment.findMany({
    where: { courseId, status: 'WAITLISTED' },
    orderBy: { enrolledAt: 'asc' },
    select: { studentId: true },
  })

  const idx = waitlisted.findIndex((w) => w.studentId === studentId)
  return idx >= 0 ? idx + 1 : null
}

/** Get all waitlisted enrollments for a student */
export async function getStudentWaitlistEntries(studentId: string) {
  return prisma.enrollment.findMany({
    where: { studentId, status: 'WAITLISTED' },
    include: {
      course: {
        include: {
          semester: { select: { id: true, name: true, code: true } },
          instructorAssignments: {
            where: { isPrimary: true },
            include: {
              instructor: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          _count: {
            select: { enrollments: { where: { status: 'WAITLISTED' } } },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'asc' },
  })
}

/** Count waitlisted students for a course */
export async function countWaitlistedInCourse(courseId: string) {
  return prisma.enrollment.count({
    where: { courseId, status: 'WAITLISTED' },
  })
}
