/** Upload file to Cloudinary via API. Returns URL or null on failure. */
export async function uploadToCloudinary(
  file: File,
  resourceType: 'image' | 'video'
): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('resourceType', resourceType)

    const res = await fetch('/api/upload/file', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Upload failed')
    }

    const data = (await res.json()) as { url: string }
    return data.url ?? null
  } catch {
    return null
  }
}
