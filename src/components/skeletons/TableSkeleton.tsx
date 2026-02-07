import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  rows?: number
  cols?: number
  className?: string
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex gap-4 border-b pb-3 mb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="h-4 bg-muted animate-pulse rounded flex-1"
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`r-${rowIdx}`}
          className="flex gap-4 py-3 border-b border-muted/50"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={`c-${colIdx}`}
              className="h-4 bg-muted animate-pulse rounded flex-1"
              style={{ animationDelay: `${(rowIdx + colIdx) * 100}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
