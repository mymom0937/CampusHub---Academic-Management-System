import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Search, UserCog } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'

import { getSession } from '@/server/actions/auth.actions'
import { listUsersAction, createUserAction, updateUserAction } from '@/server/actions/user.actions'
import { createUserSchema, type CreateUserInput } from '@/server/validators/user.schema'
import type { SessionUser, UserListItem } from '@/types/dto'
import type { PaginatedData } from '@/types/api'

export const Route = createFileRoute('/admin/users/')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    if (user.role !== 'ADMIN') throw redirect({ to: '/dashboard' })
    return { user }
  },
  loader: async () => {
    const data = await listUsersAction({ data: { page: 1, pageSize: 20 } })
    return { users: data }
  },
  pendingComponent: () => (
    <div className="p-8">
      <TableSkeleton rows={8} cols={5} />
    </div>
  ),
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const { users: initialData } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const navigate = useNavigate()
  const [users, setUsers] = useState<PaginatedData<UserListItem>>(initialData)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState<UserListItem | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'STUDENT' },
  })

  const handleSearch = async () => {
    const data = await listUsersAction({
      data: { page: 1, pageSize: 20, search: searchQuery || undefined },
    })
    setUsers(data)
  }

  const handleCreate = async (data: CreateUserInput) => {
    setCreating(true)
    try {
      const result = await createUserAction({ data })
      if (result.success) {
        toast.success('User created successfully')
        setDialogOpen(false)
        reset()
        handleSearch()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = async (u: UserListItem) => {
    const result = await updateUserAction({
      data: { id: u.id, isActive: !u.isActive },
    })
    if (result.success) {
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`)
      handleSearch()
    } else {
      toast.error(result.error.message)
    }
  }

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'default' as const
      case 'INSTRUCTOR': return 'secondary' as const
      case 'STUDENT': return 'outline' as const
      default: return 'outline' as const
    }
  }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users' },
        ]}
      />

      <div className="space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage system users and their roles.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with a specific role.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreate)}>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input {...register('firstName')} error={errors.firstName?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input {...register('lastName')} error={errors.lastName?.message} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" {...register('email')} error={errors.email?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" {...register('password')} error={errors.password?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      defaultValue="STUDENT"
                      onValueChange={(val) => setValue('role', val as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT')}
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
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" loading={creating}>
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Table */}
        {users.items.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="No users found"
            description="No users match your search criteria. Try a different search or create a new user."
            action={{ label: 'Create User', onClick: () => setDialogOpen(true) }}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.firstName} {u.lastName}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'success' : 'destructive'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin/users/$id" params={{ id: u.id }}>
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmToggle(u)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination info */}
        <div className="text-sm text-muted-foreground">
          Showing {users.items.length} of {users.total} users
        </div>

        {/* Activate/Deactivate confirmation dialog */}
        <AlertDialog open={!!confirmToggle} onOpenChange={(open) => !open && setConfirmToggle(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmToggle?.isActive ? 'Deactivate User' : 'Activate User'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmToggle?.isActive
                  ? `Are you sure you want to deactivate ${confirmToggle.firstName} ${confirmToggle.lastName}? They will no longer be able to log in.`
                  : `Are you sure you want to activate ${confirmToggle?.firstName} ${confirmToggle?.lastName}? They will be able to log in again.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmToggle) {
                    handleToggleActive(confirmToggle)
                    setConfirmToggle(null)
                  }
                }}
              >
                {confirmToggle?.isActive ? 'Deactivate' : 'Activate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
