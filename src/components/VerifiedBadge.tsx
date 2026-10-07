import { ShieldCheck } from 'lucide-react'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md'
  className?: string
}

export function VerifiedBadge({ size = 'sm', className }: VerifiedBadgeProps) {
  const { locale } = useLocale()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary-100 font-medium text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <ShieldCheck className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {locale === 'ar' ? 'موثّق رسمياً' : 'Vérifié'}
    </span>
  )
}
