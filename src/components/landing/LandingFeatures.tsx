import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Shield,
  Users,
} from 'lucide-react'

const features = [
  {
    icon: <LayoutDashboard className="h-6 w-6" />,
    title: 'Role-Based Dashboards',
    description:
      'Dedicated, secure dashboards for admins, instructors, and students, aligned with real university workflows.',
  },
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: 'Student Portal',
    description:
      'Browse the course catalog, enroll and drop within rules, and track grades, GPA, and transcript in one place.',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Admin Control Center',
    description:
      'Manage semesters, courses, and users, assign instructors, and control the academic system from a single pane.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Instructor Tools',
    description:
      'View assigned courses, see enrolled students, and submit or update grades with a clear, guided workflow.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Grading & GPA Engine',
    description:
      '4.0 GPA scale, grade points, and academic standing calculations that mirror real institutional policies.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure SaaS Architecture',
    description:
      'Better-Auth sessions, RBAC-protected routes, and Prisma-backed PostgreSQL for production-ready reliability.',
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 md:py-28 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete platform designed for students, instructors, and administrators.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

