import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
import { registerSchema, type RegisterInput } from '@/server/validators/auth.schema'
import { registerAction, getSession } from '@/server/actions/auth.actions'
import { ROLE_DASHBOARD_PATHS } from '@/types/roles'

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const user = await getSession()
    if (user) {
      throw redirect({ to: ROLE_DASHBOARD_PATHS[user.role] })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    try {
      const result = await registerAction({ data })

      if (result.success) {
        toast.success('Account created! Please check your email to verify your account.')
        setVerificationSent(true)
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8" />
            <span className="font-bold text-2xl">CampusHub</span>
          </Link>
        </div>

        {verificationSent ? (
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <MailCheck className="h-12 w-12 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address. Please click the link to verify your account before signing in.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Go to Sign In</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Register as a student to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Min 8 chars, uppercase, number, special"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Repeat your password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <SocialLoginButtons />
              <Button type="submit" className="w-full" loading={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary underline-offset-4 hover:underline font-medium"
                >
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
        )}
      </div>
    </div>
  )
}
