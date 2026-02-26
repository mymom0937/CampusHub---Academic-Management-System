import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail, Shield, Calendar, UserCog } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FormSkeleton } from '@/components/skeletons/FormSkeleton'

import { requireAdmin } from '@/lib/admin-route'
import {
  getUserDetailAction,
  updateUserAction,
  deactivateUserAction,
} from '@/server/actions/user.actions'
import { updateUserSchema } from '@/server/validators/user.schema'
import { ROLE_LABELS } from '@/types/roles'
import type { SessionUser, UserDetail } from '@/types/dto'
import type { UserRole } from '@/types/roles'

export const Route = createFileRoute('/admin/users/$id')({
  beforeLoad: async () => ({ user: await requireAdmin() }),
  loader: async ({ params }) => {
    const userDetail = await getUserDetailAction({ data: { id: params.id } })
    return { userDetail }
  },
  pendingComponent: () => (
    <div className="p-8">
      <FormSkeleton fields={6} />
    </div>
  ),
  component: AdminUserDetailPage,
})

function AdminUserDetailPage() {
  const { userDetail } = Route.useLoaderData()
  const { user: currentUser } = Route.useRouteContext() as {
    user: SessionUser
  }
  const navigate = useNavigate()
  const [detail, setDetail] = useState<UserDetail>(userDetail)
  const [saving, setSaving] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      updateUserSchema.omit({ id: true })
    ),
    defaultValues: {
      firstName: detail.firstName,
      lastName: detail.lastName,
      role: detail.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
    },
  })

  const handleSave = async (data: {
    firstName?: string
    lastName?: string
    role?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  }) => {
    setSaving(true)
    try {
      const result = await updateUserAction({
        data: { id: detail.id, ...data },
      })
      if (result.success) {
        toast.success('User updated successfully')
        // Refresh detail
        const updated = await getUserDetailAction({
          data: { id: detail.id },
        })
        setDetail(updated)
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    setDeactivating(true)
    try {
      const result = await deactivateUserAction({
        data: { id: detail.id },
      })
      if (result.success) {
        toast.success('User deactivated successfully')
        navigate({ to: '/admin/users' })
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to deactivate user')
    } finally {
      setDeactivating(false)
      setShowDeactivateDialog(false)
    }
  }

  const isSelf = currentUser.id === detail.id

  return (
    <DashboardLayout user={currentUser}>
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: `${detail.firstName} ${detail.lastName}` },
        ]}
      />

      <div className="max-w-3xl space-y-6 min-w-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
              {detail.firstName} {detail.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">User details and management.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={detail.isActive ? 'success' : 'destructive'}>
              {detail.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge>{ROLE_LABELS[detail.role]}</Badge>
          </div>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Overview of the user&apos;s account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{detail.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{ROLE_LABELS[detail.role]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(detail.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {detail.role === 'STUDENT'
                      ? 'Enrollments'
                      : detail.role === 'INSTRUCTOR'
                        ? 'Assigned Courses'
                        : 'Status'}
                  </p>
                  <p className="font-medium">
                    {detail.role === 'STUDENT'
                      ? detail.enrollmentCount ?? 0
                      : detail.role === 'INSTRUCTOR'
                        ? detail.courseCount ?? 0
                        : detail.isActive
                          ? 'Active'
                          : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Edit Form */}
        <Card>
          <form onSubmit={handleSubmit(handleSave)}>
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
              <CardDescription>
                Update this user&apos;s information.
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
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  defaultValue={detail.role}
                  onValueChange={(val) =>
                    setValue('role', val as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT')
                  }
                  disabled={isSelf}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {isSelf && (
                  <p className="text-xs text-muted-foreground">
                    You cannot change your own role.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" loading={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Danger Zone */}
        {!isSelf && detail.isActive && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Deactivating a user will prevent them from logging in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setShowDeactivateDialog(true)}
              >
                Deactivate User
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate{' '}
              <strong>
                {detail.firstName} {detail.lastName}
              </strong>
              ? They will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={deactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivating ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
