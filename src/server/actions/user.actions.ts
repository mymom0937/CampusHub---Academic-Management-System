import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware, authMiddleware } from '@/lib/middleware'
import * as userService from '@/server/services/user.service'
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  userListFiltersSchema,
} from '@/server/validators/user.schema'
import { isAppError, toAppError } from '@/server/errors/AppError'
import type { SessionUser } from '@/types/dto'

/** List users (admin only) */
export const listUsersAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => userListFiltersSchema.parse(data))
  .handler(async ({ data }) => {
    return userService.listUsers(data)
  })

/** Get user detail (admin only) */
export const getUserDetailAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { id: string }
    if (!parsed.id) throw new Error('User ID is required')
    return parsed
  })
  .handler(async ({ data }) => {
    return userService.getUserDetail(data.id)
  })

/** Create user (admin only) */
export const createUserAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => createUserSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const user = await userService.createUser(data)
      return { success: true as const, data: user }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Update user (admin only) */
export const updateUserAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => updateUserSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const user = await userService.updateUser(data)
      return { success: true as const, data: user }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Deactivate user (admin only) */
export const deactivateUserAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { id: string }
    if (!parsed.id) throw new Error('User ID is required')
    return parsed
  })
  .handler(async ({ data }) => {
    try {
      await userService.deactivateUser(data.id)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Update profile (own) */
export const updateProfileAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => updateProfileSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const user = context.user as SessionUser
      await userService.updateProfile(user.id, data)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** List instructors (for dropdown) */
export const listInstructorsAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { listInstructors } = await import('@/server/repositories/user.repository')
    return listInstructors()
  })
