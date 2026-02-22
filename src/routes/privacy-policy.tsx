import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { getSession } from '@/server/actions/auth.actions'
import { ROLE_DASHBOARD_PATHS } from '@/types/roles'
import type { SessionUser } from '@/types/dto'

export const Route = createFileRoute('/privacy-policy')({
  beforeLoad: async () => {
    const user = await getSession()
    return { user }
  },
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
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

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">
          Last updated: {new Date().toLocaleDateString('en-US')}
        </p>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Overview</h2>
            <p>
              CampusHub (&quot;we&quot;, &quot;our&quot;) is an academic management platform for universities and colleges.
              This policy describes how we collect, use, and protect your personal data when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Data We Collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account data:</strong> Email, name, password (hashed), role (Admin, Instructor, Student)</li>
              <li><strong>Academic data:</strong> Enrollments, grades, GPA, transcripts</li>
              <li><strong>Session data:</strong> IP address, user agent, session tokens (stored server-side)</li>
              <li><strong>Usage data:</strong> Actions within the platform for operational and security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. How We Use Your Data</h2>
            <p>
              We use your data to provide the platform (enrollment, grading, dashboards), authenticate users,
              enforce role-based access, send password reset emails, and improve security. We do not sell your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Data Storage & Security</h2>
            <p>
              Data is stored in PostgreSQL (Neon) and media files in Cloudinary. We use bcrypt for password hashing,
              HTTPS in production, and server-side session validation. Access is restricted by role (RBAC).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Neon:</strong> Database hosting</li>
              <li><strong>Cloudinary:</strong> Image and video storage for announcements</li>
              <li><strong>Email provider:</strong> Password reset and transactional emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Your Rights</h2>
            <p>
              You may request access, correction, or deletion of your data. Contact your institution administrator
              or our support team. Account deactivation is available to admins.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Contact</h2>
            <p>
              For privacy questions, contact <a href="mailto:support@campushub.com" className="text-primary underline">support@campushub.com</a>.
            </p>
          </section>
        </article>

        <div className="mt-12 pt-8 border-t">
          <Link to="/terms-of-service" className="text-sm text-primary hover:underline">
            View Terms of Service →
          </Link>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}
