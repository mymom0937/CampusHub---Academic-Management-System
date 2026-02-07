import { z } from 'zod'

/** Enroll in course schema */
export const enrollSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
})

/** Drop course schema */
export const dropSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment is required'),
})

/** Submit grade schema */
export const submitGradeSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment is required'),
  grade: z.enum([
    'A_PLUS',
    'A',
    'A_MINUS',
    'B_PLUS',
    'B',
    'B_MINUS',
    'C_PLUS',
    'C',
    'D',
    'F',
    'P',
    'I',
    'W',
    'DO',
    'NG',
  ]),
})

/** Bulk grade submission schema */
export const bulkGradeSchema = z.object({
  courseId: z.string().min(1),
  grades: z.array(
    z.object({
      enrollmentId: z.string().min(1),
      grade: z.enum([
        'A_PLUS',
        'A',
        'A_MINUS',
        'B_PLUS',
        'B',
        'B_MINUS',
        'C_PLUS',
        'C',
        'D',
        'F',
        'P',
        'I',
        'W',
        'DO',
        'NG',
      ]),
    })
  ),
})

export type EnrollInput = z.infer<typeof enrollSchema>
export type DropInput = z.infer<typeof dropSchema>
export type SubmitGradeInput = z.infer<typeof submitGradeSchema>
export type BulkGradeInput = z.infer<typeof bulkGradeSchema>
