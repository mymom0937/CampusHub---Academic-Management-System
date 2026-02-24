import { createServerFn } from '@tanstack/react-start'
import { instructorMiddleware, staffMiddleware, studentMiddleware } from '@/lib/middleware'
import * as gradeService from '@/server/services/grade.service'
import * as gpaService from '@/server/services/gpa.service'
import { submitGradeSchema, bulkGradeSchema } from '@/server/validators/enrollment.schema'
import { saveAssessmentsSchema, saveScoresSchema } from '@/server/validators/assessment.schema'
import { toAppError } from '@/server/errors/AppError'
import type { SessionUser } from '@/types/dto'

/** Get full grading data: assessments + students with scores (instructor) */
export const getCourseGradingDataAction = createServerFn({ method: 'GET' })
  .middleware([instructorMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { courseId: string }
    if (!parsed.courseId) throw new Error('Course ID is required')
    return parsed
  })
  .handler(async ({ data, context }) => {
    const user = context.user as SessionUser
    return gradeService.getCourseGradingData(user.id, data.courseId)
  })

/** Save course assessment weights (instructor) */
export const saveCourseAssessmentsAction = createServerFn({ method: 'POST' })
  .middleware([instructorMiddleware])
  .inputValidator((data: unknown) => saveAssessmentsSchema.parse(data))
  .handler(async ({ data, context }) => {
    const user = context.user as SessionUser
    const assessments = await gradeService.saveCourseAssessments(
      user.id,
      data.courseId,
      data.assessments.map((a) => ({ name: a.name, weight: a.weight, maxScore: a.maxScore }))
    )
    return { success: true as const, data: { assessments } }
  })

/** Save assessment scores for a student (instructor) */
export const saveAssessmentScoresAction = createServerFn({ method: 'POST' })
  .middleware([instructorMiddleware])
  .inputValidator((data: unknown) => saveScoresSchema.parse(data))
  .handler(async ({ data, context }) => {
    const user = context.user as SessionUser
    await gradeService.saveAssessmentScores(user.id, data.enrollmentId, data.scores)
    return { success: true as const }
  })

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

/** Get students in instructor's courses (for transcript page) */
export const getInstructorStudentsAction = createServerFn({ method: 'GET' })
  .middleware([instructorMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    return gradeService.getInstructorStudents(user.id)
  })

/** Get student transcript (student: own only) */
export const getTranscriptAction = createServerFn({ method: 'GET' })
  .middleware([studentMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    return gpaService.getTranscript(user.id)
  })

/** Get a specific student's transcript (admin/instructor only). Instructors may only view students in their courses. */
export const getStudentTranscriptAction = createServerFn({ method: 'POST' })
  .middleware([staffMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { studentId: string }
    if (!parsed?.studentId) throw new Error('Student ID is required')
    return parsed
  })
  .handler(async ({ data, context }) => {
    const user = context.user as SessionUser
    return gpaService.getStudentTranscriptForStaff(user.id, user.role, data.studentId)
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
