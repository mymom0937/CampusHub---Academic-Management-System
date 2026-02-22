import { prisma } from '@/lib/prisma'
import type { NotificationType, Role, MediaType } from '../../../generated/prisma/client'

/** Get notifications for a user */
export async function getUserNotifications(
  userId: string,
  limit: number = 20,
  unreadOnly: boolean = false
) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/** Count unread notifications */
export async function countUnread(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

/** Mark a notification as read */
export async function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  })
}

/** Mark all notifications as read for a user */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}

/** Create a notification */
export async function createNotification(data: {
  userId: string
  title: string
  message: string
  type: NotificationType
  link?: string
}) {
  return prisma.notification.create({ data })
}

/** Create notifications for multiple users */
export async function createBulkNotifications(
  notifications: Array<{
    userId: string
    title: string
    message: string
    type: NotificationType
    link?: string
  }>
) {
  return prisma.notification.createMany({ data: notifications })
}

/** Delete old read notifications (cleanup) */
export async function deleteOldNotifications(daysOld: number = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysOld)

  return prisma.notification.deleteMany({
    where: {
      isRead: true,
      createdAt: { lt: cutoff },
    },
  })
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================

/** Create an announcement */
export async function createAnnouncement(data: {
  title: string
  content: string
  authorId: string
  targetRole?: Role | null
  isPublished?: boolean
  mediaType?: MediaType | null
  mediaUrl?: string | null
}) {
  return prisma.announcement.create({ data })
}

/** Update an announcement */
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
  return prisma.announcement.update({
    where: { id },
    data,
  })
}

/** Delete an announcement */
export async function deleteAnnouncement(id: string) {
  return prisma.announcement.delete({ where: { id } })
}

/** List announcements (published, for a role or all) */
export async function listAnnouncements(role?: Role) {
  return prisma.announcement.findMany({
    where: {
      isPublished: true,
      OR: [
        { targetRole: null },
        ...(role ? [{ targetRole: role }] : []),
      ],
    },
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

/** List all announcements (admin) */
export async function listAllAnnouncements() {
  return prisma.announcement.findMany({
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/** Find announcement by ID */
export async function findAnnouncementById(id: string) {
  return prisma.announcement.findUnique({
    where: { id },
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  })
}
