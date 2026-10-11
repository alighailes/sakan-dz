import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Heart, BedDouble, Bath, MapPin, Eye, MessageCircle, Users, Loader2 } from 'lucide-react'
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
import { useAuthStore } from '@/stores/authStore'
import {
  createGroup,
  fetchUserGroup,
  getLastDuoGroupError,
  toggleDuoProperty,
} from '@/services/collaborativeFavoritesApi'
import type { Property } from '@/types'

interface PropertyCardProps {
  property: Property
  /** Hide the Darna Duo quick-add button (e.g. inside the Duo tab where the card is already shared). */
  showDuoAction?: boolean
  /** Controlled Duo state — when provided, the button reflects it instead of its internal state. */
  duoAdded?: boolean
  /** Controlled Duo toggle — when provided, called instead of the internal shared-list API. */
  onDuoToggle?: (propertyId: string) => void | Promise<void>
}

export function PropertyCard({ property, showDuoAction = true, duoAdded, onDuoToggle }: PropertyCardProps) {
  const { locale, t } = useLocale()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { user } = useAuthStore()
  const { mode } = useCurrencyStore()
  const navigate = useNavigate()
  const [duoLoading, setDuoLoading] = useState(false)
  const [duoDone, setDuoDone] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fav = isFavorite(property.id)
  const wilaya = WILAYAS.find((w) => w.id === property.wilayaId)
  const { properties: allProperties } = useProperties(undefined, { limit: 60 })

  const priceLabel = property.operationType === 'vacation' && property.pricePerNight
    ? formatPriceWithMode(property.pricePerNight, property.currency, mode, locale)
    : formatPriceWithMode(property.price, property.currency, mode, locale)

  const altPriceLabel = property.operationType === 'vacation' && property.pricePerNight
    ? getAlternativePrice(property.pricePerNight, property.currency, mode, locale)
    : getAlternativePrice(property.price, property.currency, mode, locale)

  const benchmark = calculatePriceBenchmark(property, allProperties)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(id)
  }, [toast])

  const showToast = (type: 'success' | 'error', message: string) => setToast({ type, message })

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

  const handleDuoToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (duoLoading) return

    // Controlled (e.g. the Duo tab) — delegate to the parent.
    if (onDuoToggle) {
      setDuoLoading(true)
      try {
        await onDuoToggle(property.id)
      } catch (err) {
        console.error('[PropertyCard] duo toggle failed:', err)
        showToast('error', err instanceof Error ? err.message : String(err))
      } finally {
        setDuoLoading(false)
      }
      return
    }

    if (!user) {
      showToast(
        'error',
        locale === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Veuillez vous connecter d’abord'
      )
      navigate('/auth')
      return
    }

    setDuoLoading(true)
    try {
      // Guarantee an active group before touching shared_favorite_items.
      let group = await fetchUserGroup()
      if (!group) group = await createGroup()

      if (!group?.id) {
        // Group could not be provisioned — keep the card clean (no red
        // banner); the underlying cause goes to the console only.
        console.error(
          '[PropertyCard] duo group unavailable:',
          getLastDuoGroupError() ?? 'group-unavailable'
        )
        return
      }

      const result = await toggleDuoProperty(property.id, group.id)
      if (result.status === 'added') {
        setDuoDone(true)
        showToast(
          'success',
          locale === 'ar'
            ? 'تمت الإضافة إلى مفضلة الشريك (Darna Duo)'
            : 'Bien ajouté aux favoris partagés Darna Duo'
        )
      } else if (result.status === 'removed') {
        setDuoDone(false)
        showToast(
          'success',
          locale === 'ar'
            ? 'تمت الإزالة من المفضلة المشتركة'
            : 'Bien retiré des favoris partagés'
        )
      } else if (result.status === 'no_auth') {
        showToast(
          'error',
          locale === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Veuillez vous connecter d’abord'
        )
        navigate('/auth')
      } else {
        // Confirmed write failure — surface the exact error message.
        console.error('[PropertyCard] duo toggle error:', result.error)
        showToast(
          'error',
          result.error ||
            (locale === 'ar' ? 'تعذّر تحديث المفضلة المشتركة' : 'Échec de la mise à jour')
        )
      }
    } catch (err) {
      console.error('[PropertyCard] duo toggle failed:', err)
      showToast('error', err instanceof Error ? err.message : String(err))
    } finally {
      setDuoLoading(false)
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl backdrop-blur-lg bg-white/50 dark:bg-[#162623]/45 border border-white/50 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-[#295255]/30 transition-all duration-300 hover:-translate-y-1">
      {/* Image — fixed aspect box + placeholder bg prevent CLS while lazy-loading */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F0F5F7] dark:bg-zinc-800">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
          alt={property.title}
          className="h-full w-full bg-[#F0F5F7] object-cover transition-transform duration-500 group-hover:scale-105 dark:bg-zinc-800"
          loading="lazy"
          decoding="async"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {property.isFeatured && <VipBadge />}
          {property.isVerified && <VerifiedBadge />}
          <Badge variant="glass" className="text-[10px] backdrop-blur-md bg-[#295255]/15 text-[#295255] dark:text-[#F0F5F7] border border-[#295255]/20 font-semibold opacity-100">
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

        {/* Duo Favorite / Partner button */}
        {showDuoAction && (
          <button
            type="button"
            onClick={handleDuoToggle}
            className={cn(
              'absolute right-3 top-14 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 active:scale-90',
              duoAdded || duoDone
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'bg-white/80 text-zinc-600 hover:bg-white hover:text-primary-600 dark:bg-zinc-900/80 dark:text-zinc-400'
            )}
            disabled={duoLoading}
            title={locale === 'ar' ? 'إضافة إلى Darna Duo' : 'Ajouter à Darna Duo'}
          >
            {duoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Users
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  (duoAdded || duoDone) && 'scale-110'
                )}
              />
            )}
          </button>
        )}

        {/* Per-card toast (absolute: backdrop-blur ancestors break fixed positioning) */}
        {toast && (
          <div
            role="status"
            className={cn(
              'pointer-events-none absolute inset-x-3 top-1/2 z-20 -translate-y-1/2 rounded-xl px-3 py-2 text-center text-xs font-semibold text-white shadow-lg',
              toast.type === 'success' ? 'bg-emerald-600/95' : 'bg-rose-600/95'
            )}
          >
            {toast.message}
          </div>
        )}

        {/* Price pill - bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="rounded-xl px-3 py-1.5 backdrop-blur-md bg-[#295255]/15 text-[#295255] dark:text-[#F0F5F7] border border-[#295255]/20 font-semibold opacity-100">
            <p className="text-sm font-bold text-[#295255] dark:text-[#F0F5F7] opacity-100">
              {priceLabel}
            </p>
            {mode === 'dzd' && (
              <p className="text-[10px] opacity-80">{altPriceLabel}</p>
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
          <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-primary-600 dark:text-zinc-100 dark:group-hover:text-primary-400 opacity-100">
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
