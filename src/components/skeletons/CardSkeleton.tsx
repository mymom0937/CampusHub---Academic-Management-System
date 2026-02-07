import { cn } from '@/lib/utils'

interface CardSkeletonProps {
  className?: string
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 shadow-sm',
        className
      )}
    >
      <div className="space-y-3">
        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
        <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}

interface StatsSkeletonProps {
  count?: number
  className?: string
}

export function StatsSkeleton({ count = 4, className }: StatsSkeletonProps) {
  return (
    <div
      className={cn(
        'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
