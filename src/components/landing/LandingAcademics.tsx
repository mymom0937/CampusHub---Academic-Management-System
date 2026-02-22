import { BookOpen, GraduationCap, Users, BarChart3 } from 'lucide-react'

const programs = [
  {
    icon: BookOpen,
    title: 'Course Catalog',
    description: 'Browse and enroll in courses across disciplines.',
  },
  {
    icon: GraduationCap,
    title: 'Student Portal',
    description: 'Track grades, GPA, and your academic transcript.',
  },
  {
    icon: Users,
    title: 'Instructor Tools',
    description: 'Manage rosters and submit grades efficiently.',
  },
  {
    icon: BarChart3,
    title: 'Admin Dashboard',
    description: 'Oversee semesters, courses, and users.',
  },
]

export function LandingAcademics() {
  return (
    <section id="academics" className="py-16 md:py-24 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Academics</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Programs &amp; Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete platform for managing academic workflows from enrollment to graduation.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((p, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
