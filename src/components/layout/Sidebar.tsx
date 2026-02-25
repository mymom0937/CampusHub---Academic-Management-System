import { Link, useLocation } from '@tanstack/react-router'
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  LayoutDashboard,
  Megaphone,
  School,
  Settings,
  Users,
  Calendar,
  KeyRound,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/roles'

interface SidebarProps {
  role: UserRole
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const adminNav: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
      { label: 'Courses', href: '/admin/courses', icon: <BookOpen className="h-5 w-5" /> },
      { label: 'Semesters', href: '/admin/semesters', icon: <Calendar className="h-5 w-5" /> },
      { label: 'Transcripts', href: '/admin/transcripts', icon: <FileText className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Announcements', href: '/admin/announcements', icon: <Megaphone className="h-5 w-5" /> },
      { label: 'Calendar', href: '/admin/calendar', icon: <Calendar className="h-5 w-5" /> },
    ],
  },
]

const instructorNav: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/instructor', icon: <LayoutDashboard className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Teaching',
    items: [
      { label: 'My Courses', href: '/instructor/courses', icon: <BookOpen className="h-5 w-5" /> },
      { label: 'Transcripts', href: '/instructor/transcripts', icon: <FileText className="h-5 w-5" /> },
      { label: 'Calendar', href: '/instructor/calendar', icon: <Calendar className="h-5 w-5" /> },
    ],
  },
]

const studentNav: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/student', icon: <LayoutDashboard className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Academics',
    items: [
      { label: 'Course Catalog', href: '/student/courses', icon: <BookOpen className="h-5 w-5" /> },
      { label: 'My Enrollment', href: '/student/enrollment', icon: <ClipboardList className="h-5 w-5" /> },
      { label: 'My Grades', href: '/student/grades', icon: <BarChart3 className="h-5 w-5" /> },
      { label: 'Transcript', href: '/student/transcript', icon: <FileText className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Schedule',
    items: [
      { label: 'Calendar', href: '/student/calendar', icon: <Calendar className="h-5 w-5" /> },
    ],
  },
]

const roleNavMap: Record<UserRole, NavGroup[]> = {
  ADMIN: adminNav,
  INSTRUCTOR: instructorNav,
  STUDENT: studentNav,
}

const roleIconMap: Record<UserRole, React.ReactNode> = {
  ADMIN: <Settings className="h-5 w-5" />,
  INSTRUCTOR: <School className="h-5 w-5" />,
  STUDENT: <GraduationCap className="h-5 w-5" />,
}

const roleLabelMap: Record<UserRole, string> = {
  ADMIN: 'Admin Panel',
  INSTRUCTOR: 'Instructor Portal',
  STUDENT: 'Student Portal',
}

const bottomNav: NavItem[] = [
  { label: 'Profile', href: '/profile', icon: <User className="h-5 w-5" /> },
  { label: 'Change Password', href: '/profile/password', icon: <KeyRound className="h-5 w-5" /> },
]

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const navGroups = roleNavMap[role]

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo / Header - clickable to home */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border shrink-0">
        {collapsed ? (
          <Link
            to="/"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title="Back to home"
          >
            <Home className="h-5 w-5" />
          </Link>
        ) : (
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md hover:bg-sidebar-accent/50 transition-colors"
            title="Back to home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {roleIconMap[role]}
            </div>
            <span className="font-semibold text-sm truncate">{roleLabelMap[role]}</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-md hover:bg-sidebar-accent transition-colors',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 font-nav">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.title}
              </p>
            )}
            {collapsed && group.title !== 'Overview' && (
              <div className="mx-3 mb-2 border-t border-sidebar-border" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== `/${role.toLowerCase()}` &&
                    location.pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-sidebar-border p-3 space-y-0.5">
        {!collapsed && (
          <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Account
          </p>
        )}
        {bottomNav.map((item) => {
          const isActive = location.pathname === item.href

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}

        {/* Help link - routes to home contact section */}
        <Link
          to="/"
          hash="contact"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          title={collapsed ? 'Help & Support' : undefined}
        >
          <span className="shrink-0"><HelpCircle className="h-5 w-5" /></span>
          {!collapsed && <span className="truncate">Help & Support</span>}
        </Link>

        {/* Version badge */}
        {!collapsed && (
          <div className="px-3 pt-2">
            <p className="text-[10px] text-sidebar-foreground/30 font-medium">
              CampusHub v1.0.0
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
