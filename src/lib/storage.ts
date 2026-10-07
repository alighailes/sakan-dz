import imageCompression from 'browser-image-compression'
import { supabase, isSupabaseConfigured } from './supabase'

const BUCKET_NAME = 'property-images'
const MAX_WIDTH = 1600
const MAX_SIZE_MB = 0.8 // ~800KB

/**
 * Compress an image file using browser-image-compression.
 * Targets max 1600px dimensions, ~800KB file size, WebP format.
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.warn('Image compression failed, using original:', error)
    return file
  }
}

/**
 * Upload property images to Supabase Storage.
 * When Supabase is configured: uploads to public bucket and returns public URLs.
 * When in mock mode: converts files to Base64 data URLs for offline testing.
 */
export async function uploadPropertyImages(
  files: File[],
  propertyId: string
): Promise<string[]> {
  if (files.length === 0) return []

  // Compress all images first
  const compressedFiles = await Promise.all(files.map((f) => compressImage(f)))

  if (isSupabaseConfigured()) {
    return uploadToSupabase(compressedFiles, propertyId)
  }

  // Mock mode: convert to Base64 data URLs
  return convertToBase64(compressedFiles)
}

/**
 * Upload images to Supabase Storage public bucket.
 */
async function uploadToSupabase(files: File[], propertyId: string): Promise<string[]> {
  const urls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileExt = file.name.split('.').pop() || 'webp'
    const fileName = `${propertyId}/${Date.now()}_${i}.${fileExt}`

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload failed:', error)
      throw new Error(`Failed to upload image ${i + 1}: ${error.message}`)
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    if (urlData?.publicUrl) {
      urls.push(urlData.publicUrl)
    }
  }

  return urls
}

/**
 * Convert files to Base64 data URLs for mock mode.
 */
function convertToBase64(files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
    )
  )
}

/**
 * Delete images from Supabase Storage.
 */
export async function deletePropertyImages(urls: string[]): Promise<void> {
  if (!isSupabaseConfigured() || urls.length === 0) return

  const filePaths = urls
    .map((url) => {
      const match = url.match(/property-images\/(.+)$/)
      return match?.[1]
    })
    .filter(Boolean) as string[]

  if (filePaths.length === 0) return

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(filePaths)

  if (error) {
    console.error('Failed to delete images:', error)
  }
}
