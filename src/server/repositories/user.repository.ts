import { prisma } from '@/lib/prisma'
import type { Role } from '../../../generated/prisma/client'

/** Find user by email (active, non-deleted) */
export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
  })
}

/** Find user by ID (active, non-deleted) */
export async function findUserById(id: string) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
  })
}

/** Create a new user (used by admin, Better-Auth handles auth-based creation) */
export async function createUser(data: {
  email: string
  name: string
  firstName: string
  lastName: string
  role?: Role
}) {
  return prisma.user.create({ data })
}

/** Update a user */
export async function updateUser(
  id: string,
  data: {
    name?: string
    firstName?: string
    lastName?: string
    role?: Role
    isActive?: boolean
  }
) {
  return prisma.user.update({
    where: { id },
    data,
  })
}

/** Soft delete a user */
export async function softDeleteUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  })
}

/** List users with pagination and filters */
export async function listUsers(params: {
  page: number
  pageSize: number
  search?: string
  role?: Role
  isActive?: boolean
}) {
  const { page, pageSize, search, role, isActive } = params
  const where = {
    deletedAt: null,
    ...(role && { role }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return { items, total }
}

/** Count users by role */
export async function countUsersByRole() {
  const counts = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
    where: { deletedAt: null, isActive: true },
  })
  return counts
}

/** List instructors (for assignment) */
export async function listInstructors() {
  return prisma.user.findMany({
    where: { role: 'INSTRUCTOR', isActive: true, deletedAt: null },
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: { lastName: 'asc' },
  })
}
