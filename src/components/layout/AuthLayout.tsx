import { Link } from '@tanstack/react-router'
import { GraduationCap } from 'lucide-react'
import { AppFooter } from './AppFooter'

/** Auth pages layout: logo-only nav at top left, footer at bottom (evangadi-style) */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Nav: logo only at top left */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-foreground hover:opacity-90 transition-opacity"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">CampusHub</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  )
}
