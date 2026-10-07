import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calculator, Sparkles, Tag } from 'lucide-react'
import { useLocale } from '@/i18n'
import { WILAYAS } from '@/constants'

type PropertyType = 'apartment' | 'villa' | 'commercial' | 'land'

const BASE_PRICES: Record<PropertyType, number> = {
  apartment: 180000,
  villa: 250000,
  commercial: 300000,
  land: 120000,
}

const WILAYA_MULTIPLIERS: Record<number, number> = {
  16: 1.5, // Alger
  31: 1.2, // Oran
  25: 1.1, // Constantine
  6: 1.0, // Bejaia
  9: 0.9, // Blida
  15: 0.85, // Tizi Ouzou
  19: 0.8, // Setif
  18: 0.9, // Jijel
  13: 0.8, // Tlemcen
  4: 0.75, // Batna
}

const AMENITY_BONUS = {
  elevator: 1.08,
  heating: 1.05,
  waterTank: 1.03,
  parking: 1.05,
}

export function ValuationPage() {
  const { locale, t } = useLocale()
  const g = t.guides?.valuation

  const [wilayaId, setWilayaId] = useState<number | ''>('')
  const [commune, setCommune] = useState('')
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment')
  const [area, setArea] = useState('')
  const [bedrooms, setBedrooms] = useState('3')
  const [amenities, setAmenities] = useState<string[]>([])

  const basePrice = BASE_PRICES[propertyType] || BASE_PRICES.apartment
  const wilayaMultiplier = WILAYA_MULTIPLIERS[wilayaId as number] || 1.0
  const areaNum = parseFloat(area) || 0
  const beds = parseInt(bedrooms) || 0

  let amenityMultiplier = 1
  amenities.forEach((a) => {
    amenityMultiplier *= AMENITY_BONUS[a as keyof typeof AMENITY_BONUS] || 1
  })

  const bedroomFactor = beds > 0 ? 1 + (beds - 1) * 0.03 : 1

  const pricePerM2 = Math.round(basePrice * wilayaMultiplier * amenityMultiplier * bedroomFactor)
  const totalPrice = Math.round(pricePerM2 * areaNum)
  const lowEstimate = Math.round(totalPrice * 0.85)
  const highEstimate = Math.round(totalPrice * 1.15)

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(num)
  }

  const handleAmenityToggle = (value: string) => {
    setAmenities((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 py-16 sm:py-24">
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
            <Sparkles className="h-4 w-4" />
            <span>{g?.badge ?? 'أداة التقييم العقاري'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {g?.heroTitle ?? 'تقييم فوري لأسعار العقارات في الجزائر'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {g?.heroSubtitle ?? 'احصل على نطاق سعري تقديري لعقارك بناءً على الموقع، النوع، المساحة، والمواصفات.'}
          </p>
        </div>
      </section>

      {/* Form & Result */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary-600" />
              {g?.formTitle ?? 'بيانات العقار للتقييم'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {g?.wilayaLabel ?? 'الولاية'}
                </label>
                <select
                  value={wilayaId}
                  onChange={(e) => setWilayaId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">{locale === 'ar' ? 'اختر الولاية' : 'Sélectionnez la wilaya'}</option>
                  {WILAYAS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {locale === 'ar' ? w.nameAr : w.name} ({w.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {g?.communeLabel ?? 'البلدية'}
                </label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder={locale === 'ar' ? 'مثال: الجزائر الوسطى' : 'Ex: Alger Centre'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {g?.propertyTypeLabel ?? 'نوع العقار'}
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {(g?.propertyTypes ?? [
                    { value: 'apartment', label: 'شقة' },
                    { value: 'villa', label: 'فيلا' },
                    { value: 'commercial', label: 'محل تجاري' },
                    { value: 'land', label: 'قطعة أرض' },
                  ]).map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {g?.areaLabel ?? 'المساحة (م²)'}
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  min="10"
                  max="10000"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {g?.bedroomsLabel ?? 'عدد الغرف'}
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={String(n)}>
                      {n} {locale === 'ar' ? 'غرفة' : 'pièce'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {g?.amenitiesLabel ?? 'التجهيزات المتوفرة'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(g?.amenities ?? [
                    { value: 'elevator', label: 'مصعد' },
                    { value: 'heating', label: 'تدفئة مركزية' },
                    { value: 'waterTank', label: 'خزان ماء' },
                    { value: 'parking', label: 'موقف سيارات' },
                  ]).map((am) => (
                    <button
                      key={am.value}
                      type="button"
                      onClick={() => handleAmenityToggle(am.value)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        amenities.includes(am.value)
                          ? 'bg-primary-600 text-white shadow-glow'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {am.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {}}
                className="w-full rounded-xl bg-primary-600 px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
              >
                {g?.calculateBtn ?? 'احسب التقييم'}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-50 to-primary-50 p-8 dark:border-emerald-900/30 dark:from-emerald-950/30 dark:to-primary-950/30">
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-2">
              <Tag className="h-6 w-6" />
              {g?.resultTitle ?? 'نتيجة التقييم التقديري'}
            </h2>

            {(areaNum > 0 && wilayaId) ? (
              <>
                <div className="space-y-6">
                  <div className="rounded-xl bg-white/80 p-6 dark:bg-zinc-800/50">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {g?.priceRange ?? 'نطاق السعر التقديري'}
                    </p>
                    <div className="mt-2 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {g?.lowEstimate ?? 'الحد الأدنى'}
                        </p>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                          {formatNumber(lowEstimate)} دج
                        </p>
                      </div>
                      <div className="flex-1 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {g?.highEstimate ?? 'الحد الأقصى'}
                        </p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                          {formatNumber(highEstimate)} دج
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/80 p-6 dark:bg-zinc-800/50">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {g?.pricePerM2 ?? 'متوسط سعر المتر المربع في المنطقة'}
                    </p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                      {formatNumber(pricePerM2)} دج/م²
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/80 p-6 dark:bg-zinc-800/50">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {locale === 'ar' ? 'تفاصيل الحساب' : 'Détails du calcul'}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <li>{locale === 'ar' ? 'السعر الأساسي للمتر (' : 'Prix de base du m² ('}{propertyType}): {formatNumber(basePrice)} دج</li>
                      <li>{locale === 'ar' ? 'معامل الولاية' : 'Coefficient wilaya'}: x{wilayaMultiplier}</li>
                      {amenities.length > 0 && (
                        <li>{locale === 'ar' ? 'معامل التجهيزات' : 'Coefficient équipements'}: x{amenityMultiplier.toFixed(2)}</li>
                      )}
                      <li>{locale === 'ar' ? 'معامل عدد الغرف' : 'Coefficient pièces'}: x{bedroomFactor.toFixed(2)}</li>
                      <li>{locale === 'ar' ? 'السعر النهائي للمتر' : 'Prix final du m²'}: {formatNumber(pricePerM2)} دج</li>
                      <li>{locale === 'ar' ? 'المساحة' : 'Surface'}: {formatNumber(areaNum)} م²</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
                  {g?.disclaimer ?? 'تقييم تقديري آلي يعتمد على بيانات السوق العامة. للتقييم الدقيق، استعن بخبير عقاري معتمد.'}
                </p>

                <div className="mt-8 text-center">
                  <Link
                    to="/publish"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
                  >
                    {g?.ctaText ?? 'أعلن عن عقارك بهذا السعر الآن'}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Calculator className="mx-auto h-16 w-16 text-emerald-400/50" />
                <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  {locale === 'ar' ? 'أكمل النموذج للحصول على التقييم' : 'Complétez le formulaire pour obtenir l\'estimation'}
                </h3>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                  {locale === 'ar' ? 'أدخل المساحة واختر الولاية لتحصل على تقدير فوري' : 'Entrez la surface et choisissez la wilaya pour une estimation instantanée'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}