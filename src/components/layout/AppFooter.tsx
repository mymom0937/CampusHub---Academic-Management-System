import { Link } from '@tanstack/react-router'
import { GraduationCap, Github, Mail, Facebook, Instagram } from 'lucide-react'
import { ExternalLink } from '@/components/ui/external-link'
import {
  GITHUB_URL,
  SUPPORT_EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  YOUTUBE_URL,
} from '@/lib/constants'

/** Evangadi-style footer: logo left, policy links center, social icons right. Used across all pages. */
export function AppFooter() {
  return (
    <footer className="border-t bg-background text-foreground mt-auto shrink-0">
      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 min-w-0">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-foreground hover:opacity-90 transition-opacity shrink-0"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">CampusHub</span>
          </Link>

          {/* Policy links */}
          <nav
            className="flex items-center divide-x-2 divide-border text-base"
            aria-label="Footer navigation"
          >
            <Link
              to="/"
              hash="about"
              className="pr-4 text-muted-foreground hover:text-foreground transition-colors font-nav"
            >
              About Us
            </Link>
            <Link
              to="/privacy-policy"
              className="px-4 text-muted-foreground hover:text-foreground transition-colors font-nav"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="pl-4 text-muted-foreground hover:text-foreground transition-colors font-nav"
            >
              Terms of Service
            </Link>
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-3 shrink-0">
            <ExternalLink
              href={FACEBOOK_URL}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </ExternalLink>
            <ExternalLink
              href={INSTAGRAM_URL}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </ExternalLink>
            <ExternalLink
              href={YOUTUBE_URL}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="YouTube"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </ExternalLink>
            <ExternalLink
              href={GITHUB_URL}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </ExternalLink>
            <ExternalLink
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </ExternalLink>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border/50">
          © {new Date().getFullYear()} CampusHub. All rights reserved.
          <ExternalLink
            href="https://www.linkedin.com/in/seid-endris-dev/"
            className="block mt-1 text-xs text-amber-500 hover:text-amber-400 hover:underline transition-colors duration-200 underline-offset-2"
            aria-label="Seid Endris on LinkedIn"
          >
            Built by Seid E.
          </ExternalLink>
        </p>
      </div>
    </footer>
  )
}
