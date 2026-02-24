import { z } from 'zod'

export const assessmentItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  weight: z.number().min(0).max(100),
  maxScore: z.number().min(1).max(1000).optional().default(100),
})

export const saveAssessmentsSchema = z.object({
  courseId: z.string().min(1),
  assessments: z.array(assessmentItemSchema).min(1, 'At least one assessment required'),
}).refine(
  (data) => {
    const total = data.assessments.reduce((s, a) => s + a.weight, 0)
    return total === 100
  },
  { message: 'Assessment weights must total 100%', path: ['assessments'] }
)

export const saveScoresSchema = z.object({
  enrollmentId: z.string().min(1),
  scores: z.array(z.object({
    assessmentId: z.string().min(1),
    score: z.number().min(0).nullable(),
    maxScore: z.number().min(1).optional(),
  })),
})

export type SaveAssessmentsInput = z.infer<typeof saveAssessmentsSchema>
export type SaveScoresInput = z.infer<typeof saveScoresSchema>
