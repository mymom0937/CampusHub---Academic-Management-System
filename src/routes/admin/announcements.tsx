import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { Megaphone, Plus, Trash2, Pencil, Info, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { EmptyState } from '@/components/ui/empty-state'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'

import { requireAdmin } from '@/lib/admin-route'
import { uploadToCloudinary } from '@/lib/upload'
import { AnnouncementMedia } from '@/components/announcement/AnnouncementMedia'
import {
  listAllAnnouncementsAction,
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
} from '@/server/actions/notification.actions'
import type { SessionUser, AnnouncementItem } from '@/types/dto'

export const Route = createFileRoute('/admin/announcements')({
  beforeLoad: async () => ({ user: await requireAdmin() }),
  loader: async () => {
    const announcements = await listAllAnnouncementsAction();
    return { announcements };
  },
  pendingComponent: () => (
    <div className="p-8">
      <TableSkeleton rows={5} cols={5} />
    </div>
  ),
  component: AdminAnnouncementsPage,
});

function AdminAnnouncementsPage() {
  const { announcements: initial } = Route.useLoaderData();
  const { user } = Route.useRouteContext() as { user: SessionUser };
  const [announcements, setAnnouncements] =
    useState<AnnouncementItem[]>(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(
    null,
  );
  const [detailTarget, setDetailTarget] = useState<AnnouncementItem | null>(
    null,
  );
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<string>("ALL");
  const [mediaType, setMediaType] = useState<"TEXT" | "IMAGE" | "VIDEO" | "AUDIO">("TEXT")
  const [mediaUrl, setMediaUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = async () => {
    const data = await listAllAnnouncementsAction();
    setAnnouncements(data);
  };

  const resetForm = () => {
    setTitle("")
    setContent("")
    setTargetRole("ALL")
    setMediaType("TEXT")
    setMediaUrl("")
    setEditingId(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resType = mediaType === "VIDEO" ? "video" : "image"
      const url = await uploadToCloudinary(file, resType)
      if (url) {
        setMediaUrl(url)
        toast.success("File uploaded successfully")
      } else {
        toast.error("Upload failed. Add Cloudinary env vars or paste a URL instead.")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const openCreateDialog = () => {
    setMode("create");
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (a: AnnouncementItem) => {
    setMode("edit");
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setTargetRole(a.targetRole ?? "ALL");
    setMediaType((a.mediaType as "TEXT" | "IMAGE" | "VIDEO" | "AUDIO") || "TEXT")
    setMediaUrl(a.mediaUrl ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const commonData = {
        title,
        content,
        targetRole:
          targetRole === "ALL"
            ? null
            : (targetRole as "ADMIN" | "INSTRUCTOR" | "STUDENT"),
        mediaType,
        mediaUrl: mediaUrl.trim() || undefined,
      };

      const result =
        mode === "edit" && editingId
          ? await updateAnnouncementAction({
              data: {
                id: editingId,
                ...commonData,
              },
            })
          : await createAnnouncementAction({
              data: commonData,
            });
      if (result.success) {
        toast.success(
          mode === "edit"
            ? "Announcement updated successfully"
            : "Announcement created successfully",
        );
        setDialogOpen(false);
        resetForm();
        refresh();
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error(
        mode === "edit"
          ? "Failed to update announcement"
          : "Failed to create announcement",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (a: AnnouncementItem) => {
    const result = await updateAnnouncementAction({
      data: { id: a.id, isPublished: !a.isPublished },
    });
    if (result.success) {
      toast.success(
        a.isPublished ? "Announcement unpublished" : "Announcement published",
      );
      refresh();
    } else {
      toast.error(result.error.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteAnnouncementAction({
      data: { id: deleteTarget.id },
    });
    if (result.success) {
      toast.success("Announcement deleted");
      setDeleteTarget(null);
      refresh();
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <DashboardLayout user={user}>
      <Breadcrumb
        items={[{ label: "Admin", href: "/admin" }, { label: "Announcements" }]}
      />

      <div className="space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
              Announcements
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage system announcements.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  openCreateDialog();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {mode === "edit" ? "Edit Announcement" : "Create Announcement"}
                </DialogTitle>
                <DialogDescription>
                  {mode === "edit"
                    ? "Update the content and media for this announcement."
                    : "Create a new announcement visible to users."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Announcement content..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Users</SelectItem>
                      <SelectItem value="STUDENT">Students Only</SelectItem>
                      <SelectItem value="INSTRUCTOR">
                        Instructors Only
                      </SelectItem>
                      <SelectItem value="ADMIN">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Content type</Label>
                  <Select
                    value={mediaType}
                    onValueChange={(v) => {
                      setMediaType(v as "TEXT" | "IMAGE" | "VIDEO" | "AUDIO")
                      setMediaUrl("")
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text only</SelectItem>
                      <SelectItem value="IMAGE">Image (upload or paste URL)</SelectItem>
                      <SelectItem value="VIDEO">Video (upload or paste URL)</SelectItem>
                      <SelectItem value="AUDIO">Audio (paste URL)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select Image or Video to upload files via Cloudinary or paste a URL.
                  </p>
                </div>
                {(mediaType === "IMAGE" || mediaType === "VIDEO") && (
                  <div className="space-y-2">
                    <Label>Upload or paste URL</Label>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={mediaType === "IMAGE" ? "image/*" : "video/*"}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                      {mediaUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setMediaUrl("")
                            fileInputRef.current && (fileInputRef.current.value = "")
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder={
                        mediaType === "IMAGE"
                          ? "Or paste image URL (e.g. Cloudinary, imgur)"
                          : "Or paste URL (YouTube, Vimeo, MP4)"
                      }
                    />
                  </div>
                )}
                {mediaType === "AUDIO" && (
                  <div className="space-y-2">
                    <Label>Media URL</Label>
                    <Input
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://... (MP3, hosted audio)"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleSave} loading={saving}>
                  {saving ? (mode === "edit" ? "Saving…" : "Creating…") : (mode === "edit" ? "Save changes" : "Create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Create your first announcement to communicate with users."
            action={{
              label: "Create Announcement",
              onClick: () => setDialogOpen(true),
            }}
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
                    <TableCell className="font-medium max-w-xs truncate">
                      {a.title}
                    </TableCell>
                    <TableCell>{a.authorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{a.targetRole || "All"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.isPublished ? "success" : "secondary"}>
                        {a.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailTarget(a)}
                        title="View details"
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(a)}
                        title="Edit announcement"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(a)}
                      >
                        {a.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(a)}
                        title="Delete announcement"
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

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This
              cannot be undone.
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

      {/* Details dialog */}
      <Dialog
        open={!!detailTarget}
        onOpenChange={(open) => !open && setDetailTarget(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {detailTarget?.title ?? "Announcement details"}
            </DialogTitle>
            <DialogDescription>
              Full details for this announcement, including content and any
              attached media.
            </DialogDescription>
          </DialogHeader>
          {detailTarget && (
            <div className="space-y-4 py-2 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">
                  {detailTarget.targetRole || "All users"}
                </Badge>
                <Badge variant={detailTarget.isPublished ? "success" : "secondary"}>
                  {detailTarget.isPublished ? "Published" : "Draft"}
                </Badge>
                {detailTarget.mediaType && detailTarget.mediaType !== "TEXT" && (
                  <Badge variant="outline" className="uppercase">
                    {detailTarget.mediaType}
                  </Badge>
                )}
                <span>
                  {new Date(detailTarget.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1">Content</p>
                <p className="whitespace-pre-line">{detailTarget.content}</p>
              </div>

              {detailTarget.mediaType &&
                detailTarget.mediaType !== "TEXT" &&
                detailTarget.mediaUrl && (
                  <div>
                    <p className="font-semibold text-foreground mb-1 capitalize">
                      {detailTarget.mediaType}
                    </p>
                    <AnnouncementMedia
                      mediaType={detailTarget.mediaType}
                      mediaUrl={detailTarget.mediaUrl}
                      title={detailTarget.title}
                    />
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
