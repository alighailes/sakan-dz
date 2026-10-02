import { Droplets, Flame, Zap, Building2 } from 'lucide-react'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Property } from '@/types'

interface AmenityBadgesProps {
  property: Property
  compact?: boolean
}

export function AmenityBadges({ property, compact = false }: AmenityBadgesProps) {
  const { locale } = useLocale()

  const waterLabels: Record<string, { fr: string; ar: string }> = {
    '24_7': { fr: 'Eau 24/7', ar: 'ماء 24/24' },
    tank_bache: { fr: 'Bâche d\'eau', ar: 'خزان مياه' },
    schedule: { fr: 'Eau horaire', ar: 'ماء متقطع' },
    intermittent: { fr: 'Eau intermittente', ar: 'ماء متقطع' },
  }

  const gasLabels: Record<string, { fr: string; ar: string }> = {
    city_gas: { fr: 'Gaz de ville', ar: 'غاز المدينة' },
    butane_bottles: { fr: 'Bouteilles de butane', ar: 'قنينة غاز' },
    none: { fr: 'Pas de gaz', ar: 'لا غاز' },
  }

  const badges = []

  if (property.waterAvailability) {
    const label = waterLabels[property.waterAvailability]
    badges.push({
      icon: Droplets,
      label: locale === 'ar' ? label.ar : label.fr,
      color: 'text-sky-500',
    })
  }

  if (property.gasType) {
    const label = gasLabels[property.gasType]
    badges.push({
      icon: Flame,
      label: locale === 'ar' ? label.ar : label.fr,
      color: 'text-orange-500',
    })
  }

  if (property.hasElevator) {
    badges.push({
      icon: Building2,
      label: locale === 'ar' ? `مصعد - طابق ${property.floorNumber || property.floor || '?'}` : `Ascenseur - Étage ${property.floorNumber || property.floor || '?'}`,
      color: 'text-violet-500',
    })
  }

  if (property.wifiIncluded && property.operationType === 'colocation') {
    badges.push({
      icon: Zap,
      label: locale === 'ar' ? 'WiFi مجاني' : 'WiFi inclus',
      color: 'text-emerald-500',
    })
  }

  if (badges.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', compact && 'gap-1')}>
      {badges.map((badge, i) => (
        <span
          key={i}
          className={cn(
            'inline-flex items-center gap-1 rounded-full bg-zinc-100 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
          )}
        >
          <badge.icon className={cn('h-3 w-3', badge.color)} />
          {badge.label}
        </span>
      ))}
    </div>
  )
}
