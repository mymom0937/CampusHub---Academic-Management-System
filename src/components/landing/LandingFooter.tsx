import { Link } from '@tanstack/react-router'
import { GraduationCap, Mail } from 'lucide-react'
import { ExternalLink } from '@/components/ui/external-link'
import { GITHUB_URL, SUPPORT_EMAIL } from '@/lib/constants'

export function LandingFooter() {
  return (
    <footer className="border-t bg-background text-foreground mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">CampusHub</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Academic management platform for universities and colleges.
            </p>
            <ul className="space-y-2 mt-4">
              <li>Stay In Touch</li>
              <li className="flex gap-2">
                <ExternalLink
                  href={GITHUB_URL}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </ExternalLink>
                <ExternalLink
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4 inline" />
                </ExternalLink>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  hash="academics"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Academics
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  News &amp; Media
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Student Portal
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

          {/* About */}
          <div>
            <h4 className="font-semibold text-sm mb-4">About CampusHub</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  hash="about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mission
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  hash="contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <ExternalLink
                  href={GITHUB_URL}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
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
                <Link
                  to="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-8">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} CampusHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
