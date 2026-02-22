import { createFileRoute } from '@tanstack/react-router'

import { LandingAbout } from '@/components/landing/LandingAbout'
import { LandingContact } from '@/components/landing/LandingContact'
import { LandingCta } from '@/components/landing/LandingCta'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingHighlights } from '@/components/landing/LandingHighlights'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingStats } from '@/components/landing/LandingStats'
import { getSession } from '@/server/actions/auth.actions'
import { ROLE_DASHBOARD_PATHS } from '@/types/roles'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = await getSession()
    return { user }
  },
  component: LandingPage,
})

function LandingPage() {
  const { user } = Route.useRouteContext() as { user: SessionUser | null }
  const dashboardPath = user ? ROLE_DASHBOARD_PATHS[user.role] : null

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar user={user} dashboardPath={dashboardPath} />
      <LandingHero user={user} dashboardPath={dashboardPath} />
      <LandingStats />
      <LandingFeatures />
      <LandingHighlights />
      <LandingCta user={user} dashboardPath={dashboardPath} />
      <LandingAbout />
      <LandingContact />
      <LandingFooter />
    </div>
  )
}
