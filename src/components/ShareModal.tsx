import { useState } from 'react'
import { X, Copy, Check, Share2, MessageCircle, Send, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Property } from '@/types'
import { formatPrice } from '@/lib/utils'
import { StoryGenerator } from '@/components/StoryGenerator'

interface ShareModalProps {
  property: Property
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ property, isOpen, onClose }: ShareModalProps) {
  const { t } = useLocale()
  const [copied, setCopied] = useState(false)
  const [showStoryGenerator, setShowStoryGenerator] = useState(false)

  if (!isOpen) return null

  const shareUrl = `${window.location.origin}/property/${property.id}`
  const priceLabel = property.operationType === 'vacation' && property.pricePerNight
    ? `${formatPrice(property.pricePerNight, property.currency)} ${t.property.perNight}`
    : property.operationType === 'rent'
      ? `${formatPrice(property.price, property.currency)} ${t.property.perMonth}`
      : formatPrice(property.price, property.currency)

  const shareText = `${property.title} - ${priceLabel} | Sakan DZ`

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: shareText,
          url: shareUrl,
        })
      } catch {
        // User cancelled or share failed
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const handleShareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank'
    )
  }

  const handleShareToTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    )
  }

  const handleShareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-lg dark:bg-gray-900 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t.share.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {property.title}
          </p>
        </div>

        {/* Native share (mobile) */}
        {canNativeShare && (
          <Button
            className="mb-4 w-full gap-2"
            onClick={handleNativeShare}
          >
            <Share2 className="h-4 w-4" />
            {t.property.share}
          </Button>
        )}

        {/* Share options */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className={cn(copied && 'text-green-600 dark:text-green-400')}>
              {copied ? t.share.linkCopied : t.share.copyLink}
            </span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleShareToWhatsApp}
          >
            <MessageCircle className="h-4 w-4 text-green-500" />
            {t.share.shareOnWhatsApp}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleShareToTelegram}
          >
            <Send className="h-4 w-4 text-blue-500" />
            {t.share.shareOnTelegram}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleShareToFacebook}
          >
            <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {t.share.shareOnFacebook}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleShareToTwitter}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {t.share.shareOnTwitter}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => setShowStoryGenerator(true)}
          >
            <ImageIcon className="h-4 w-4 text-pink-500" />
            {t.share.generateStory}
          </Button>
        </div>
      </div>

      {/* Story Generator Modal */}
      <StoryGenerator
        property={property}
        isOpen={showStoryGenerator}
        onClose={() => setShowStoryGenerator(false)}
      />
    </div>
  )
}
