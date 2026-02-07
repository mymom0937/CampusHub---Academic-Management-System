import { prisma } from '@/lib/prisma'

/** Find course by ID with details */
export async function findCourseById(id: string) {
  return prisma.course.findFirst({
    where: { id, deletedAt: null },
    include: {
      semester: true,
      instructorAssignments: {
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      _count: {
        select: {
          enrollments: { where: { status: 'ENROLLED' } },
        },
      },
    },
  })
}

/** List courses with pagination and filters */
export async function listCourses(params: {
  page: number
  pageSize: number
  search?: string
  semesterId?: string
}) {
  const { page, pageSize, search, semesterId } = params
  const where = {
    deletedAt: null,
    ...(semesterId && { semesterId }),
    ...(search && {
      OR: [
        { code: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        semester: { select: { id: true, name: true, code: true } },
        instructorAssignments: {
          include: {
            instructor: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: {
            enrollments: { where: { status: 'ENROLLED' } },
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { code: 'asc' },
    }),
    prisma.course.count({ where }),
  ])

  return { items, total }
}

/** Create a course */
export async function createCourse(data: {
  code: string
  name: string
  description?: string | null
  credits: number
  capacity: number
  semesterId: string
}) {
  return prisma.course.create({ data })
}

/** Update a course */
export async function updateCourse(
  id: string,
  data: {
    name?: string
    description?: string | null
    credits?: number
    capacity?: number
  }
) {
  return prisma.course.update({
    where: { id },
    data,
  })
}

/** Assign instructor to course */
export async function assignInstructor(data: {
  courseId: string
  instructorId: string
  isPrimary: boolean
}) {
  return prisma.instructorAssignment.create({ data })
}

/** Remove instructor from course */
export async function removeInstructor(
  courseId: string,
  instructorId: string
) {
  return prisma.instructorAssignment.delete({
    where: {
      instructorId_courseId: { instructorId, courseId },
    },
  })
}

/** Find courses by instructor */
export async function findCoursesByInstructor(instructorId: string) {
  return prisma.course.findMany({
    where: {
      deletedAt: null,
      instructorAssignments: {
        some: { instructorId },
      },
    },
    include: {
      semester: { select: { id: true, name: true, code: true, isActive: true } },
      instructorAssignments: {
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      _count: {
        select: {
          enrollments: { where: { status: 'ENROLLED' } },
        },
      },
    },
    orderBy: { semester: { startDate: 'desc' } },
  })
}

/** Find courses in active semester for catalog */
export async function findCourseCatalog(semesterId: string, search?: string) {
  return prisma.course.findMany({
    where: {
      deletedAt: null,
      semesterId,
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    },
    include: {
      semester: { select: { id: true, name: true, enrollmentStart: true, enrollmentEnd: true } },
      instructorAssignments: {
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      _count: {
        select: {
          enrollments: { where: { status: 'ENROLLED' } },
        },
      },
    },
    orderBy: { code: 'asc' },
  })
}

/** Archive a course (soft delete) */
export async function archiveCourse(id: string) {
  return prisma.course.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

/** Count total courses */
export async function countCourses() {
  return prisma.course.count({ where: { deletedAt: null } })
}
