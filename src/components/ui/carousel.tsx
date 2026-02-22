import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type CarouselProps = {
  children: React.ReactNode
  className?: string
  autoPlay?: boolean
  interval?: number
  showArrows?: boolean
  showDots?: boolean
  /** 'light' = white dots (for dark backgrounds), 'dark' = dark dots (for light backgrounds) */
  dotsVariant?: 'light' | 'dark'
}

export function Carousel({
  children,
  className,
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
  dotsVariant = 'light',
}: CarouselProps) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const items = React.Children.toArray(children)
  const count = items.length

  React.useEffect(() => {
    if (!autoPlay || count <= 1) return
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % count)
    }, interval)
    return () => clearInterval(id)
  }, [autoPlay, interval, count])

  const goTo = (index: number) => setActiveIndex((index + count) % count)

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <div
        className="flex w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {items.map((child, i) => (
          <div key={i} className="min-w-full w-full shrink-0">
            {child}
          </div>
        ))}
      </div>
      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      {showDots && count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                dotsVariant === 'light'
                  ? i === activeIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                  : i === activeIndex
                    ? 'w-6 bg-foreground'
                    : 'w-2 bg-foreground/50 hover:bg-foreground/70'
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
