import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** When true, opens in new tab with security attributes (default: true for href) */
  openInNewTab?: boolean
}

/**
 * Anchor for external URLs (https, mailto). Use Link from TanStack Router for internal routes.
 * Automatically adds target="_blank" and rel="noopener noreferrer" for http(s) URLs.
 */
export const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  ({ href, openInNewTab = true, className, children, ...props }, ref) => {
    const isHttp = href?.startsWith('http://') || href?.startsWith('https://')
    const isMailto = href?.startsWith('mailto:')
    const isExternal = isHttp || isMailto
    const shouldOpenNewTab = openInNewTab && isExternal

    return (
      <a
        ref={ref}
        href={href}
        target={shouldOpenNewTab ? '_blank' : undefined}
        rel={shouldOpenNewTab ? 'noopener noreferrer' : undefined}
        className={cn('text-muted-foreground hover:text-foreground transition-colors', className)}
        {...props}
      >
        {children}
      </a>
    )
  }
)

ExternalLink.displayName = 'ExternalLink'
