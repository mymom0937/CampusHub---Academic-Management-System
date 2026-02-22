const BRAND = 'CampusHub - Academic Management System'
const BUTTON_STYLE =
  'background-color: #0f172a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'

interface EmailLayoutParams {
  title: string
  greeting: string
  body: string
  buttonText?: string
  buttonUrl?: string
  footer: string
}

function emailLayout({
  title,
  greeting,
  body,
  buttonText,
  buttonUrl,
  footer,
}: EmailLayoutParams): string {
  const buttonHtml =
    buttonText && buttonUrl
      ? `<div style="text-align: center; margin: 30px 0;">
          <a href="${buttonUrl}" style="${BUTTON_STYLE}">${buttonText}</a>
        </div>`
      : ''

  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1a1a1a;">${title}</h2>
  <p>${greeting}</p>
  <p>${body}</p>
  ${buttonHtml}
  <p style="color: #666; font-size: 14px;">${footer}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="color: #999; font-size: 12px;">${BRAND}</p>
</div>`.trim()
}

/** Password reset email template */
export function passwordResetEmail(recipientName: string, resetUrl: string): string {
  return emailLayout({
    title: 'Password Reset Request',
    greeting: `Hi ${recipientName},`,
    body: 'We received a request to reset your CampusHub password. Click the button below to set a new password:',
    buttonText: 'Reset Password',
    buttonUrl: resetUrl,
    footer: "If you didn't request this, you can safely ignore this email. This link expires in 1 hour.",
  })
}

/** Email verification template */
export function verificationEmail(recipientName: string, verifyUrl: string): string {
  return emailLayout({
    title: 'Welcome to CampusHub!',
    greeting: `Hi ${recipientName},`,
    body: 'Thank you for creating an account. Please verify your email address by clicking the button below:',
    buttonText: 'Verify Email',
    buttonUrl: verifyUrl,
    footer: "If you didn't create this account, you can safely ignore this email.",
  })
}
