import { redirect } from '@tanstack/react-router'
import { getSession } from '@/server/actions/auth.actions'
import type { SessionUser } from '@/types/dto'

/** Require any authenticated user. Throws redirect if unauthenticated. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) throw redirect({ to: '/login' })
  return user
}

/** Require admin session. Throws redirect if unauthenticated or non-admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw redirect({ to: '/dashboard' })
  return user
}

/** Require instructor session. Throws redirect if unauthenticated or non-instructor. */
export async function requireInstructor(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'INSTRUCTOR') throw redirect({ to: '/dashboard' })
  return user
}

/** Require student session. Throws redirect if unauthenticated or non-student. */
export async function requireStudent(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'STUDENT') throw redirect({ to: '/dashboard' })
  return user
}
