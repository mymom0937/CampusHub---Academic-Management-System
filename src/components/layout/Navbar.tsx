import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, Menu, User, KeyRound, Search, GraduationCap, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from '@/components/theme/ModeToggle'
import { NotificationBell } from '@/components/layout/NotificationBell'
import type { SessionUser } from '@/types/dto'
import { ROLE_LABELS } from '@/types/roles'
import { logoutAction } from '@/server/actions/auth.actions'
import { Badge } from '@/components/ui/badge'

interface NavbarProps {
  user: SessionUser
  onMenuToggle: () => void
}

export function Navbar({ user, onMenuToggle }: NavbarProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutAction()
    navigate({ to: '/login' })
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-background backdrop-blur-md px-4 md:px-6">
      {/* Mobile: hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 md:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Mobile: logo */}
      <div className="md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">CampusHub</span>
        </Link>
      </div>

      {/* Desktop: search bar */}
      <div className="flex flex-1 max-w-md max-md:hidden">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search courses, students..."
            aria-label="Search courses and students"
            className="flex h-9 w-full rounded-lg border border-input bg-muted/50 px-3 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {/* Spacer pushes right items to the end */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <ModeToggle />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 lg:px-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-600 text-primary-foreground text-sm font-semibold">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="max-lg:hidden text-left">
                <p className="text-sm font-medium leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
              <ChevronDown className="max-lg:hidden h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-600 text-primary-foreground text-sm font-semibold shrink-0">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div className="flex flex-col space-y-0.5 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0">
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile/password" className="cursor-pointer">
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
