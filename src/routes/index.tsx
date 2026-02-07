import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Github,
  Mail,
  Globe,
  ClipboardList,
  Calendar,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/theme/ModeToggle'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dashboardPath = user ? ROLE_DASHBOARD_PATHS[user.role] : null

  const features = [
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: 'Student Portal',
      description:
        'Browse courses, enroll, track grades, and view your academic transcript all in one place.',
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Course Management',
      description:
        'Comprehensive course catalog with real-time enrollment tracking and capacity management.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Instructor Tools',
      description:
        'Grade submission, student roster management, and course analytics for instructors.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'GPA & Analytics',
      description:
        'Automatic GPA calculation, academic standing tracking, and detailed performance insights.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Role-Based',
      description:
        'Role-based access control with secure authentication to protect academic data.',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Modern & Fast',
      description:
        'Built with cutting-edge technology for a seamless, responsive user experience.',
    },
  ]

  const stats = [
    { value: '3', label: 'User Roles' },
    { value: '100%', label: 'Type-Safe' },
    { value: 'Real-time', label: 'Updates' },
    { value: '24/7', label: 'Available' },
  ]

  const highlights = [
    'Enrollment with capacity & waitlist management',
    'Prerequisite checking & credit limit enforcement',
    'Bulk grade import via CSV',
    'Academic calendar with semester tracking',
    'Email notifications & announcements',
    'Dark mode & responsive design',
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* ───────────── Navbar ───────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl">CampusHub</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="flex items-center gap-1 max-md:hidden">
            <a href="#features" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
              Features
            </a>
            <a href="#highlights" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
              Highlights
            </a>
            <a href="#about" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
              About
            </a>
            <a href="#contact" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2 max-md:hidden">
            <ModeToggle />
            {user && dashboardPath ? (
              <Button asChild className="gap-2">
                <Link to={dashboardPath}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 pb-4 pt-2 space-y-2">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
            >
              Features
            </a>
            <a
              href="#highlights"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
            >
              Highlights
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
            >
              Contact
            </a>
            <div className="flex gap-2 pt-2 border-t">
              {user && dashboardPath ? (
                <Button className="flex-1 gap-2" asChild>
                  <Link to={dashboardPath}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden py-24 md:py-36 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-3xl" />
        </div>

        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Built with TanStack Start + Prisma + Better-Auth
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Academic Management{' '}
            <span className="bg-linear-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            CampusHub is a comprehensive academic management system for
            universities and colleges. Manage courses, enrollments, grades, and
            more -- all in one modern platform.
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

      {/* ───────────── Stats ───────────── */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Features ───────────── */}
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

      {/* ───────────── Highlights ───────────── */}
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

      {/* ───────────── CTA ───────────── */}
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

      {/* ───────────── About ───────────── */}
      <section id="about" className="py-16 px-4 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">About</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Built with Modern Tech</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            CampusHub is a full-stack SaaS application built with TanStack Start (React),
            Prisma ORM with PostgreSQL, Better-Auth for authentication, and shadcn/ui + Tailwind CSS
            for a polished user interface.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['TanStack Start', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'Better-Auth', 'Tailwind CSS', 'shadcn/ui', 'Resend'].map(
              (tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm font-medium"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ───────────── Contact ───────────── */}
      <section id="contact" className="py-20 md:py-28 px-4 scroll-mt-20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Contact</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have questions or feedback? We&apos;d love to hear from you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground">support@campushub.com</p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Website</h3>
              <p className="text-sm text-muted-foreground">www.campushub.com</p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                <Github className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">GitHub</h3>
              <p className="text-sm text-muted-foreground">Open Source on GitHub</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Footer ───────────── */}
      <footer className="border-t bg-background mt-auto">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">CampusHub</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A modern academic management system for universities and colleges.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Register
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#highlights" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Highlights
                  </a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li>
                  <span className="text-sm text-muted-foreground">Privacy Policy</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">Terms of Service</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">Cookie Policy</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CampusHub. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@campushub.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Website"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
