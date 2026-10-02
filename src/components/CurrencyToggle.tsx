import { Coins, Banknote } from 'lucide-react'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'

export function CurrencyToggle() {
  const { mode, toggleMode } = useCurrencyStore()
  const { t } = useLocale()

  return (
    <button
      onClick={toggleMode}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
        mode === 'dzd'
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      )}
      title={mode === 'dzd' ? 'Switch to Centimes' : 'Switch to DZD'}
    >
      {mode === 'dzd' ? (
        <>
          <Banknote className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">DZD</span>
        </>
      ) : (
        <>
          <Coins className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t.common.currency}</span>
        </>
      )}
    </button>
  )
}
