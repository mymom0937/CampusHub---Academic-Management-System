import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware, instructorMiddleware, studentMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import * as gpaService from '@/server/services/gpa.service'
import type {
  SessionUser,
  AdminAnalytics,
  StudentDashboardStats,
  InstructorDashboardStats,
} from '@/types/dto'

/** Get admin dashboard stats with analytics */
export const getAdminDashboardAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async (): Promise<AdminAnalytics> => {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      activeSemesters,
      coursesWithEnrollments,
      gradeGroups,
      recentEnrollmentRows,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: 'STUDENT', deletedAt: null, isActive: true } }),
      prisma.user.count({ where: { role: 'INSTRUCTOR', deletedAt: null, isActive: true } }),
      prisma.course.count({ where: { deletedAt: null } }),
      prisma.enrollment.count({ where: { status: 'ENROLLED' } }),
      prisma.semester.count({ where: { isActive: true, deletedAt: null } }),
      // Enrollment by course
      prisma.course.findMany({
        where: { deletedAt: null },
        select: {
          code: true,
          name: true,
          capacity: true,
          _count: { select: { enrollments: { where: { status: 'ENROLLED' } } } },
        },
        orderBy: { code: 'asc' },
      }),
      // Grade distribution
      prisma.enrollment.groupBy({
        by: ['grade'],
        _count: { grade: true },
        where: { grade: { not: null } },
      }),
      // Recent enrollments
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: { select: { firstName: true, lastName: true } },
          course: { select: { code: true } },
        },
      }),
    ])

    return {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      activeSemesters,
      enrollmentByCourse: coursesWithEnrollments.map((c) => ({
        courseCode: c.code,
        courseName: c.name,
        enrolled: c._count.enrollments,
        capacity: c.capacity,
      })),
      gradeDistribution: gradeGroups.map((g) => ({
        grade: g.grade || 'Pending',
        count: g._count.grade,
      })),
      recentEnrollments: recentEnrollmentRows.map((e) => ({
        studentName: `${e.student.firstName} ${e.student.lastName}`,
        courseCode: e.course.code,
        enrolledAt: e.enrolledAt.toISOString(),
      })),
    }
  })

/** Get student dashboard stats */
export const getStudentDashboardAction = createServerFn({ method: 'GET' })
  .middleware([studentMiddleware])
  .handler(async ({ context }): Promise<StudentDashboardStats> => {
    const user = context.user as SessionUser

    const [enrolledCourses, completedCourses, transcript] = await Promise.all([
      prisma.enrollment.count({
        where: { studentId: user.id, status: 'ENROLLED' },
      }),
      prisma.enrollment.count({
        where: { studentId: user.id, status: 'COMPLETED' },
      }),
      gpaService.getTranscript(user.id),
    ])

    // Calculate total credits
    const enrolledCredits = await prisma.enrollment.findMany({
      where: { studentId: user.id, status: 'ENROLLED' },
      include: { course: { select: { credits: true } } },
    })
    const totalCredits = enrolledCredits.reduce(
      (sum, e) => sum + e.course.credits,
      0
    )

    // Build GPA trend from transcript entries that have a GPA
    const gpaTrend = transcript.entries
      .filter((e) => e.semesterGpa !== null)
      .map((e) => ({
        semesterCode: e.semesterCode,
        semesterName: e.semesterName,
        gpa: e.semesterGpa as number,
      }))

    return {
      enrolledCourses,
      completedCourses,
      totalCredits,
      currentGpa: transcript.summary.cumulativeGpa,
      gpaTrend,
    }
  })

/** Get instructor dashboard stats */
export const getInstructorDashboardAction = createServerFn({ method: 'GET' })
  .middleware([instructorMiddleware])
  .handler(async ({ context }): Promise<InstructorDashboardStats> => {
    const user = context.user as SessionUser

    const assignments = await prisma.instructorAssignment.findMany({
      where: { instructorId: user.id },
      include: {
        course: {
          include: {
            _count: {
              select: {
                enrollments: true,
              },
            },
            enrollments: {
              select: { grade: true },
            },
          },
        },
      },
    })

    const assignedCourses = assignments.length
    let totalStudents = 0
    let gradedCount = 0
    let pendingGrades = 0

    for (const assignment of assignments) {
      totalStudents += assignment.course._count.enrollments
      for (const enrollment of assignment.course.enrollments) {
        if (enrollment.grade) {
          gradedCount++
        } else {
          pendingGrades++
        }
      }
    }

    return {
      assignedCourses,
      totalStudents,
      gradedCount,
      pendingGrades,
    }
  })
