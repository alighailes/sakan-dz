import { useState } from 'react'
import { Info, X, CheckCircle, XCircle } from 'lucide-react'
import { useLocale } from '@/i18n'
import { getLegalStatusInfo } from '@/lib/legalStatusHelper'
import { cn } from '@/lib/utils'
import type { LegalStatus } from '@/types'

interface LegalStatusBadgeProps {
  status: LegalStatus
  size?: 'sm' | 'md'
  showInfo?: boolean
}

const colorMap = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  amber: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
}

const dotColorMap = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
}

export function LegalStatusBadge({ status, size = 'sm', showInfo = true }: LegalStatusBadgeProps) {
  const { locale } = useLocale()
  const [showModal, setShowModal] = useState(false)
  const info = getLegalStatusInfo(status)

  const label = locale === 'ar' ? info.labelAr : info.labelFr

  return (
    <>
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border font-medium',
          colorMap[info.badgeColor],
          size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-sm'
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColorMap[info.badgeColor])} />
        <span>{label}</span>
        {showInfo && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowModal(true)
            }}
            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="More info"
          >
            <Info className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Info Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', dotColorMap[info.badgeColor])} />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{label}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {locale === 'ar' ? info.descriptionAr : info.descriptionFr}
            </p>

            {/* Bank Loan Eligibility */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
              {info.eligibleForBankLoan ? (
                <>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {locale === 'ar' ? 'يقبل القرض البنكي' : 'Éligible crédit bancaire'}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 flex-shrink-0 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {locale === 'ar' ? 'لا يقبل القرض البنكي' : 'Non éligible crédit bancaire'}
                  </span>
                </>
              )}
            </div>

            {/* Risk Level */}
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{locale === 'ar' ? 'مستوى المخاطر' : 'Niveau de risque'}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-medium',
                  info.riskLevel === 'low' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                  info.riskLevel === 'medium' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                  info.riskLevel === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}
              >
                {info.riskLevel === 'low'
                  ? (locale === 'ar' ? 'منخفض' : 'Faible')
                  : info.riskLevel === 'medium'
                    ? (locale === 'ar' ? 'متوسط' : 'Moyen')
                    : (locale === 'ar' ? 'مرتفع' : 'Élevé')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
