import { Link } from 'react-router-dom'
import { Heart, BedDouble, Bath, MapPin, Eye, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { getOperationLabelFr, getPropertyTypeLabelFr } from '@/lib/utils'
import { formatPrice as formatPriceWithMode, getAlternativePrice } from '@/lib/currencyUtils'
import { WILAYAS } from '@/constants'
import { cn } from '@/lib/utils'
import { VipBadge } from '@/components/VipBadge'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { AmenityBadges } from '@/components/AmenityBadges'
import { PriceBenchmarkBadge } from '@/components/PriceBenchmarkBadge'
import { LegalStatusBadge } from '@/components/listings/LegalStatusBadge'
import { calculatePriceBenchmark } from '@/lib/priceBenchmark'
import { useProperties } from '@/hooks/useProperties'
import type { Property } from '@/types'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { locale, t } = useLocale()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { mode } = useCurrencyStore()
  const fav = isFavorite(property.id)
  const wilaya = WILAYAS.find((w) => w.id === property.wilayaId)
  const { properties: allProperties } = useProperties()

  const priceLabel = property.operationType === 'vacation' && property.pricePerNight
    ? formatPriceWithMode(property.pricePerNight, property.currency, mode, locale)
    : formatPriceWithMode(property.price, property.currency, mode, locale)

  const altPriceLabel = property.operationType === 'vacation' && property.pricePerNight
    ? getAlternativePrice(property.pricePerNight, property.currency, mode, locale)
    : getAlternativePrice(property.price, property.currency, mode, locale)

  const benchmark = calculatePriceBenchmark(property, allProperties)

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!property.ownerPhone) return
    const digits = property.ownerPhone.replace(/\D/g, '')
    const phone = digits.startsWith('0') && digits.length === 10
      ? `213${digits.slice(1)}`
      : digits
    const message = encodeURIComponent(
      locale === 'ar'
        ? `سلام عليكم، أنا مهتم بعقارك: ${property.title}`
        : `Bonjour, je suis intéressé par votre bien: ${property.title}`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1 dark:border-zinc-800/80 dark:bg-zinc-900">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {property.isFeatured && <VipBadge />}
          {property.isVerified && <VerifiedBadge />}
          <Badge variant="glass" className="text-[10px]">
            {getOperationLabelFr(property.operationType)}
          </Badge>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite(property.id)
          }}
          className={cn(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 active:scale-90',
            fav
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-white/80 text-zinc-600 hover:bg-white hover:text-red-500 dark:bg-zinc-900/80 dark:text-zinc-400'
          )}
        >
          <Heart className={cn('h-4 w-4 transition-transform duration-200', fav && 'fill-current scale-110')} />
        </button>

        {/* Price pill - bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="glass rounded-xl px-3 py-1.5">
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              {priceLabel}
            </p>
            {mode === 'dzd' && (
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{altPriceLabel}</p>
            )}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-black/30 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
            <Eye className="h-3 w-3" />
            {property.viewsCount}
          </div>
        </div>

        {/* Availability overlay */}
        {!property.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <Badge variant="destructive" className="text-sm">{t.property.unavailable}</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link to={`/property/${property.id}`} className="block">
          <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-primary-600 dark:text-zinc-100 dark:group-hover:text-primary-400">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary-500" />
          <span className="line-clamp-1">
            {wilaya ? (locale === 'ar' ? wilaya.nameAr : wilaya.name) : ''}
            {property.commune ? `, ${property.commune}` : ''}
          </span>
        </div>

        {/* Features */}
        <div className="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-primary-500" />
              <span>{property.bedrooms} {t.property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-primary-500" />
              <span>{property.bathrooms} {t.property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{property.area}</span>
            <span>{t.property.m2}</span>
          </div>
        </div>

        {/* Legal Status Badge */}
        <div className="mt-2">
          <LegalStatusBadge status={property.legalStatus} size="sm" />
        </div>

        {/* Amenity Badges */}
        <div className="mt-2">
          <AmenityBadges property={property} compact />
        </div>

        {/* Price Benchmark */}
        <div className="mt-2">
          <PriceBenchmarkBadge benchmark={benchmark.badge} />
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <Badge variant="outline" className="text-[10px]">
            {getPropertyTypeLabelFr(property.propertyType)}
          </Badge>
          <div className="flex items-center gap-1">
            <button
              onClick={handleWhatsApp}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366] transition-all hover:bg-[#25D366]/20 active:scale-90"
              title={t.property.whatsApp}
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
            <Link to={`/property/${property.id}`}>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400">
                {t.property.viewDetails}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
