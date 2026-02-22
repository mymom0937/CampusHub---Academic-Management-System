import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap, ShieldCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { resetPasswordSchema, type ResetPasswordInput } from '@/server/validators/auth.schema'
import { resetPasswordAction, getSession } from '@/server/actions/auth.actions'
import { ROLE_DASHBOARD_PATHS } from '@/types/roles'

type ResetPasswordSearch = {
  token?: string
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  beforeLoad: async () => {
    const user = await getSession()
    if (user) {
      throw redirect({ to: ROLE_DASHBOARD_PATHS[user.role] })
    }
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
    },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true)
    try {
      const result = await resetPasswordAction({ data })
      if (result.success) {
        setSuccess(true)
        toast.success('Password reset successfully!')
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8" />
              <span className="font-bold text-2xl">CampusHub</span>
            </Link>
          </div>
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or missing. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full" asChild>
                <Link to="/forgot-password">Request New Reset Link</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Back to Sign In</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8" />
              <span className="font-bold text-2xl">CampusHub</span>
            </Link>
          </div>
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <ShieldCheck className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Password Reset!</CardTitle>
              <CardDescription>
                Your password has been successfully changed. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate({ to: '/login' })}>
                Go to Sign In
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Reset form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8" />
            <span className="font-bold text-2xl">CampusHub</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <input type="hidden" {...register('token')} />
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  id="newPassword"
                  placeholder="Min 8 chars, uppercase, number, special"
                  {...register('newPassword')}
                  error={errors.newPassword?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Repeat your new password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" loading={loading}>
                Reset Password
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-primary underline-offset-4 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
