import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { Resend } from 'resend'
import { passwordResetEmail, verificationEmail } from './email-templates'
import { prisma } from './prisma'

const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM || 'CampusHub <onboarding@resend.dev>'

async function sendEmail(to: string, subject: string, html: string, logContext: string) {
  const { data, error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html })
  if (error) {
    console.error(`[Email] ${logContext} error:`, JSON.stringify(error))
    return
  }
  console.log(`[Email] ${logContext} sent to ${to}${data?.id ? ` (ID: ${data.id})` : ''}`)
}

/** Split full name into first and last (for providers that only give name) */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName?.trim().split(/\s+/) ?? []
  if (parts.length === 0) return { firstName: 'User', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

/** Better-Auth server instance */
export const auth = betterAuth({
  baseURL: APP_URL,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET && {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          mapProfileToUser: (profile) => {
            const p = (profile ?? {}) as { given_name?: string; family_name?: string; name?: string }
            const firstName = p.given_name ?? 'User'
            const lastName = p.family_name ?? ''
            const name = (`${firstName} ${lastName}`.trim() || p.name) ?? 'User'
            return { name, firstName, lastName }
          },
        },
      }),
    ...(process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET && {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          mapProfileToUser: (profile) => {
            const fullName = ((profile ?? {}) as { name?: string }).name ?? ''
            const { firstName, lastName } = splitName(fullName)
            const name = fullName || 'User'
            return { name, firstName: firstName || 'User', lastName }
          },
        },
      }),
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendEmail(
          user.email,
          'Reset Your CampusHub Password',
          passwordResetEmail(user.name || 'there', url),
          'Password reset'
        )
      } catch (err) {
        console.error(`[Email] Failed to send password reset to ${user.email}:`, err)
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail(
          user.email,
          'Verify Your CampusHub Email',
          verificationEmail(user.name || 'there', url),
          'Verification'
        )
      } catch (err) {
        console.error(`[Email] Failed to send verification to ${user.email}:`, err)
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24 hours
  },
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: true,
        input: true,
      },
      lastName: {
        type: 'string',
        required: true,
        input: true,
      },
      role: {
        type: 'string',
        defaultValue: 'STUDENT',
        input: false, // not settable during signup
      },
      isActive: {
        type: 'boolean',
        defaultValue: true,
        input: false,
      },
    },
  },
  plugins: [tanstackStartCookies()], // must be last plugin
})
