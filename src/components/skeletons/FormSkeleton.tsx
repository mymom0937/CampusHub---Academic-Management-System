import { cn } from '@/lib/utils'

interface FormSkeletonProps {
  fields?: number
  className?: string
}

export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div
            className="h-4 w-24 bg-muted animate-pulse rounded"
            style={{ animationDelay: `${i * 100}ms` }}
          />
          <div
            className="h-10 w-full bg-muted animate-pulse rounded"
            style={{ animationDelay: `${i * 100 + 50}ms` }}
          />
        </div>
      ))}
      <div className="h-10 w-32 bg-muted animate-pulse rounded mt-4" />
    </div>
  )
}
