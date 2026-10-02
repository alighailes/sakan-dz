import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Home, MapPin, Shield } from 'lucide-react'
import { HeroSearch } from '@/components/search/HeroSearch'
import { PropertyCard } from '@/components/listings/PropertyCard'
import { VerifiedBrokersBanner } from '@/components/home/VerifiedBrokersBanner'
import { HomeGuidesAndServices } from '@/components/home/HomeGuidesAndServices'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { WILAYAS } from '@/constants'
import type { Property } from '@/types'

export function HomePage() {
  const { locale, t } = useLocale()
  const [featured, setFeatured] = useState<Property[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  const popularWilayas = WILAYAS.filter((w) => [16, 31, 6, 25, 19, 15].includes(w.id))

  // Load featured properties on mount
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const { fetchFeaturedProperties } = await import('@/services/api')
        const data = await fetchFeaturedProperties(4)
        setFeatured(data)
      } catch (err) {
        console.error('Failed to load featured properties:', err)
      } finally {
        setLoadingFeatured(false)
      }
    }
    loadFeatured()
  }, [])

  return (
    <div>
      {/* 1. Hero Search */}
      <HeroSearch />

      {/* 2. Verified Brokers Banner — trust anchor */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <VerifiedBrokersBanner />
      </div>

      {/* 3. Featured Listings */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Annonces en vedette</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Les biens les plus populaires</p>
          </div>
          <Link to="/listings">
            <Button variant="ghost" className="gap-1">
              {t.common.seeAll}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loadingFeatured ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] rounded-2xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="mt-4 space-y-3">
                  <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {locale === 'ar' ? 'لا توجد عقارات منشورة حالياً - كن أول من ينشر عقاراً!' : 'Aucun bien publié pour le moment — soyez le premier à publier !'}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {locale === 'ar' ? 'انشر عقارك مجاناً ليظهر هنا.' : 'Publiez votre bien gratuitement pour apparaître ici.'}
            </p>
            <Link to="/publish" className="mt-6">
              <Button className="gap-2">
                {locale === 'ar' ? 'انشر عقاراً الآن' : 'Publier un bien'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Popular Wilayas */}
      <section className="border-y border-zinc-200/60 bg-zinc-50/50 py-12 dark:border-zinc-800/60 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Wilayas populaires</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Explorez les villes les plus actives</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {popularWilayas.map((wilaya) => (
              <Link
                key={wilaya.id}
                to={`/listings?wilaya=${wilaya.id}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-soft transition-all hover:shadow-soft-lg hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/30 dark:group-hover:bg-primary-900/50">
                  <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {locale === 'ar' ? wilaya.nameAr : wilaya.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{wilaya.id}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Buyer Guides & Quick Services */}
      <section className="border-y border-zinc-200/60 bg-zinc-50/50 py-12 dark:border-zinc-800/60 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeGuidesAndServices />
        </div>
      </section>

      {/* 6. Features */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">Pourquoi Sakan DZ ?</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30">
              <Building2 className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">58 Wilayas couvertes</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Trouvez des biens partout en Algerie, de Adrar a Tindouf.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30">
              <Shield className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Annonces verifiees</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Chaque annonce est verifiee pour votre securite et tranquillite d'esprit.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 dark:bg-accent-900/30">
              <Home className="h-7 w-7 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Types varies</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Appartements, villas, terrains, locaux commerciaux et colocation.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white">
            {locale === 'ar' ? 'هل لديك عقار تريد بيعه أو تأجيره؟' : 'Vous avez un bien à louer ou vendre ?'}
          </h2>
          <p className="mt-2 text-emerald-100/80">
            {locale === 'ar'
              ? 'انشر إعلانك مجاناً وبكل سهولة في دقائق معدودة ليصل إلى آلاف المهتمين.'
              : 'Publiez votre annonce gratuitement en quelques minutes.'}
          </p>
          <Link to="/publish" className="mt-6 inline-block">
            <Button size="lg" variant="accent" className="gap-2">
              {locale === 'ar' ? 'أضف إعلاناً' : 'Déposer une annonce'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}