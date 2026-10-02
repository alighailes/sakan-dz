import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Home, Eye, Trash2, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { useProperties } from '@/hooks/useProperties'
import { WILAYAS } from '@/constants'
import { formatPrice, getOperationLabelFr, getPropertyTypeLabelFr } from '@/lib/utils'
import { VipBadge } from '@/components/VipBadge'
import { VipUpgradeModal } from '@/components/VipUpgradeModal'

export function MyListingsPage() {
  const { user } = useAuthStore()
  const { locale, t } = useLocale()
  const { properties, loading } = useProperties()
  const [vipModalOpen, setVipModalOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  const myProperties = user
    ? properties.filter((p) => p.ownerId === user.id)
    : []

  const handleVipUpgrade = () => {
    // In mock mode, just mark as featured
    if (selectedPropertyId) {
      const saved = JSON.parse(localStorage.getItem('sakan-vip-upgrades') || '[]')
      saved.push({
        propertyId: selectedPropertyId,
        upgradedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      localStorage.setItem('sakan-vip-upgrades', JSON.stringify(saved))
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    )
  }

  if (myProperties.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          icon={Home}
          title={t.myListings.empty}
          description={t.myListings.emptyHint}
          action={
            <Link to="/publish">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                {t.myListings.publishFirst}
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.myListings.title}</h1>
        <Link to="/publish">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t.myListings.addNew}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {myProperties.map((property) => {
          const wilaya = WILAYAS.find((w) => w.id === property.wilayaId)
          return (
            <div
              key={property.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft transition-all duration-300 hover:shadow-soft-lg dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                  {property.isFeatured && <VipBadge />}
                  <Badge variant="default">{getOperationLabelFr(property.operationType)}</Badge>
                  {!property.isAvailable && (
                    <Badge variant="destructive">{t.property.unavailable}</Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(property.price, property.currency)}
                </p>
                <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {property.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {wilaya ? (locale === 'ar' ? wilaya.nameAr : wilaya.name) : ''}
                  {property.commune ? `, ${property.commune}` : ''}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {getPropertyTypeLabelFr(property.propertyType)} · {property.area} m²
                </p>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye className="h-3.5 w-3.5" />
                    {property.viewsCount}
                  </div>
                  <div className="flex items-center gap-2">
                    {!property.isFeatured && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
                        onClick={() => {
                          setSelectedPropertyId(property.id)
                          setVipModalOpen(true)
                        }}
                      >
                        <Crown className="h-3.5 w-3.5" />
                        {t.myListings.upgradeToVIP}
                      </Button>
                    )}
                    <Link to={`/property/${property.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-primary-600 dark:text-primary-400">
                        {t.property.viewDetails}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* VIP Upgrade Modal */}
      <VipUpgradeModal
        isOpen={vipModalOpen}
        onClose={() => setVipModalOpen(false)}
        onConfirm={handleVipUpgrade}
        propertyTitle={myProperties.find((p) => p.id === selectedPropertyId)?.title}
      />
    </div>
  )
}
