import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { DashboardFooter } from './DashboardFooter'
import { EmailVerificationBanner } from './EmailVerificationBanner'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/types/dto'

interface DashboardLayoutProps {
  user: SessionUser
  children: ReactNode
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="max-md:hidden">
        <Sidebar
          role={user.role}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 h-full">
            <Sidebar
              role={user.role}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content area - no overflow on wrapper so navbar sticky works */}
      <div
        className={cn(
          'min-w-0 transition-all duration-300 flex flex-col min-h-screen',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <Navbar
          user={user}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
        />
        {!user.emailVerified && <EmailVerificationBanner email={user.email} />}
        <main className="min-w-0 max-w-full flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </div>
  )
}
