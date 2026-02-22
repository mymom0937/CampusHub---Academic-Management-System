import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Shield,
} from 'lucide-react'

const highlights = [
  'Enrollment rules with capacity checks, credit limits, and drop deadlines enforced at the data layer.',
  'Student self-service for browsing the active semester catalog, enrolling, dropping, and viewing history.',
  'Instructor workflows for managing rosters and submitting grades that roll directly into GPA calculations.',
  'Admin tools for creating semesters, configuring enrollment windows, and assigning instructors to courses.',
  'Production-ready UX: skeleton loading, empty states, toasts, and confirmation dialogs across the app.',
  'Clean service/repository architecture that showcases real-world academic and grading business logic.',
]

export function LandingHighlights() {
  return (
    <section id="highlights" className="py-20 md:py-28 px-4 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Highlights</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Real Academic Workflows
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Every feature is designed around actual university processes, from
              enrollment to graduation.
            </p>
            <ul className="space-y-3">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <ClipboardList className="h-8 w-8 text-blue-500" />
              <h4 className="font-semibold">Enrollment</h4>
              <p className="text-xs text-muted-foreground">Capacity management, waitlists, drop deadlines</p>
            </div>
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <BarChart3 className="h-8 w-8 text-violet-500" />
              <h4 className="font-semibold">Grading</h4>
              <p className="text-xs text-muted-foreground">Submit, update, bulk import grades with CSV</p>
            </div>
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <Calendar className="h-8 w-8 text-emerald-500" />
              <h4 className="font-semibold">Calendar</h4>
              <p className="text-xs text-muted-foreground">Academic calendar with semester timelines</p>
            </div>
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <Shield className="h-8 w-8 text-amber-500" />
              <h4 className="font-semibold">Security</h4>
              <p className="text-xs text-muted-foreground">RBAC, email verification, password reset</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

