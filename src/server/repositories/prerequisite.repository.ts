import { prisma } from '@/lib/prisma'

/** Get all prerequisites for a course code */
export async function getPrerequisites(courseCode: string) {
  return prisma.coursePrerequisite.findMany({
    where: { courseCode },
    orderBy: { prerequisiteCode: 'asc' },
  })
}

/** Add a prerequisite for a course */
export async function addPrerequisite(
  courseCode: string,
  prerequisiteCode: string
) {
  return prisma.coursePrerequisite.create({
    data: { courseCode, prerequisiteCode },
  })
}

/** Remove a prerequisite */
export async function removePrerequisite(id: string) {
  return prisma.coursePrerequisite.delete({
    where: { id },
  })
}

/** Check if a student has completed all prerequisites for a course code */
export async function checkPrerequisitesMet(
  studentId: string,
  courseCode: string
): Promise<{ met: boolean; missing: string[] }> {
  const prerequisites = await prisma.coursePrerequisite.findMany({
    where: { courseCode },
  })

  if (prerequisites.length === 0) {
    return { met: true, missing: [] }
  }

  // Get all completed courses for this student
  const completedEnrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: 'COMPLETED',
      grade: { notIn: ['F', 'W', 'DO', 'NG', 'I'] },
    },
    include: {
      course: { select: { code: true } },
    },
  })

  const completedCodes = new Set(completedEnrollments.map((e) => e.course.code))

  const missing = prerequisites
    .filter((p) => !completedCodes.has(p.prerequisiteCode))
    .map((p) => p.prerequisiteCode)

  return { met: missing.length === 0, missing }
}

/** Get all prerequisite mappings (admin) */
export async function listAllPrerequisites() {
  return prisma.coursePrerequisite.findMany({
    orderBy: [{ courseCode: 'asc' }, { prerequisiteCode: 'asc' }],
  })
}
