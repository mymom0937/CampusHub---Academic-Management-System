import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Megaphone, Calendar, Shield, Info } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { AnnouncementMedia } from '@/components/announcement/AnnouncementMedia'

import { getSession } from '@/server/actions/auth.actions'
import { listAnnouncementsAction } from '@/server/actions/notification.actions'
import type { SessionUser, AnnouncementItem } from '@/types/dto'

export const Route = createFileRoute('/news')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
  loader: async () => {
    const announcements = await listAnnouncementsAction()
    return { announcements }
  },
  pendingComponent: () => (
    <div className="p-8">
      <TableSkeleton rows={4} cols={3} />
    </div>
  ),
  component: NewsPage,
})

function NewsPage() {
  const { user } = Route.useRouteContext() as { user: SessionUser }
  const { announcements } = Route.useLoaderData() as { announcements: AnnouncementItem[] }

  return (
    <DashboardLayout user={user}>
      <Breadcrumb items={[{ label: 'News & updates' }]} />

      <div className="space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Megaphone className="h-3.5 w-3.5" />
            CampusHub news &amp; updates
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            News, release notes &amp; service updates
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
            Stay informed about what&apos;s new in CampusHub, planned improvements, and important
            information affecting students, instructors, and administrators.
          </p>
        </header>

        <Separator />

        <div className="grid gap-6 md:grid-cols-[3fr,2fr] items-start">
          {/* Announcements feed (role-aware) */}
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                There are no announcements yet. Check back later for updates from your institution.
              </p>
            ) : (
              announcements.map((a) => (
                <Card key={a.id}>
                  <CardHeader className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Announcement</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                      {a.targetRole && (
                        <Badge variant="secondary" className="text-[11px]">
                          {a.targetRole}
                        </Badge>
                      )}
                      {a.mediaType && a.mediaType !== 'TEXT' && (
                        <Badge variant="outline" className="text-[11px] uppercase">
                          {a.mediaType}
                        </Badge>
                      )}
                    </div>
                    <CardTitle>{a.title}</CardTitle>
                    <CardDescription>From {a.authorName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{a.content}</p>
                    <AnnouncementMedia
                      mediaType={a.mediaType}
                      mediaUrl={a.mediaUrl}
                      title={a.title}
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Service status & important notices */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Operational</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Platform status
                  </span>
                </div>
                <CardTitle>Service status</CardTitle>
                <CardDescription>
                  CampusHub is running normally with no known incidents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  All core features are available: authentication, dashboards, enrollment, grading,
                  GPA calculation, and notifications.
                </p>
                <p className="text-xs">
                  In case of planned maintenance, details will be published on this page in advance
                  with affected modules and expected time windows.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Information</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    For all users
                  </span>
                </div>
                <CardTitle>How to stay informed</CardTitle>
                <CardDescription>
                  Where to find announcements depending on your role.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-medium">Students</span>: Check your dashboard and
                    notifications for enrollment deadlines, grade releases, and academic standing
                    alerts.
                  </li>
                  <li>
                    <span className="font-medium">Instructors</span>: Review dashboard notifications
                    for grading windows, submission deadlines, and course updates.
                  </li>
                  <li>
                    <span className="font-medium">Admins</span>: Use the Admin &gt; Announcements
                    area to publish time-sensitive updates to your users.
                  </li>
                </ul>
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard">Go to dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

