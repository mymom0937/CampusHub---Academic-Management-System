import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { requireAuth } from '@/lib/admin-route'
import { updateProfileAction } from '@/server/actions/user.actions'
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/server/validators/user.schema'
import { ROLE_LABELS } from '@/types/roles'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/profile/')({
  beforeLoad: async () => ({ user: await requireAuth() }),
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema) as Resolver<UpdateProfileInput>,
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setLoading(true)
    try {
      const result = await updateProfileAction({ data })
      if (result.success) {
        toast.success('Profile updated successfully')
        navigate({ to: '/dashboard' })
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Profile', href: '/profile' }]} />
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" loading={loading}>
                {loading ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your password and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/profile/password">Change Password</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
