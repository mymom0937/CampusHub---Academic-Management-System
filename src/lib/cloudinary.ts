import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
}

export type UploadResourceType = 'image' | 'video' | 'raw'

/** Upload a file buffer to Cloudinary. Returns secure URL or null if not configured. */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    resourceType?: UploadResourceType
    folder?: string
    publicId?: string
  } = {}
): Promise<string | null> {
  if (!cloudName || !apiKey || !apiSecret) {
    return null
  }

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: options.resourceType ?? 'auto',
            folder: options.folder ?? 'campushub/announcements',
            public_id: options.publicId,
          },
          (err, res) => {
            if (err) reject(err)
            else if (res) resolve(res)
            else reject(new Error('Upload failed'))
          }
        )
        .end(buffer)
    })

    return result.secure_url
  } catch {
    return null
  }
}

/** Check if Cloudinary is configured */
export function isCloudinaryConfigured(): boolean {
  return !!(cloudName && apiKey && apiSecret)
}
