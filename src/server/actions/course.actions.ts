import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware, instructorMiddleware, studentMiddleware } from '@/lib/middleware'
import * as courseService from '@/server/services/course.service'
import {
  createCourseSchema,
  updateCourseSchema,
  assignInstructorSchema,
  createSemesterSchema,
  updateSemesterSchema,
  courseListFiltersSchema,
} from '@/server/validators/course.schema'
import { isAppError, toAppError } from '@/server/errors/AppError'
import type { SessionUser } from '@/types/dto'

// ============================================================
// COURSE ACTIONS
// ============================================================

/** List courses */
export const listCoursesAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => courseListFiltersSchema.parse(data))
  .handler(async ({ data }) => {
    return courseService.listCourses(data)
  })

/** Create course (admin) */
export const createCourseAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => createCourseSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const course = await courseService.createCourse(data)
      return { success: true as const, data: course }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Update course (admin) */
export const updateCourseAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => updateCourseSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const course = await courseService.updateCourse(data)
      return { success: true as const, data: course }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Assign instructor to course (admin) */
export const assignInstructorAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => assignInstructorSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      await courseService.assignInstructor(data)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Remove instructor from course (admin) */
export const removeInstructorAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { courseId: string; instructorId: string }
    if (!parsed.courseId || !parsed.instructorId) throw new Error('Invalid input')
    return parsed
  })
  .handler(async ({ data }) => {
    try {
      await courseService.removeInstructor(data.courseId, data.instructorId)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Archive course (admin) */
export const archiveCourseAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { id: string }
    if (!parsed.id) throw new Error('Course ID is required')
    return parsed
  })
  .handler(async ({ data }) => {
    try {
      await courseService.archiveCourse(data.id)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Get course detail (admin) */
export const getCourseDetailAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { id: string }
    if (!parsed.id) throw new Error('Course ID is required')
    return parsed
  })
  .handler(async ({ data }) => {
    return courseService.getCourseDetail(data.id)
  })

/** Get instructor's courses */
export const getInstructorCoursesAction = createServerFn({ method: 'GET' })
  .middleware([instructorMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    return courseService.getInstructorCourses(user.id)
  })

/** Get course detail for instructor (verifies instructor is assigned) */
export const getInstructorCourseDetailAction = createServerFn({ method: 'GET' })
  .middleware([instructorMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { id: string }
    if (!parsed.id) throw new Error('Course ID is required')
    return parsed
  })
  .handler(async ({ data, context }) => {
    const user = context.user as SessionUser
    return courseService.getInstructorCourseDetail(user.id, data.id)
  })

/** Get course catalog (student) - includes enrollment status */
export const getCourseCatalogAction = createServerFn({ method: 'GET' })
  .middleware([studentMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { search?: string } | undefined
    return parsed || {}
  })
  .handler(async ({ data, context }) => {
    const user = context.user as SessionUser
    return courseService.getCourseCatalog(data?.search, user.id)
  })

// ============================================================
// SEMESTER ACTIONS
// ============================================================

/** List semesters */
export const listSemestersAction = createServerFn({ method: 'GET' }).handler(
  async () => {
    return courseService.listSemesters()
  }
)

/** Get semester detail (admin) */
export const getSemesterDetailAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { id: string }
    if (!parsed.id) throw new Error('Semester ID is required')
    return parsed
  })
  .handler(async ({ data }) => {
    return courseService.getSemesterDetail(data.id)
  })

/** Create semester (admin) */
export const createSemesterAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => createSemesterSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const semester = await courseService.createSemester(data)
      return { success: true as const, data: semester }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Update semester (admin) */
export const updateSemesterAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => updateSemesterSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const semester = await courseService.updateSemester(data)
      return { success: true as const, data: semester }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })
