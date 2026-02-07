import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'

import { getSession } from '@/server/actions/auth.actions'
import {
  listAllAnnouncementsAction,
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
} from '@/server/actions/notification.actions'
import type { SessionUser, AnnouncementItem } from '@/types/dto'

export const Route = createFileRoute('/admin/announcements')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) throw redirect({ to: '/login' })
    if (user.role !== 'ADMIN') throw redirect({ to: '/dashboard' })
    return { user }
  },
  loader: async () => {
    const announcements = await listAllAnnouncementsAction()
    return { announcements }
  },
  pendingComponent: () => (
    <div className="p-8"><TableSkeleton rows={5} cols={5} /></div>
  ),
  component: AdminAnnouncementsPage,
})

function AdminAnnouncementsPage() {
  const { announcements: initial } = Route.useLoaderData()
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initial)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetRole, setTargetRole] = useState<string>('ALL')

  const refresh = async () => {
    const data = await listAllAnnouncementsAction()
    setAnnouncements(data)
  }

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required')
      return
    }
    setCreating(true)
    try {
      const result = await createAnnouncementAction({
        data: {
          title,
          content,
          targetRole: targetRole === 'ALL' ? null : targetRole as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
        },
      })
      if (result.success) {
        toast.success('Announcement created successfully')
        setDialogOpen(false)
        setTitle('')
        setContent('')
        setTargetRole('ALL')
        refresh()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error('Failed to create announcement')
    } finally {
      setCreating(false)
    }
  }

  const handleTogglePublish = async (a: AnnouncementItem) => {
    const result = await updateAnnouncementAction({
      data: { id: a.id, isPublished: !a.isPublished },
    })
    if (result.success) {
      toast.success(a.isPublished ? 'Announcement unpublished' : 'Announcement published')
      refresh()
    } else {
      toast.error(result.error.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteAnnouncementAction({ data: { id: deleteTarget.id } })
    if (result.success) {
      toast.success('Announcement deleted')
      setDeleteTarget(null)
      refresh()
    } else {
      toast.error(result.error.message)
    }
  }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Announcements' }]} />

      <div className="space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">Announcements</h1>
            <p className="text-muted-foreground mt-1">Create and manage system announcements.</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Announcement</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>Create a new announcement visible to users.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Announcement content..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Users</SelectItem>
                      <SelectItem value="STUDENT">Students Only</SelectItem>
                      <SelectItem value="INSTRUCTOR">Instructors Only</SelectItem>
                      <SelectItem value="ADMIN">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} loading={creating}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Create your first announcement to communicate with users."
            action={{ label: 'Create Announcement', onClick: () => setDialogOpen(true) }}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium max-w-xs truncate">{a.title}</TableCell>
                    <TableCell>{a.authorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{a.targetRole || 'All'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.isPublished ? 'success' : 'secondary'}>
                        {a.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(a)}>
                        {a.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
