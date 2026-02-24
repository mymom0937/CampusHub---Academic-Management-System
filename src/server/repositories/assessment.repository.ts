import { prisma } from '@/lib/prisma'

export interface AssessmentInput {
  name: string
  weight: number
  maxScore?: number
}

/** Get assessments for a course */
export async function getCourseAssessments(courseId: string) {
  return prisma.courseAssessment.findMany({
    where: { courseId },
    orderBy: { sortOrder: 'asc' },
  })
}

/** Upsert assessments for a course (replace all) */
export async function upsertCourseAssessments(
  courseId: string,
  assessments: AssessmentInput[]
) {
  await prisma.$transaction(async (tx) => {
    await tx.enrollmentAssessmentScore.deleteMany({
      where: {
        assessment: { courseId },
      },
    })
    await tx.courseAssessment.deleteMany({
      where: { courseId },
    })
    if (assessments.length > 0) {
      await tx.courseAssessment.createMany({
        data: assessments.map((a, i) => ({
          courseId,
          name: a.name,
          weight: a.weight,
          maxScore: a.maxScore ?? 100,
          sortOrder: i,
        })),
      })
    }
  })
  return getCourseAssessments(courseId)
}

/** Get assessment scores for enrollments */
export async function getEnrollmentScores(enrollmentIds: string[]) {
  const scores = await prisma.enrollmentAssessmentScore.findMany({
    where: { enrollmentId: { in: enrollmentIds } },
    include: {
      assessment: true,
    },
  })
  return scores
}

/** Upsert a single assessment score */
export async function upsertAssessmentScore(
  enrollmentId: string,
  assessmentId: string,
  score: number | null,
  maxScore?: number
) {
  return prisma.enrollmentAssessmentScore.upsert({
    where: {
      enrollmentId_assessmentId: { enrollmentId, assessmentId },
    },
    create: {
      enrollmentId,
      assessmentId,
      score,
      maxScore: maxScore ?? undefined,
    },
    update: {
      score,
      ...(maxScore !== undefined && { maxScore }),
    },
  })
}

/** Batch upsert assessment scores for an enrollment */
export async function upsertEnrollmentScores(
  enrollmentId: string,
  scores: Array<{ assessmentId: string; score: number | null; maxScore?: number }>
) {
  for (const s of scores) {
    await upsertAssessmentScore(
      enrollmentId,
      s.assessmentId,
      s.score,
      s.maxScore
    )
  }
}
