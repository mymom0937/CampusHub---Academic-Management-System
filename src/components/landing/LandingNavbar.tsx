import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { GraduationCap, LayoutDashboard, Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/theme/ModeToggle'
import type { SessionUser } from '@/types/dto'

type LandingNavbarProps = {
  user: SessionUser | null
  dashboardPath: string | null
}

export function LandingNavbar({ user, dashboardPath }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl">CampusHub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="flex items-center gap-1 max-md:hidden">
          <Link
            to="/"
            hash="features"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
          >
            Features
          </Link>
          <Link
            to="/"
            hash="highlights"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
          >
            Highlights
          </Link>
          <Link
            to="/"
            hash="about"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
          >
            About
          </Link>
          <Link
            to="/news"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
          >
            News
          </Link>
          <Link
            to="/"
            hash="contact"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2 max-md:hidden">
          <ModeToggle />
          {user && dashboardPath ? (
            <Button asChild className="gap-2">
              <Link to={dashboardPath}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
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
        <div className="md:hidden border-t bg-background px-4 pb-4 pt-2 space-y-2">
          <Link
            to="/"
            hash="features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
          >
            Features
          </Link>
          <Link
            to="/"
            hash="highlights"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
          >
            Highlights
          </Link>
          <Link
            to="/"
            hash="about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
          >
            About
          </Link>
          <Link
            to="/news"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
          >
            News
          </Link>
          <Link
            to="/"
            hash="contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
          >
            Contact
          </Link>
          <div className="flex gap-2 pt-2 border-t">
            {user && dashboardPath ? (
              <Button className="flex-1 gap-2" asChild>
                <Link to={dashboardPath}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

