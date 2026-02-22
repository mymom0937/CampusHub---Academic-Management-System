import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/server/validators/auth.schema'
import { auth } from '@/lib/auth'
import { authMiddleware } from '@/lib/middleware'
import type { SessionUser } from '@/types/dto'
import type { UserRole } from '@/types/roles'

type AuthUser = { id: string; email: string; emailVerified?: boolean | null } & Record<string, unknown>

function toSessionUser(au: AuthUser): SessionUser {
  return {
    id: au.id,
    email: au.email,
    firstName: au.firstName as string,
    lastName: au.lastName as string,
    role: au.role as UserRole,
    isActive: (au.isActive as boolean) ?? true,
    emailVerified: au.emailVerified ?? false,
  }
}

/** Get current session user via Better-Auth */
export const getSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => {
    try {
      const session = await auth.api.getSession({ headers: getRequestHeaders() })
      return session ? toSessionUser(session.user as AuthUser) : null
    } catch {
      return null
    }
  }
)

/** Login action via Better-Auth */
export const loginAction = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const result = await auth.api.signInEmail({
        body: { email: data.email, password: data.password },
      })

      if (!result) {
        return { success: false as const, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } }
      }

      const user = result.user as AuthUser
      if (user.isActive === false) {
        return {
          success: false as const,
          error: { code: 'UNAUTHORIZED', message: 'Your account has been deactivated' },
        }
      }

      return { success: true as const, data: { user: toSessionUser(user) } }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid email or password'
      return { success: false as const, error: { code: 'UNAUTHORIZED', message } }
    }
  })

/** Register action via Better-Auth */
export const registerAction = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => registerSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      })

      if (!result) {
        return { success: false as const, error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } }
      }

      return { success: true as const, data: { user: toSessionUser(result.user as AuthUser) } }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'An error occurred during registration'
      const isConflict = msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')
      return {
        success: false as const,
        error: {
          code: isConflict ? 'CONFLICT' : 'INTERNAL_ERROR',
          message: isConflict ? 'An account with this email already exists' : msg,
        },
      }
    }
  })

/** Logout action via Better-Auth */
export const logoutAction = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    await auth.api.signOut({ headers: getRequestHeaders() })
  } catch {
    /* always succeed to clear client state */
  }
  return { success: true }
})

/** Change password action via Better-Auth */
export const changePasswordAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => changePasswordSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      await auth.api.changePassword({
        headers: getRequestHeaders(),
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          revokeOtherSessions: false,
        },
      })
      return { success: true as const }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to change password'
      return { success: false as const, error: { code: 'UNAUTHORIZED', message } }
    }
  })

/** Forgot password action — sends reset link via Better-Auth */
export const forgotPasswordAction = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => forgotPasswordSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      await auth.api.requestPasswordReset({
        body: { email: data.email, redirectTo: '/reset-password' },
      })
    } catch {
      /* intentionally swallow — don't reveal whether email exists */
    }
    return {
      success: true as const,
      message: 'If an account exists with that email, a password reset link has been sent.',
    }
  })

/** Reset password action — sets new password via Better-Auth */
export const resetPasswordAction = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => resetPasswordSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      await auth.api.resetPassword({
        body: { token: data.token, newPassword: data.newPassword },
      })
      return { success: true as const }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reset password'
      const isBadRequest =
        message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid')
      return {
        success: false as const,
        error: {
          code: isBadRequest ? 'BAD_REQUEST' : 'INTERNAL_ERROR',
          message: isBadRequest
            ? 'This reset link has expired or is invalid. Please request a new one.'
            : message,
        },
      }
    }
  })

/** Resend verification email action */
export const resendVerificationEmailAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as SessionUser
    try {
      await auth.api.sendVerificationEmail({
        body: { email: user.email, callbackURL: '/' },
      })
      return {
        success: true as const,
        message: 'Verification email sent. Please check your inbox.',
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to send verification email'
      return { success: false as const, error: { code: 'INTERNAL_ERROR', message } }
    }
  })
