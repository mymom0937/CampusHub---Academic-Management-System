import { useState } from 'react'
import { AlertTriangle, Mail, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { resendVerificationEmailAction } from '@/server/actions/auth.actions'

interface EmailVerificationBannerProps {
  email: string
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  if (dismissed) return null

  const handleResend = async () => {
    setSending(true)
    try {
      const result = await resendVerificationEmailAction()
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to send verification email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-medium">Email not verified.</span>{' '}
            <span className="hidden sm:inline">
              Please verify your email address ({email}) to access all features.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={sending}
            className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <Mail className="h-4 w-4 mr-1.5" />
            {sending ? 'Sending...' : 'Resend'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
