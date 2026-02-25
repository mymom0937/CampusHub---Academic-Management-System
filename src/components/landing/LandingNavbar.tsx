import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { GraduationCap, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/theme/ModeToggle'
import { logoutAction } from '@/server/actions/auth.actions'
import type { SessionUser } from '@/types/dto'

type LandingNavbarProps = {
  user: SessionUser | null
  dashboardPath: string | null
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/', hash: 'about', label: 'About' },
  { to: '/', hash: 'academics', label: 'Academics' },
  { to: '/', hash: 'campus', label: 'Campus Life' },
  { to: '/news', label: 'News' },
  { to: '/', hash: 'contact', label: 'Contact' },
]

export function LandingNavbar({ user, dashboardPath }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logoutAction()
      navigate({ to: '/login' })
      setMobileMenuOpen(false)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div className="hidden sm:block">
            <span className="font-bold text-lg">CampusHub</span>
            <span className="block text-[10px] text-muted-foreground -mt-0.5">Academic Management</span>
          </div>
          <span className="font-bold text-lg sm:hidden">CampusHub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="flex items-center gap-1 max-md:hidden font-nav">
          {navLinks.map((link) =>
            link.hash ? (
              <Link
                key={link.label}
                to={link.to}
                hash={link.hash}
                className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 max-md:hidden">
          <ModeToggle />
          {user && dashboardPath ? (
            <>
              <Button asChild className="gap-2">
                <Link to={dashboardPath}>
                  <LayoutDashboard className="h-4 w-4" />
                  Portal
                </Link>
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Signing out…' : 'Log Out'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 pb-4 pt-2 space-y-2 font-nav">
          {navLinks.map((link) =>
            link.hash ? (
              <Link
                key={link.label}
                to={link.to}
                hash={link.hash}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground rounded-md"
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground rounded-md"
              >
                {link.label}
              </Link>
            )
          )}
          <div className="flex flex-col gap-2 pt-2 border-t">
            {user && dashboardPath ? (
              <>
                <Button className="w-full gap-2" asChild>
                  <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    Portal
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? 'Signing out…' : 'Log Out'}
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
