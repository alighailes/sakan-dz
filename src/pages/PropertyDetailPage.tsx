import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Heart, BedDouble, Bath, MapPin, Eye, Share2, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProperties } from '@/hooks/useProperties'
import { fetchPropertyById } from '@/services/api'
import type { Property } from '@/types'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useLocale } from '@/i18n'
import { useCurrencyStore } from '@/stores/currencyStore'
import { getOperationLabelFr, getPropertyTypeLabelFr, getLegalStatusLabelFr } from '@/lib/utils'
import { formatPrice as formatPriceWithMode, getAlternativePrice } from '@/lib/currencyUtils'
import { WILAYAS } from '@/constants'
import { cn } from '@/lib/utils'
import { ContactButtons, formatPhoneForWhatsApp, getPropertyPhone } from '@/components/ContactButtons'
import { ShareModal } from '@/components/ShareModal'
import { VipBadge } from '@/components/VipBadge'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { AmenityBadges } from '@/components/AmenityBadges'
import { PriceBenchmarkBadge } from '@/components/PriceBenchmarkBadge'
import { LegalStatusBadge } from '@/components/listings/LegalStatusBadge'
import { getLegalStatusInfo } from '@/lib/legalStatusHelper'
import { CheckCircle, XCircle, Shield } from 'lucide-react'
import { VacationCalendar } from '@/components/VacationCalendar'
import { StoryGenerator } from '@/components/StoryGenerator'
import { calculatePriceBenchmark } from '@/lib/priceBenchmark'

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { properties, loading } = useProperties(undefined, { limit: 100 })
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { locale, t } = useLocale()
  const { mode } = useCurrencyStore()
  const [showShareModal, setShowShareModal] = useState(false)
  const [showStoryGenerator, setShowStoryGenerator] = useState(false)
  const [showPhone] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Full-row fetch for the target property: feeds use the lean card-column
  // projection (no booked_dates/cleaning_fee/*_ar), so the detail page loads
  // the complete row itself. Falls back to the feed row while loading.
  const [fullProperty, setFullProperty] = useState<Property | null>(null)
  useEffect(() => {
    setFullProperty(null)
    if (!id) return
    let cancelled = false
    fetchPropertyById(id)
      .then(({ property }) => {
        if (!cancelled && property) setFullProperty(property)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [id])

  const property = fullProperty ?? properties.find((p) => p.id === id)

  // Increment live view counter once per visit
  useEffect(() => {
    if (!id) return
    import('@/services/api').then(({ incrementPropertyViews }) => {
      incrementPropertyViews(id).catch(() => {})
    })
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-4 h-96 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-700" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Bien non trouvé</h1>
        <Link to="/listings" className="mt-4 inline-block">
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour aux annonces
          </Button>
        </Link>
      </div>
    )
  }

  const wilaya = WILAYAS.find((w) => w.id === property.wilayaId)
  const fav = isFavorite(property.id)
  const benchmark = calculatePriceBenchmark(property, properties)

  const priceLabel = property.operationType === 'vacation' && property.pricePerNight
    ? formatPriceWithMode(property.pricePerNight, property.currency, mode, locale)
    : formatPriceWithMode(property.price, property.currency, mode, locale)

  const altPriceLabel = property.operationType === 'vacation' && property.pricePerNight
    ? getAlternativePrice(property.pricePerNight, property.currency, mode, locale)
    : getAlternativePrice(property.price, property.currency, mode, locale)

  const allImages = property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800']

  // Seller phone with legacy fallbacks (property.phone / profiles join / ownerPhone).
  const sellerPhone = getPropertyPhone(property)
  const waPhone = sellerPhone ? formatPhoneForWhatsApp(sellerPhone) : null
  const waHref = sellerPhone && waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent('سلام عليكم، أنا مهتم بعقارك: ' + property.title)}`
    : null
  const telHref = sellerPhone ? `tel:${sellerPhone}` : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-6">
      {/* Back */}
      <Link to="/listings" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-primary-600 dark:text-zinc-400">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={allImages[activeImageIndex]}
              alt={property.title}
              className="aspect-video w-full object-cover"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-200',
                        i === activeImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={cn(
                    'flex-shrink-0 overflow-hidden rounded-xl transition-all duration-200',
                    i === activeImageIndex ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-zinc-900' : 'opacity-60 hover:opacity-100'
                  )}
                >
                  <img
                    src={img}
                    alt={`${property.title} ${i + 1}`}
                    className="h-16 w-24 object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Title & Badges */}
          <div className="mt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {property.isFeatured && <VipBadge size="md" />}
                  {property.isVerified && <VerifiedBadge size="md" />}
                  <Badge variant="default">{getOperationLabelFr(property.operationType)}</Badge>
                  <Badge variant="outline">{getPropertyTypeLabelFr(property.propertyType)}</Badge>
                </div>
                <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{property.title}</h1>
                <div className="mt-1 flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  {wilaya ? (locale === 'ar' ? wilaya.nameAr : wilaya.name) : ''}
                  {property.commune ? `, ${property.commune}` : ''}
                  {property.address ? `, ${property.address}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-zinc-400">
                <Eye className="h-4 w-4" />
                {property.viewsCount}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {property.bedrooms > 0 && (
              <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/50">
                <BedDouble className="mx-auto h-6 w-6 text-primary-600 dark:text-primary-400" />
                <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">{property.bedrooms}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.property.bedrooms}</p>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/50">
                <Bath className="mx-auto h-6 w-6 text-primary-600 dark:text-primary-400" />
                <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">{property.bathrooms}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.property.bathrooms}</p>
              </div>
            )}
            <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/50">
              <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">{property.area}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.property.m2}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t.property.description}</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">{property.description}</p>
          </div>

          {/* Legal Status Section */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {locale === 'ar' ? 'الوضع القانوني والوثائق' : 'Statut juridique et documents'}
            </h2>
            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <LegalStatusBadge status={property.legalStatus} size="md" />
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {locale === 'ar'
                  ? getLegalStatusInfo(property.legalStatus).descriptionAr
                  : getLegalStatusInfo(property.legalStatus).descriptionFr}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  {getLegalStatusInfo(property.legalStatus).eligibleForBankLoan ? (
                    <>
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        {t.filters.eligibleForBankLoan}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 flex-shrink-0 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {t.filters.notEligibleForBankLoan}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <Shield className="h-5 w-5 flex-shrink-0 text-primary-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">
                    {t.filters.riskLevel}:{' '}
                    <span className="font-medium">
                      {getLegalStatusInfo(property.legalStatus).riskLevel === 'low'
                        ? t.filters.riskLow
                        : getLegalStatusInfo(property.legalStatus).riskLevel === 'medium'
                          ? t.filters.riskMedium
                          : t.filters.riskHigh}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t.property.details}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t.property.legalStatus}</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-white">{getLegalStatusLabelFr(property.legalStatus)}</dd>
              </div>
              {property.floor !== undefined && (
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t.property.floor}</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-white">
                    {property.floor === 0 ? t.property.groundFloor : property.floor}
                  </dd>
                </div>
              )}
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t.property.wilaya}</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-white">
                  {wilaya ? (locale === 'ar' ? wilaya.nameAr : wilaya.name) : ''}
                </dd>
              </div>
              {property.daira && (
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t.property.daira}</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-white">{property.daira}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Amenity Badges */}
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
              {locale === 'ar' ? 'الخدمات والمرافق' : 'Services et équipements'}
            </h2>
            <AmenityBadges property={property} />
          </div>

          {/* Vacation Calendar */}
          {property.operationType === 'vacation' && (
            <div className="mt-6">
              <VacationCalendar property={property} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Price Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{priceLabel}</p>
              {mode === 'dzd' && (
                <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">{altPriceLabel}</p>
              )}
              <div className="mt-3">
                <PriceBenchmarkBadge benchmark={benchmark.badge} />
              </div>
              <div className="mt-4 space-y-3">
                <ContactButtons property={property} showPhone={showPhone || !property.ownerPhone} />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => toggleFavorite(property.id)}
                  >
                    <Heart className={cn('h-4 w-4', fav && 'fill-current text-red-500')} />
                    {fav ? t.property.removeFromFavorites : t.property.addToFavorites}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                {property.operationType === 'rent' && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => window.open(`/contract?propertyId=${property.id}`, '_blank')}
                  >
                    <FileText className="h-4 w-4" />
                    {t.property.generateContract}
                  </Button>
                )}
              </div>
            </div>

            {/* Owner Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Propriétaire</h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  {property.ownerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{property.ownerName}</p>
                  {sellerPhone ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{sellerPhone}</p>
                  ) : (
                    <p className="mt-1 inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {locale === 'ar' ? 'رقم الهاتف غير متوفر' : 'Numéro indisponible'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-strong border-t border-zinc-200/50 px-4 py-3 shadow-soft-xl dark:border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{priceLabel}</p>
            </div>
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'whatsapp' }), 'flex-1 gap-2')}
              >
                {locale === 'ar' ? 'تواصل عبر واتساب' : 'WhatsApp'}
              </a>
            ) : (
              <span className="inline-flex flex-1 items-center justify-center rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {locale === 'ar' ? 'رقم الهاتف غير متوفر' : 'Numéro indisponible'}
              </span>
            )}
            {telHref ? (
              <a
                href={telHref}
                className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 gap-2')}
              >
                {locale === 'ar' ? 'اتصال مباشر' : 'Appeler'}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        property={property}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Story Generator Modal */}
      <StoryGenerator
        property={property}
        isOpen={showStoryGenerator}
        onClose={() => setShowStoryGenerator(false)}
      />
    </div>
  )
}
