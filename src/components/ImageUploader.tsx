import { useState, useRef, useCallback } from 'react'
import { Star, Trash2, ImagePlus } from 'lucide-react'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import { compressImage } from '@/lib/storage'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const { t } = useLocale()
  const [isDragging, setIsDragging] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (fileArray.length === 0) return

      const remaining = maxImages - images.length
      const toProcess = fileArray.slice(0, remaining)

      setCompressing(true)
      try {
        const compressed = await Promise.all(toProcess.map((f) => compressImage(f)))
        const dataUrls = await Promise.all(
          compressed.map(
            (file) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(file)
              })
          )
        )
        onChange([...images, ...dataUrls])
      } catch (error) {
        console.error('Failed to process images:', error)
      } finally {
        setCompressing(false)
      }
    },
    [images, maxImages, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDelete = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)
    },
    [images, onChange]
  )

  const handleSetCover = useCallback(
    (index: number) => {
      const newImages = [...images]
      const [removed] = newImages.splice(index, 1)
      newImages.unshift(removed)
      onChange(newImages)
    },
    [images, onChange]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles]
  )

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all',
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2 text-center">
          {compressing ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.publish.compressing}</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <ImagePlus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.publish.dragDrop}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.publish.orClick}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t.publish.maxImages}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <img
                src={img}
                alt={`Property image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {index !== 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetCover(index)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-amber-500 hover:bg-white"
                    title={t.publish.setCover}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(index)
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 hover:bg-white"
                  title={t.publish.deleteImage}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {/* Cover badge */}
              {index === 0 && (
                <div className="absolute left-2 top-2">
                  <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Star className="h-3 w-3 fill-current" />
                    {t.publish.coverImage}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
