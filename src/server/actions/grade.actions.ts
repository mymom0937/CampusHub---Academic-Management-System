import { createServerFn } from '@tanstack/react-start'
import { instructorMiddleware, studentMiddleware } from '@/lib/middleware'
import * as gradeService from '@/server/services/grade.service'
import * as gpaService from '@/server/services/gpa.service'
import { submitGradeSchema, bulkGradeSchema } from '@/server/validators/enrollment.schema'
import { toAppError } from '@/server/errors/AppError'
import type { SessionUser } from '@/types/dto'

/** Submit grade (instructor) */
export const submitGradeAction = createServerFn({ method: 'POST' })
  .middleware([instructorMiddleware])
  .inputValidator((data: unknown) => submitGradeSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const user = context.user as SessionUser
      await gradeService.submitGrade(user.id, data.enrollmentId, data.grade)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Update an existing grade (instructor) */
export const updateGradeAction = createServerFn({ method: 'POST' })
  .middleware([instructorMiddleware])
  .inputValidator((data: unknown) => submitGradeSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const user = context.user as SessionUser
      await gradeService.updateGrade(user.id, data.enrollmentId, data.grade)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Get course student grades (instructor) */
export const getCourseGradesAction = createServerFn({ method: 'GET' })
  .middleware([instructorMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { courseId: string }
    if (!parsed.courseId) throw new Error('Course ID is required')
    return parsed
  })
  .handler(async ({ data, context }) => {
    const user = context.user as SessionUser
    return gradeService.getCourseStudentGrades(user.id, data.courseId)
  })

/** Get student transcript */
export const getTranscriptAction = createServerFn({ method: 'GET' })
  .middleware([studentMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    return gpaService.getTranscript(user.id)
  })

/** Bulk grade submission (instructor) */
export const bulkSubmitGradesAction = createServerFn({ method: 'POST' })
  .middleware([instructorMiddleware])
  .inputValidator((data: unknown) => bulkGradeSchema.parse(data))
  .handler(async ({ data, context }) => {
    const user = context.user as SessionUser
    const results: Array<{ enrollmentId: string; success: boolean; error?: string }> = []

    for (const entry of data.grades) {
      try {
        await gradeService.submitGrade(user.id, entry.enrollmentId, entry.grade)
        results.push({ enrollmentId: entry.enrollmentId, success: true })
      } catch (error) {
        const appError = toAppError(error)
        results.push({
          enrollmentId: entry.enrollmentId,
          success: false,
          error: appError.message,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return {
      success: true as const,
      data: { results, successCount, failCount },
    }
  })

/** Get student GPA summary */
export const getGpaSummaryAction = createServerFn({ method: 'GET' })
  .middleware([studentMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    return gpaService.getGpaSummary(user.id)
  })
