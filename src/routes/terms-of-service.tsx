import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { getSession } from '@/server/actions/auth.actions'
import { ROLE_DASHBOARD_PATHS } from '@/types/roles'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/terms-of-service')({
  beforeLoad: async () => {
    const user = await getSession()
    return { user }
  },
  component: TermsOfServicePage,
})

function TermsOfServicePage() {
  const { user } = Route.useRouteContext() as { user: SessionUser | null }
  const dashboardPath = user ? ROLE_DASHBOARD_PATHS[user.role] : null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar user={user} dashboardPath={dashboardPath} />
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-10">
          Last updated: {new Date().toLocaleDateString('en-US')}
        </p>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance</h2>
            <p>
              By registering or using CampusHub, you agree to these Terms. If you use the platform on behalf of an
              institution, you represent that you have authority to bind that institution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Service Description</h2>
            <p>
              CampusHub provides academic management: course catalog, enrollment, grading, GPA calculation, transcripts,
              announcements, and role-based dashboards for Admins, Instructors, and Students.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Account & Eligibility</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must provide accurate registration data (email, name, password)</li>
              <li>Passwords must meet security requirements (8+ chars, uppercase, lowercase, number, special character)</li>
              <li>Default role is Student; Admin creates Instructor and Admin accounts</li>
              <li>You are responsible for keeping your credentials secure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Acceptable Use</h2>
            <p>
              You agree not to: share accounts, circumvent access controls, submit false data, attempt unauthorized
              access, or use the platform for illegal purposes. Violations may result in account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Academic Policies</h2>
            <p>
              Enrollment and grading follow institutional rules: enrollment windows, capacity limits, credit caps (e.g. 18/semester),
              and drop deadlines. Grades and transcripts are official records; tampering is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Intellectual Property</h2>
            <p>
              CampusHub software and branding are proprietary. Course content and academic data belong to the institution.
              You retain rights to your submissions; we require a license to operate the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Limitation of Liability</h2>
            <p>
              The service is provided &quot;as is&quot;. We are not liable for indirect, incidental, or consequential damages.
              Our liability is limited to the amount paid for the service in the preceding 12 months, if any.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Changes</h2>
            <p>
              We may update these Terms. Continued use after changes constitutes acceptance. Material changes will be
              communicated via email or in-app notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Contact</h2>
            <p>
              For questions: <a href="mailto:support@campushub.com" className="text-primary underline">support@campushub.com</a>.
            </p>
          </section>
        </article>

        <div className="mt-12 pt-8 border-t">
          <Link to="/privacy-policy" className="text-sm text-primary hover:underline">
            View Privacy Policy →
          </Link>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}
