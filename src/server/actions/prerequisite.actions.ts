import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '@/lib/middleware'
import * as prerequisiteService from '@/server/services/prerequisite.service'
import { addPrerequisiteSchema } from '@/server/validators/notification.schema'
import { toAppError } from '@/server/errors/AppError'

/** List all prerequisites (admin) */
export const listPrerequisitesAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return prerequisiteService.listAllPrerequisites()
  })

/** Get prerequisites for a course code (admin) */
export const getCoursePrerequisitesAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { courseCode: string }
    if (!parsed.courseCode) throw new Error('Course code is required')
    return parsed
  })
  .handler(async ({ data }) => {
    return prerequisiteService.getPrerequisites(data.courseCode)
  })

/** Add prerequisite (admin) */
export const addPrerequisiteAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => addPrerequisiteSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      await prerequisiteService.addPrerequisite(data.courseCode, data.prerequisiteCode)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Remove prerequisite (admin) */
export const removePrerequisiteAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { id: string }
    if (!parsed.id) throw new Error('Prerequisite ID is required')
    return parsed
  })
  .handler(async ({ data }) => {
    try {
      await prerequisiteService.removePrerequisite(data.id)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })
