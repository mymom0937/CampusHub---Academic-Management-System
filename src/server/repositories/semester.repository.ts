import { prisma } from '@/lib/prisma'

/** Find semester by ID */
export async function findSemesterById(id: string) {
  return prisma.semester.findFirst({
    where: { id, deletedAt: null },
    include: {
      _count: { select: { courses: true } },
    },
  })
}

/** Find active semester */
export async function findActiveSemester() {
  return prisma.semester.findFirst({
    where: { isActive: true, deletedAt: null },
  })
}

/** List all semesters */
export async function listSemesters() {
  return prisma.semester.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { courses: true } },
    },
    orderBy: { startDate: 'desc' },
  })
}

/** Create a semester */
export async function createSemester(data: {
  name: string
  code: string
  startDate: Date
  endDate: Date
  enrollmentStart: Date
  enrollmentEnd: Date
  dropDeadline: Date
  isActive?: boolean
}) {
  // If setting as active, deactivate all others first
  if (data.isActive) {
    await prisma.semester.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })
  }

  return prisma.semester.create({ data })
}

/** Update a semester */
export async function updateSemester(
  id: string,
  data: {
    name?: string
    startDate?: Date
    endDate?: Date
    enrollmentStart?: Date
    enrollmentEnd?: Date
    dropDeadline?: Date
    isActive?: boolean
  }
) {
  // If setting as active, deactivate all others first
  if (data.isActive) {
    await prisma.semester.updateMany({
      where: { isActive: true, id: { not: id } },
      data: { isActive: false },
    })
  }

  return prisma.semester.update({
    where: { id },
    data,
  })
}

/** Soft delete a semester */
export async function softDeleteSemester(id: string) {
  return prisma.semester.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

/** Find semester by code */
export async function findSemesterByCode(code: string) {
  return prisma.semester.findFirst({
    where: { code, deletedAt: null },
  })
}
