import { Link } from '@tanstack/react-router'
import { Code2, Globe, GraduationCap, Mail } from 'lucide-react'
import { ExternalLink } from '@/components/ui/external-link'
import { GITHUB_URL, SUPPORT_EMAIL } from '@/lib/constants'

export function LandingFooter() {
  return (
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
              A full-stack academic management SaaS for universities and colleges, built to mirror real campus workflows.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  hash="features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
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
                <Link
                  to="/"
                  hash="about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  hash="highlights"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Highlights
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  News &amp; updates
                </Link>
              </li>
              <li>
                <ExternalLink href={GITHUB_URL} className="text-sm">
                  GitHub
                </ExternalLink>
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
            <ExternalLink href={GITHUB_URL} aria-label="GitHub">
              <Code2 className="h-5 w-5" />
            </ExternalLink>
            <ExternalLink
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SUPPORT_EMAIL)}`}
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </ExternalLink>
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Website"
            >
              <Globe className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

