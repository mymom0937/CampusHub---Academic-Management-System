import { useState } from 'react'
import { cn } from '@/lib/utils'

type ImgWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackClassName?: string
}

/** Renders img; on load error, hides img so parent background shows through */
export function ImgWithFallback({
  className,
  fallbackClassName,
  onError,
  ...props
}: ImgWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setFailed(true)
    onError?.(e)
  }

  if (failed) return null

  return (
    <img
      {...props}
      className={cn(className, failed && 'hidden')}
      onError={handleError}
    />
  )
}
