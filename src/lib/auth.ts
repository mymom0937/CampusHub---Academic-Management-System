import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { Resend } from 'resend'
import { prisma } from './prisma'

const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM || 'CampusHub <onboarding@resend.dev>'

/** Better-Auth server instance */
export const auth = betterAuth({
  baseURL: APP_URL,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[Email] Sending password reset to ${user.email}`)
      console.log(`[Email] Reset URL: ${url}`)
      console.log(`[Email] Using API key: ${process.env.RESEND_API_KEY?.slice(0, 8)}...`)
      console.log(`[Email] From: ${EMAIL_FROM}`)
      try {
        const { data, error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: 'Reset Your CampusHub Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Password Reset Request</h2>
              <p>Hi ${user.name || 'there'},</p>
              <p>We received a request to reset your CampusHub password. Click the button below to set a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #0f172a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="color: #999; font-size: 12px;">CampusHub - Academic Management System</p>
            </div>
          `,
        })
        if (error) {
          console.error(`[Email] Resend API error:`, JSON.stringify(error))
        } else {
          console.log(`[Email] Password reset sent successfully! ID: ${data?.id}`)
        }
      } catch (error) {
        console.error(`[Email] Failed to send password reset to ${user.email}:`, error)
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[Email] Sending verification to ${user.email}`)
      console.log(`[Email] Verification URL: ${url}`)
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: 'Verify Your CampusHub Email',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Welcome to CampusHub!</h2>
              <p>Hi ${user.name || 'there'},</p>
              <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #0f172a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Verify Email
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="color: #999; font-size: 12px;">CampusHub - Academic Management System</p>
            </div>
          `,
        })
        console.log(`[Email] Verification sent successfully to ${user.email}`)
      } catch (error) {
        console.error(`[Email] Failed to send verification to ${user.email}:`, error)
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
