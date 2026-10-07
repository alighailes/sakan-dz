import { useState, useRef, useCallback } from 'react'
import { Download, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { formatDZD, formatCentimes } from '@/lib/currencyUtils'
import { useCurrencyStore } from '@/stores/currencyStore'
import { WILAYAS } from '@/constants'
import type { Property } from '@/types'
import QRCode from 'qrcode'

interface StoryGeneratorProps {
  property: Property
  isOpen: boolean
  onClose: () => void
}

export function StoryGenerator({ property, isOpen, onClose }: StoryGeneratorProps) {
  const { locale } = useLocale()
  const { mode } = useCurrencyStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const shareUrl = `${window.location.origin}/property/${property.id}`
  const wilaya = WILAYAS.find((w) => w.id === property.wilayaId)

  const generateStory = useCallback(async () => {
    setGenerating(true)
    try {
      // Generate QR code
      const qrUrl = await QRCode.toDataURL(shareUrl, { width: 200, margin: 2 })
      setQrDataUrl(qrUrl)

      // Wait for QR to render
      await new Promise((r) => setTimeout(r, 100))

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 9:16 aspect ratio (Instagram Story)
      canvas.width = 1080
      canvas.height = 1920

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920)
      gradient.addColorStop(0, '#059669')
      gradient.addColorStop(0.3, '#0f172a')
      gradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1080, 1920)

      // Header branding
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 72px Inter, sans-serif'
      ctx.fillText('Sakan DZ', 60, 120)
      ctx.font = '36px Inter, sans-serif'
      ctx.fillStyle = '#94a3b8'
      ctx.fillText('دارنا | Plateforme Immobilière', 60, 180)

      // Wilaya badge
      ctx.fillStyle = '#059669'
      ctx.beginPath()
      ctx.roundRect(60, 220, 300, 60, 30)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px Inter, sans-serif'
      ctx.fillText(wilaya?.name || '', 90, 265)

      // Property image (placeholder area)
      ctx.fillStyle = '#1e293b'
      ctx.beginPath()
      ctx.roundRect(60, 320, 960, 540, 20)
      ctx.fill()

      // Try to load and draw the actual image
      try {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.src = property.images[0]
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          setTimeout(reject, 5000)
        })
        // Draw image cover-fit
        const imgRatio = img.width / img.height
        const boxRatio = 960 / 540
        let drawW, drawH, drawX, drawY
        if (imgRatio > boxRatio) {
          drawH = 540
          drawW = 540 * imgRatio
          drawX = 60 - (drawW - 960) / 2
          drawY = 320
        } else {
          drawW = 960
          drawH = 960 / imgRatio
          drawX = 60
          drawY = 320 - (drawH - 540) / 2
        }
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(60, 320, 960, 540, 20)
        ctx.clip()
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
        ctx.restore()
      } catch {
        // Draw placeholder text
        ctx.fillStyle = '#64748b'
        ctx.font = '48px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Property Image', 540, 600)
        ctx.textAlign = 'left'
      }

      // Price section
      ctx.fillStyle = '#059669'
      ctx.beginPath()
      ctx.roundRect(60, 900, 960, 120, 20)
      ctx.fill()

      const priceText = property.operationType === 'vacation' && property.pricePerNight
        ? formatDZD(property.pricePerNight, property.currency)
        : formatDZD(property.price, property.currency)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 56px Inter, sans-serif'
      ctx.fillText(priceText, 90, 975)

      if (mode === 'centimes') {
        ctx.font = '28px Inter, sans-serif'
        ctx.fillStyle = '#d1fae5'
        ctx.fillText(formatCentimes(property.price, locale), 90, 1010)
      }

      // Property specs
      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 40px Inter, sans-serif'
      const specs = [
        `${property.bedrooms} ${locale === 'ar' ? 'غرف' : 'Ch.'}`,
        `${property.bathrooms} ${locale === 'ar' ? 'حمام' : 'Sdb'}`,
        `${property.area} m²`,
      ].join('  •  ')
      ctx.fillText(specs, 60, 1100)

      // Title
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 44px Inter, sans-serif'
      const title = property.title.length > 40 ? property.title.slice(0, 40) + '...' : property.title
      ctx.fillText(title, 60, 1170)

      // Amenities
      ctx.fillStyle = '#94a3b8'
      ctx.font = '32px Inter, sans-serif'
      const amenities = []
      if (property.waterAvailability === '24_7') amenities.push(locale === 'ar' ? 'ماء 24/24' : 'Eau 24/7')
      if (property.gasType === 'city_gas') amenities.push(locale === 'ar' ? 'غاز المدينة' : 'Gaz de ville')
      if (property.hasElevator) amenities.push(locale === 'ar' ? 'مصعد' : 'Ascenseur')
      if (amenities.length > 0) {
        ctx.fillText(amenities.join('  •  '), 60, 1230)
      }

      // QR Code
      if (qrDataUrl) {
        const qrImg = new window.Image()
        qrImg.src = qrDataUrl
        await new Promise((resolve) => {
          qrImg.onload = resolve
        })
        // White background for QR
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.roundRect(60, 1300, 300, 300, 20)
        ctx.fill()
        ctx.drawImage(qrImg, 80, 1320, 260, 260)
      }

      // Scan text
      ctx.fillStyle = '#94a3b8'
      ctx.font = '28px Inter, sans-serif'
      ctx.fillText(locale === 'ar' ? 'امسح للعرض' : 'Scannez pour voir', 60, 1650)

      // Footer
      ctx.fillStyle = '#64748b'
      ctx.font = '24px Inter, sans-serif'
      ctx.fillText('sakandz.com', 60, 1850)

    } catch (error) {
      console.error('Failed to generate story:', error)
    } finally {
      setGenerating(false)
    }
  }, [property, shareUrl, wilaya, mode, locale, qrDataUrl])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `sakan-dz-story-${property.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [property.id])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-soft-lg dark:bg-gray-900 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>

        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          {locale === 'ar' ? 'تصميم ستوري' : 'Générer Story'}
        </h2>

        <canvas
          ref={canvasRef}
          className="mb-4 hidden"
          width={1080}
          height={1920}
        />

        <div className="space-y-3">
          <Button
            className="w-full gap-2"
            onClick={generateStory}
            disabled={generating}
          >
            <ImageIcon className="h-4 w-4" />
            {generating
              ? (locale === 'ar' ? 'جاري التصميم...' : 'Génération...')
              : (locale === 'ar' ? 'تصميم الستوري' : 'Générer le Story')}
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleDownload}
            disabled={generating}
          >
            <Download className="h-4 w-4" />
            {locale === 'ar' ? 'تحميل الصورة (PNG)' : 'Télécharger (PNG)'}
          </Button>
        </div>

        <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
          {locale === 'ar'
            ? 'صورة 9:16 جاهزة للنشر على إنستغرام وفيسبوك'
            : 'Image 9:16 prête pour Instagram et Facebook'}
        </p>
      </div>
    </div>
  )
}
