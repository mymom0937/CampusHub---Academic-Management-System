/**
 * Renders announcement media (IMAGE, VIDEO, AUDIO).
 * Display-only component — no upload or Cloudinary logic.
 * Used by news feed and admin detail view.
 */

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl)
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.replace('/', '')
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    return null
  } catch {
    return null
  }
}

export interface AnnouncementMediaProps {
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO'
  mediaUrl?: string | null
  title: string
  className?: string
}

export function AnnouncementMedia({
  mediaType,
  mediaUrl,
  title,
  className = '',
}: AnnouncementMediaProps) {
  if (!mediaUrl || !mediaType || mediaType === 'TEXT') return null

  if (mediaType === 'IMAGE') {
    return (
      <div className={`mt-2 ${className}`}>
        <img
          src={mediaUrl}
          alt={title}
          className="max-w-full max-h-80 rounded-md border object-contain"
        />
      </div>
    )
  }

  if (mediaType === 'VIDEO') {
    const embed = getYouTubeEmbedUrl(mediaUrl)
    if (embed) {
      return (
        <div className={`mt-2 aspect-video w-full overflow-hidden rounded-md border bg-black ${className}`}>
          <iframe
            src={embed}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    return (
      <div className={`mt-2 ${className}`}>
        <video
          controls
          className="w-full max-h-80 rounded-md border bg-black"
          src={mediaUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  if (mediaType === 'AUDIO') {
    return (
      <div className={`mt-2 ${className}`}>
        <audio controls className="w-full">
          <source src={mediaUrl} />
          Your browser does not support the audio element.
        </audio>
      </div>
    )
  }

  return null
}
