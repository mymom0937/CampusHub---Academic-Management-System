import { Link } from '@tanstack/react-router'
import { ArrowRight, LayoutDashboard, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { SessionUser } from '@/types/dto'

type LandingHeroProps = {
  user: SessionUser | null
  dashboardPath: string | null
}

export function LandingHero({ user, dashboardPath }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-36 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="container mx-auto text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Full-stack SaaS · TanStack Start · Prisma · Better-Auth
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          Academic Management{' '}
          <span className="bg-linear-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Made Simple
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          CampusHub is a modern full-stack academic management system for universities and colleges.
          Students register for courses, instructors manage grades, and administrators control the academic
          system through secure, role-based dashboards.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user && dashboardPath ? (
            <Button size="lg" asChild className="text-base px-8 h-12 gap-2">
              <Link to={dashboardPath}>
                <LayoutDashboard className="h-5 w-5" />
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild className="text-base px-8 h-12 gap-2">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base px-8 h-12">
                <Link to="/login">Sign In to Dashboard</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

