import { Crown } from 'lucide-react'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'

interface VipBadgeProps {
  size?: 'sm' | 'md'
  className?: string
}

export function VipBadge({ size = 'sm', className }: VipBadgeProps) {
  const { t } = useLocale()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500 font-bold text-white shadow-glow-accent',
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Crown className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {t.property.vip}
    </span>
  )
}
