import { Link } from '@tanstack/react-router'
import { ArrowRight, LayoutDashboard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { SessionUser } from '@/types/dto'

type LandingCtaProps = {
  user: SessionUser | null
  dashboardPath: string | null
}

export function LandingCta({ user, dashboardPath }: LandingCtaProps) {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="rounded-2xl bg-linear-to-br from-primary/10 via-violet-500/10 to-purple-500/10 border p-10 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Create your free account and explore the full platform. No credit card required.
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
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="text-base px-8 h-12">
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

