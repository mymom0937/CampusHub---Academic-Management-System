import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { loginSchema, registerSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from '@/server/validators/auth.schema'
import { auth } from '@/lib/auth'
import { authMiddleware } from '@/lib/middleware'
import type { SessionUser } from '@/types/dto'
import type { UserRole } from '@/types/roles'

/** Get current session user via Better-Auth */
export const getSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => {
    try {
      const headers = getRequestHeaders()
      const session = await auth.api.getSession({ headers })

      if (!session) return null

      const user = session.user as Record<string, unknown>
      return {
        id: session.user.id,
        email: session.user.email,
        firstName: user.firstName as string,
        lastName: user.lastName as string,
        role: user.role as UserRole,
        isActive: user.isActive as boolean,
        emailVerified: session.user.emailVerified ?? false,
      }
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
        body: {
          email: data.email,
          password: data.password,
        },
      })

      if (!result) {
        return {
          success: false as const,
          error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
        }
      }

      const user = result.user as Record<string, unknown>

      // Check if user is active
      if (user.isActive === false) {
        return {
          success: false as const,
          error: { code: 'UNAUTHORIZED', message: 'Your account has been deactivated' },
        }
      }

      return {
        success: true as const,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: user.firstName as string,
            lastName: user.lastName as string,
            role: user.role as UserRole,
            isActive: user.isActive as boolean,
            emailVerified: result.user.emailVerified ?? false,
          },
        },
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Invalid email or password'
      return {
        success: false as const,
        error: { code: 'UNAUTHORIZED', message },
      }
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
        return {
          success: false as const,
          error: { code: 'INTERNAL_ERROR', message: 'Registration failed' },
        }
      }

      const user = result.user as Record<string, unknown>

      return {
        success: true as const,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: user.firstName as string || data.firstName,
            lastName: user.lastName as string || data.lastName,
            role: (user.role as UserRole) || 'STUDENT',
            isActive: (user.isActive as boolean) ?? true,
          },
        },
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'An error occurred during registration'
      // Check for duplicate email
      if (message.toLowerCase().includes('already') || message.toLowerCase().includes('exist')) {
        return {
          success: false as const,
          error: { code: 'CONFLICT', message: 'An account with this email already exists' },
        }
      }
      return {
        success: false as const,
        error: { code: 'INTERNAL_ERROR', message },
      }
    }
  })

/** Logout action via Better-Auth */
export const logoutAction = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const headers = getRequestHeaders()
      await auth.api.signOut({ headers })
      return { success: true }
    } catch {
      return { success: true }
    }
  }
)

/** Change password action via Better-Auth */
export const changePasswordAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => changePasswordSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const headers = getRequestHeaders()
      await auth.api.changePassword({
        headers,
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          revokeOtherSessions: false,
        },
      })
      return { success: true as const }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to change password'
      return {
        success: false as const,
        error: { code: 'UNAUTHORIZED', message },
      }
    }
  })

/** Forgot password action — sends reset link via Better-Auth */
export const forgotPasswordAction = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => forgotPasswordSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      console.log(`[ForgotPassword] Attempting reset for: ${data.email}`)
      await auth.api.requestPasswordReset({
        body: {
          email: data.email,
          redirectTo: '/reset-password',
        },
      })
      console.log(`[ForgotPassword] Reset request completed for: ${data.email}`)
    } catch (error) {
      // Log the error for debugging but don't reveal to user whether email exists
      console.error('[ForgotPassword] Error:', error)
    }
    // Always return success for security (don't reveal whether email exists)
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
        body: {
          token: data.token,
          newPassword: data.newPassword,
        },
      })
      return { success: true as const }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to reset password'
      // Check for expired/invalid token
      if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid')) {
        return {
          success: false as const,
          error: { code: 'BAD_REQUEST', message: 'This reset link has expired or is invalid. Please request a new one.' },
        }
      }
      return {
        success: false as const,
        error: { code: 'INTERNAL_ERROR', message },
      }
    }
  })

/** Resend verification email action */
export const resendVerificationEmailAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const user = context.user as SessionUser
      await auth.api.sendVerificationEmail({
        body: {
          email: user.email,
          callbackURL: '/',
        },
      })
      return {
        success: true as const,
        message: 'Verification email sent. Please check your inbox.',
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to send verification email'
      return {
        success: false as const,
        error: { code: 'INTERNAL_ERROR', message },
      }
    }
  })
