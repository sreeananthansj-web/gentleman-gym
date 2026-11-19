import { requireSupabase } from './supabase'
import { ServiceError } from '../utils/errors'

export const BUCKETS = {
  trainers: 'trainer-images',
  gallery: 'gallery-images',
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** Client-side check (the bucket enforces the same limits on the server). Returns an error string or null. */
export function validateImageFile(file) {
  if (!file) return 'Please choose an image.'
  if (!ALLOWED_IMAGE_TYPES[file.type]) return 'Only JPEG, PNG or WebP images are allowed.'
  if (file.size > MAX_IMAGE_BYTES) return 'Images must be 5 MB or smaller.'
  if (file.size === 0) return 'That file is empty.'
  return null
}

/** Uploads an image and returns { path, url }. */
export async function uploadImage(bucket, file) {
  const problem = validateImageFile(file)
  if (problem) throw new Error(problem)

  const sb = requireSupabase()
  const extension = ALLOWED_IMAGE_TYPES[file.type]
  const path = `${crypto.randomUUID()}.${extension}`

  const { error } = await sb.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw new ServiceError(error, 'The image could not be uploaded.')

  const { data } = sb.storage.from(bucket).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

/** Best-effort removal; a failed cleanup should never block the admin's action. */
export async function removeImage(bucket, path) {
  if (!path) return
  try {
    const sb = requireSupabase()
    await sb.storage.from(bucket).remove([path])
  } catch {
    // Orphaned files are harmless; ignore.
  }
}
