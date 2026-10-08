import { useParams } from 'react-router-dom'
import { Building2, MapPin, Phone } from 'lucide-react'
import { useProperties } from '@/hooks/useProperties'
import { useLocale } from '@/i18n'
import { PropertyCard } from '@/components/listings/PropertyCard'
import { EmptyState } from '@/components/ui/empty-state'

export function AgencyPage() {
  const { agencyId } = useParams<{ agencyId: string }>()
  const { properties } = useProperties(undefined, { limit: 100 })
  const { t } = useLocale()

  const agencyProperties = properties.filter((p) => p.agencyId === agencyId || p.ownerId === agencyId)
  const agencyName = agencyProperties[0]?.agencyName || agencyProperties[0]?.ownerName || 'Agence'

  if (agencyProperties.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          icon={Building2}
          title={t.agency.title}
          description="Aucune annonce trouvée pour cette agence"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Agency Header */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
            <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{agencyName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.agency.title}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {agencyProperties[0]?.address || 'Alger, Algérie'}
          </span>
          {agencyProperties[0]?.ownerPhone && (
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {agencyProperties[0].ownerPhone}
            </span>
          )}
        </div>
      </div>

      {/* Agency Listings */}
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        {t.agency.listings} ({agencyProperties.length})
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agencyProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
