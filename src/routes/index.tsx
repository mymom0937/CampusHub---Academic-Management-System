import { createFileRoute } from '@tanstack/react-router'

import { LandingAbout } from '@/components/landing/LandingAbout'
import { LandingAcademics } from '@/components/landing/LandingAcademics'
import { LandingCampusLife } from '@/components/landing/LandingCampusLife'
import { LandingContact } from '@/components/landing/LandingContact'
import { LandingCta } from '@/components/landing/LandingCta'
import { LandingExploreCampuses } from '@/components/landing/LandingExploreCampuses'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingImpactNumbers } from '@/components/landing/LandingImpactNumbers'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingNewsletter } from '@/components/landing/LandingNewsletter'
import { LandingWhatsNew } from '@/components/landing/LandingWhatsNew'
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
      <LandingImpactNumbers />
      <LandingCampusLife />
      <LandingWhatsNew />
      <LandingExploreCampuses />
      <LandingNewsletter />
      <LandingAcademics />
      <LandingCta user={user} dashboardPath={dashboardPath} />
      <LandingAbout />
      <LandingContact />
      <LandingFooter />
    </div>
  )
}
