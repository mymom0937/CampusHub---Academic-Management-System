import { hashPassword } from 'better-auth/crypto'
import { AppError } from '@/server/errors/AppError'
import * as userRepo from '@/server/repositories/user.repository'
import type { CreateUserInput, UpdateUserInput } from '@/server/validators/user.schema'
import type { UserListItem, UserDetail } from '@/types/dto'
import type { PaginatedData } from '@/types/api'
import type { UserRole } from '@/types/roles'

/** Create a new user (admin) - creates user + account directly without signing in */
export async function createUser(input: CreateUserInput): Promise<UserListItem> {
  const existing = await userRepo.findUserByEmail(input.email)
  if (existing) {
    throw new AppError('CONFLICT', 'A user with this email already exists')
  }

  const user = await userRepo.createUserWithAccount({
    email: input.email,
    password: await hashPassword(input.password),
    firstName: input.firstName,
    lastName: input.lastName,
    role: (input.role || 'STUDENT') as UserRole,
  })

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as UserRole,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  }
}

/** Update a user (admin) */
export async function updateUser(input: UpdateUserInput): Promise<UserListItem> {
  const user = await userRepo.findUserById(input.id)
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found')
  }

  // Build name from new/existing first/last name
  const newFirstName = input.firstName || user.firstName
  const newLastName = input.lastName || user.lastName

  const updated = await userRepo.updateUser(input.id, {
    ...(input.firstName && { firstName: input.firstName }),
    ...(input.lastName && { lastName: input.lastName }),
    ...((input.firstName || input.lastName) && { name: `${newFirstName} ${newLastName}` }),
    ...(input.role && { role: input.role as UserRole }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  })

  return {
    id: updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    role: updated.role as UserRole,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
  }
}

/** Get user detail */
export async function getUserDetail(id: string): Promise<UserDetail> {
  const user = await userRepo.findUserById(id)
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found')
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as UserRole,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  }
}

/** List users with pagination */
export async function listUsers(params: {
  page: number
  pageSize: number
  search?: string
  role?: string
  isActive?: boolean
}): Promise<PaginatedData<UserListItem>> {
  const { items, total } = await userRepo.listUsers({
    ...params,
    role: params.role as UserRole | undefined,
  })

  return {
    items: items.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role as UserRole,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
    })),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}

/** Deactivate user (soft delete) */
export async function deactivateUser(id: string): Promise<void> {
  const user = await userRepo.findUserById(id)
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found')
  }
  await userRepo.updateUser(id, { isActive: false })
}

/** Update profile (own profile) */
export async function updateProfile(
  userId: string,
  data: { firstName: string; lastName: string }
): Promise<void> {
  await userRepo.updateUser(userId, {
    ...data,
    name: `${data.firstName} ${data.lastName}`,
  })
}
