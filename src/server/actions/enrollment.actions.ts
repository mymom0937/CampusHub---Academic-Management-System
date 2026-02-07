import { createServerFn } from '@tanstack/react-start'
import { studentMiddleware } from '@/lib/middleware'
import * as enrollmentService from '@/server/services/enrollment.service'
import { enrollSchema, dropSchema } from '@/server/validators/enrollment.schema'
import { toAppError } from '@/server/errors/AppError'
import type { SessionUser } from '@/types/dto'

/** Enroll in a course (or join waitlist) */
export const enrollAction = createServerFn({ method: 'POST' })
  .middleware([studentMiddleware])
  .inputValidator((data: unknown) => enrollSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const user = context.user as SessionUser
      const result = await enrollmentService.enrollStudent(user.id, data.courseId)
      return {
        success: true as const,
        data: result,
      }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Drop a course */
export const dropAction = createServerFn({ method: 'POST' })
  .middleware([studentMiddleware])
  .inputValidator((data: unknown) => dropSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const user = context.user as SessionUser
      await enrollmentService.dropCourse(user.id, data.enrollmentId)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Leave waitlist */
export const leaveWaitlistAction = createServerFn({ method: 'POST' })
  .middleware([studentMiddleware])
  .inputValidator((data: unknown) => dropSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const user = context.user as SessionUser
      await enrollmentService.leaveWaitlist(user.id, data.enrollmentId)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Get student enrollments */
export const getStudentEnrollmentsAction = createServerFn({ method: 'GET' })
  .middleware([studentMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    return enrollmentService.getStudentEnrollments(user.id)
  })
