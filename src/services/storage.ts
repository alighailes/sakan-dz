import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const BUCKET_NAME = 'property-images'

/**
 * Compress image file before upload
 */
async function compressImage(file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      let { width, height } = img

      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/webp',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        'image/webp',
        quality
      )
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Upload property images to Supabase Storage
 */
export async function uploadPropertyImages(files: File[], userId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }

  const uploadedUrls: string[] = []

  for (const file of files) {
    try {
      // Compress image
      const compressedFile = await compressImage(file)

      // Generate unique path
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const path = `${userId}/${Date.now()}-${sanitizedName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path)

      uploadedUrls.push(publicUrl)
    } catch (err) {
      console.error(`Failed to upload ${file.name}:`, err)
      throw err
    }
  }

  return uploadedUrls
}

/**
 * Delete property images from Supabase Storage
 */
export async function deletePropertyImages(urls: string[]): Promise<void> {
  if (!isSupabaseConfigured()) return

  try {
    // Extract paths from URLs
    const paths = urls.map(url => {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.indexOf(BUCKET_NAME)
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/')
      }
      return ''
    }).filter(Boolean)

    if (paths.length > 0) {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(paths)

      if (error) {
        console.error('Error deleting images:', error)
      }
    }
  } catch (err) {
    console.error('Error deleting images:', err)
  }
}

/**
 * Get signed URL for private image access (if bucket is private)
 */
export async function getSignedImageUrl(path: string, expiresIn = 3600): Promise<string | null> {
  if (!isSupabaseConfigured()) return null

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }

  return data.signedUrl
}