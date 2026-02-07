import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { KeyRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getSession } from '@/server/actions/auth.actions'
import { changePasswordAction } from '@/server/actions/auth.actions'
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from '@/server/validators/auth.schema'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/profile/password')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  component: ChangePasswordPage,
})

function ChangePasswordPage() {
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    setLoading(true)
    try {
      const result = await changePasswordAction({ data })
      if (result.success) {
        toast.success('Password changed successfully')
        reset()
        navigate({ to: '/profile' })
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'Change Password' },
        ]}
      />

      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
            Change Password
          </h1>
          <p className="text-muted-foreground mt-1">
            Update your account password. You&apos;ll need your current password.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Password</CardTitle>
              </div>
              <CardDescription>
                Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <PasswordInput
                  id="currentPassword"
                  placeholder="Enter your current password"
                  {...register('currentPassword')}
                  error={errors.currentPassword?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  id="newPassword"
                  placeholder="Enter your new password"
                  {...register('newPassword')}
                  error={errors.newPassword?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <PasswordInput
                  id="confirmNewPassword"
                  placeholder="Repeat your new password"
                  {...register('confirmNewPassword')}
                  error={errors.confirmNewPassword?.message}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild>
                <Link to="/profile">Cancel</Link>
              </Button>
              <Button type="submit" loading={loading}>
                Change Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
