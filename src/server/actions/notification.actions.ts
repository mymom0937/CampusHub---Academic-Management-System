import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware, authMiddleware } from '@/lib/middleware'
import * as notificationService from '@/server/services/notification.service'
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '@/server/validators/notification.schema'
import { toAppError } from '@/server/errors/AppError'
import type { SessionUser } from '@/types/dto'
import type { UserRole } from '@/types/roles'

// ============================================================
// NOTIFICATION ACTIONS
// ============================================================

/** Get user notifications */
export const getNotificationsAction = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    return notificationService.getUserNotifications(user.id)
  })

/** Get unread notification count */
export const getUnreadCountAction = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    return notificationService.getUnreadCount(user.id)
  })

/** Mark notification as read */
export const markNotificationReadAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { id: string }
    if (!parsed.id) throw new Error('Notification ID is required')
    return parsed
  })
  .handler(async ({ data, context }) => {
    const user = context.user as SessionUser
    await notificationService.markAsRead(data.id, user.id)
    return { success: true as const }
  })

/** Mark all notifications as read */
export const markAllNotificationsReadAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    await notificationService.markAllAsRead(user.id)
    return { success: true as const }
  })

// ============================================================
// ANNOUNCEMENT ACTIONS
// ============================================================

/** List announcements for current user's role */
export const listAnnouncementsAction = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    return notificationService.listAnnouncements(user.role as UserRole)
  })

/** List all announcements (admin) */
export const listAllAnnouncementsAction = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return notificationService.listAllAnnouncements()
  })

/** Create announcement (admin) */
export const createAnnouncementAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => createAnnouncementSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const user = context.user as SessionUser
      await notificationService.createAnnouncement({
        ...data,
        authorId: user.id,
        targetRole: data.targetRole ?? null,
      })
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Update announcement (admin) */
export const updateAnnouncementAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => updateAnnouncementSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      await notificationService.updateAnnouncement(data.id, {
        title: data.title,
        content: data.content,
        // NOTE: keep `null` (ALL users) distinct from `undefined` (no change)
        targetRole: data.targetRole,
        isPublished: data.isPublished,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl ?? null,
      })
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })

/** Delete announcement (admin) */
export const deleteAnnouncementAction = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: unknown) => {
    const parsed = data as { id: string }
    if (!parsed.id) throw new Error('Announcement ID is required')
    return parsed
  })
  .handler(async ({ data }) => {
    try {
      await notificationService.deleteAnnouncement(data.id)
      return { success: true as const }
    } catch (error) {
      const appError = toAppError(error)
      return {
        success: false as const,
        error: { code: appError.code, message: appError.message },
      }
    }
  })
