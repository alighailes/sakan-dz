import { useState } from 'react'
import { X, Crown, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'

interface VipUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyTitle?: string
}

export function VipUpgradeModal({ isOpen, onClose, onConfirm, propertyTitle }: VipUpgradeModalProps) {
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onConfirm()
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

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
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t.myListings.vipUpgradeTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t.myListings.vipUpgradeDescription}
          </p>
          {propertyTitle && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
              {propertyTitle}
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t.myListings.vipBenefits}
          </h3>
          {[
            t.myListings.vipBenefit1,
            t.myListings.vipBenefit2,
            t.myListings.vipBenefit3,
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-center dark:from-amber-900/20 dark:to-yellow-900/20">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.myListings.vipPrice}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            7 jours de visibilité accrue
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t.myListings.vipUpgradeCancel}
          </Button>
          <Button
            className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t.myListings.vipUpgradeConfirm}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
