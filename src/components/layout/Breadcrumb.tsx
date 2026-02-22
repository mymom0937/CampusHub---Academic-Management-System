import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex flex-wrap items-center gap-y-1 gap-x-1 text-sm text-muted-foreground mb-4 min-w-0', className)}
    >
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {item.href && index < items.length - 1 ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(index === items.length - 1 && 'text-foreground font-medium')}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
