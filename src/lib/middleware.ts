import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from './auth'
import { AppError } from '@/server/errors/AppError'
import type { SessionUser } from '@/types/dto'
import type { UserRole } from '@/types/roles'

/** Auth middleware - ensures user is authenticated via Better-Auth */
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new AppError('UNAUTHORIZED', 'You must be logged in to access this resource')
  }

  const user: SessionUser = {
    id: session.user.id,
    email: session.user.email,
    firstName: (session.user as Record<string, unknown>).firstName as string,
    lastName: (session.user as Record<string, unknown>).lastName as string,
    role: (session.user as Record<string, unknown>).role as UserRole,
    isActive: (session.user as Record<string, unknown>).isActive as boolean,
  }

  if (!user.isActive) {
    throw new AppError('UNAUTHORIZED', 'Your account has been deactivated')
  }

  return next({ context: { user } })
})

/** Role middleware factory - ensures user has required role */
export function requireRole(...roles: UserRole[]) {
  return createMiddleware()
    .middleware([authMiddleware])
    .server(async ({ next, context }) => {
      const user = context.user as SessionUser

      if (!roles.includes(user.role)) {
        throw new AppError(
          'FORBIDDEN',
          `Access denied. Required role: ${roles.join(' or ')}`
        )
      }

      return next({ context: { user } })
    })
}

/** Admin middleware */
export const adminMiddleware = requireRole('ADMIN')

/** Instructor middleware */
export const instructorMiddleware = requireRole('INSTRUCTOR')

/** Student middleware */
export const studentMiddleware = requireRole('STUDENT')

/** Admin or Instructor middleware */
export const staffMiddleware = requireRole('ADMIN', 'INSTRUCTOR')
