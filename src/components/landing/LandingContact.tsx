import { Link } from '@tanstack/react-router'
import { Github, Globe, Mail } from 'lucide-react'
import { ExternalLink } from '@/components/ui/external-link'
import { GITHUB_URL, SUPPORT_EMAIL } from '@/lib/constants'

export function LandingContact() {
  return (
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
          <ExternalLink
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SUPPORT_EMAIL)}`}
            className="block rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-shadow hover:border-primary/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">{SUPPORT_EMAIL}</p>
          </ExternalLink>
          <Link
            to="/"
            className="block rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-shadow hover:border-primary/30 text-foreground"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">Website</h3>
            <p className="text-sm text-muted-foreground">www.campushub.com</p>
          </Link>
          <ExternalLink
            href={GITHUB_URL}
            className="block rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-shadow hover:border-primary/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
              <Github className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">GitHub</h3>
            <p className="text-sm text-muted-foreground">Open Source on GitHub</p>
          </ExternalLink>
        </div>
      </div>
    </section>
  )
}

