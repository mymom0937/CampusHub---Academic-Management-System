import { Link } from '@tanstack/react-router'
import { GraduationCap, Github, Mail, Globe } from 'lucide-react'
import { ExternalLink } from '@/components/ui/external-link'
import { GITHUB_URL, SUPPORT_EMAIL } from '@/lib/constants'

export function DashboardFooter() {
  return (
    <footer className="border-t bg-background mt-auto shrink-0">
      <div className="px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold">CampusHub</span>
          </Link>
          <p className="text-sm text-muted-foreground order-last sm:order-none">
            &copy; {new Date().getFullYear()} CampusHub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <ExternalLink href={GITHUB_URL} aria-label="GitHub">
              <Github className="h-5 w-5" />
            </ExternalLink>
            <ExternalLink href={`mailto:${SUPPORT_EMAIL}`} openInNewTab={false} aria-label="Email">
              <Mail className="h-5 w-5" />
            </ExternalLink>
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Globe className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
