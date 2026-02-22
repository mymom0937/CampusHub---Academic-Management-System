import { createFileRoute } from '@tanstack/react-router'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth'
import { uploadToCloudinary, type UploadResourceType } from '@/lib/cloudinary'

const MAX_FILE_SIZE = 150 * 1024 * 1024 // 150MB for video
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export const Route = createFileRoute('/api/upload/file')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const session = await auth.api.getSession({ headers: getRequestHeaders() })
          if (!session?.user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const user = session.user as { role?: string }
          if (user.role !== 'ADMIN') {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const formData = await request.formData()
          const file = formData.get('file') as File | null
          const resourceType = (formData.get('resourceType') as UploadResourceType) || 'auto'

          if (!file || !(file instanceof File)) {
            return new Response(
              JSON.stringify({ error: 'No file provided' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
          }

          if (file.size > MAX_FILE_SIZE) {
            return new Response(
              JSON.stringify({ error: 'File too large (max 150MB)' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
          }

          const type = resourceType === 'video' ? 'video' : 'image'
          const allowed = type === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES
          if (!allowed.includes(file.type)) {
            return new Response(
              JSON.stringify({
                error: `Invalid file type. Allowed: ${allowed.join(', ')}`,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
          }

          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          const url = await uploadToCloudinary(buffer, {
            resourceType: type,
            folder: 'campushub/announcements',
          })

          if (!url) {
            return new Response(
              JSON.stringify({ error: 'Upload failed. Check Cloudinary configuration.' }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
          }

          return new Response(JSON.stringify({ url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          console.error('[Upload]', err)
          return new Response(
            JSON.stringify({ error: 'Upload failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },
    },
  },
})
