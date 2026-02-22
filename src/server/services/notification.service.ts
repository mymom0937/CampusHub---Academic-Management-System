import { AppError } from '@/server/errors/AppError'
import * as notificationRepo from '@/server/repositories/notification.repository'
import type { Role, MediaType } from '../../../generated/prisma/client'

/** Get notifications for a user */
export async function getUserNotifications(userId: string, unreadOnly: boolean = false) {
  const notifications = await notificationRepo.getUserNotifications(userId, 20, unreadOnly)
  return notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    link: n.link,
    createdAt: n.createdAt.toISOString(),
  }))
}

/** Get unread count */
export async function getUnreadCount(userId: string): Promise<number> {
  return notificationRepo.countUnread(userId)
}

/** Mark notification as read */
export async function markAsRead(id: string, userId: string): Promise<void> {
  await notificationRepo.markAsRead(id, userId)
}

/** Mark all as read */
export async function markAllAsRead(userId: string): Promise<void> {
  await notificationRepo.markAllAsRead(userId)
}

/** Send notification to a user */
export async function sendNotification(data: {
  userId: string
  title: string
  message: string
  type: 'ENROLLMENT' | 'GRADE' | 'ANNOUNCEMENT' | 'SYSTEM'
  link?: string
}): Promise<void> {
  await notificationRepo.createNotification(data)
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================

/** Create announcement (admin) */
export async function createAnnouncement(data: {
  title: string
  content: string
  authorId: string
  targetRole?: Role | null
  mediaType?: MediaType | null
  mediaUrl?: string | null
}) {
  return notificationRepo.createAnnouncement(data)
}

/** Update announcement (admin) */
export async function updateAnnouncement(
  id: string,
  data: {
    title?: string
    content?: string
    targetRole?: Role | null
    isPublished?: boolean
    mediaType?: MediaType | null
    mediaUrl?: string | null
  }
) {
  const existing = await notificationRepo.findAnnouncementById(id)
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Announcement not found')
  }
  return notificationRepo.updateAnnouncement(id, data)
}

/** Delete announcement (admin) */
export async function deleteAnnouncement(id: string): Promise<void> {
  const existing = await notificationRepo.findAnnouncementById(id)
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Announcement not found')
  }
  await notificationRepo.deleteAnnouncement(id)
}

/** List announcements for a role */
export async function listAnnouncements(role?: Role) {
  const announcements = await notificationRepo.listAnnouncements(role)
  return announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    authorName: `${a.author.firstName} ${a.author.lastName}`,
    targetRole: a.targetRole,
    isPublished: a.isPublished,
    createdAt: a.createdAt.toISOString(),
    mediaType: (a.mediaType ?? 'TEXT') as 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO',
    mediaUrl: a.mediaUrl ?? null,
  }))
}

/** List all announcements (admin) */
export async function listAllAnnouncements() {
  const announcements = await notificationRepo.listAllAnnouncements()
  return announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    authorName: `${a.author.firstName} ${a.author.lastName}`,
    targetRole: a.targetRole,
    isPublished: a.isPublished,
    createdAt: a.createdAt.toISOString(),
    mediaType: (a.mediaType ?? 'TEXT') as 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO',
    mediaUrl: a.mediaUrl ?? null,
  }))
}
