import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import type { PriceBenchmark } from '@/types'

interface PriceBenchmarkBadgeProps {
  benchmark: PriceBenchmark
  className?: string
}

export function PriceBenchmarkBadge({ benchmark, className }: PriceBenchmarkBadgeProps) {
  const { locale } = useLocale()

  const config = {
    very_good: {
      icon: TrendingDown,
      labelFr: 'Très bon prix',
      labelAr: 'سعر مناسب جداً',
      classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    fair: {
      icon: Minus,
      labelFr: 'Prix dans la moyenne',
      labelAr: 'سعر عادل ومتوسط',
      classes: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    },
    premium: {
      icon: TrendingUp,
      labelFr: 'Haut de gamme',
      labelAr: 'عقار فاخر',
      classes: 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300',
    },
  }

  const { icon: Icon, labelFr, labelAr, classes } = config[benchmark]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        classes,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {locale === 'ar' ? labelAr : labelFr}
    </span>
  )
}
