import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShieldCheck, UserPlus } from 'lucide-react'
import { AgentCard } from '@/components/agents/AgentCard'
import { WILAYAS } from '@/constants'
import { useLocale } from '@/i18n'

const SPECIALTY_FILTERS = ['بيع', 'إيجار', 'تجاري', 'ترقية عقارية']

export function AgentsPage() {
  const { locale, t } = useLocale()
  const isRTL = locale === 'ar'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWilaya, setSelectedWilaya] = useState<number | ''>('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [agents, setAgents] = useState<import('@/services/api').Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const title = t?.agents?.title ?? 'دليل الوكلاء والوسطاء العقاريين المعتمدين في الجزائر'
  const subtitle = t?.agents?.subtitle ?? 'ابحث عن وكيلك العقاري الموثوق لإتمام صفقات البيع والإيجار بأمان قانوني كامل.'
  const searchPlaceholder = t?.agents?.searchPlaceholder ?? 'ابحث بالاسم أو الوكالة...'
  const allWilayasLabel = t?.agents?.allWilayas ?? 'جميع الولايات'
  const noResultsTitle = isRTL ? 'لا يوجد وكلاء عقاريون مسجلون حالياً' : 'Aucun agent immobilier enregistré pour le moment'
  const noResultsHint = isRTL
    ? 'إذا كنت وكيلاً أو وكالة معتمدة، سجّل الآن للانضمام إلى الدليل.'
    : 'Si vous êtes un agent ou une agence certifiée, inscrivez-vous pour rejoindre l\'annuaire.'
  const registerTitle = t?.agents?.registerTitle ?? 'هل أنت وكيل أو صاحب وكالة عقارية معتمدة؟'
  const registerSubtitle = t?.agents?.registerSubtitle ?? 'انضم إلى نخبة سكن DZ ووثّق حسابك اليوم.'
  const registerCta = t?.agents?.registerCta ?? 'سجّل كوكيل'

  // Load agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await import('@/services/api').then(({ fetchAgents }) => fetchAgents())
        setAgents(data)
      } catch (err) {
        console.error('Failed to load agents:', err)
        setError('فشل تحميل الوكلاء')
      } finally {
        setLoading(false)
      }
    }
    loadAgents()
  }, [])

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        !searchQuery ||
        agent.name.includes(searchQuery) ||
        agent.agencyName.includes(searchQuery)
      const selectedW = selectedWilaya ? WILAYAS.find((w) => w.id === selectedWilaya) : undefined
      const matchesWilaya =
        !selectedWilaya ||
        !selectedW ||
        agent.wilaya === selectedW.name ||
        agent.wilaya === selectedW.nameAr ||
        agent.wilaya === String(selectedW.id)
      // Specialty chips must never hide agents that simply have no
      // specialty/listings data yet — default (الكل) shows everything.
      const matchesSpecialty =
        !selectedSpecialty ||
        agent.specialties.length === 0 ||
        agent.specialties.includes(selectedSpecialty)
      return matchesSearch && matchesWilaya && matchesSpecialty
    })
  }, [agents, searchQuery, selectedWilaya, selectedSpecialty])

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 py-16">
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

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            <span>{isRTL ? 'وكلاء معتمدون' : 'Agents certifiés'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="border-b border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white ps-10 pe-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* Wilaya Select */}
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value ? Number(e.target.value) : '')}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 md:w-48"
            >
              <option value="">{allWilayasLabel}</option>
              {WILAYAS.map((w) => (
                <option key={w.id} value={w.id}>
                  {locale === 'ar' ? w.nameAr : w.name} ({w.id})
                </option>
              ))}
            </select>
          </div>

          {/* Specialty Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedSpecialty('')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                !selectedSpecialty
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {isRTL ? 'الكل' : 'Tous'}
            </button>
            {SPECIALTY_FILTERS.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec === selectedSpecialty ? '' : spec)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <ShieldCheck className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {error}
            </h3>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
            >
              {isRTL ? 'إعادة المحاولة' : 'Réessayer'}
            </button>
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Search className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {noResultsTitle}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {noResultsHint}
            </p>
            <Link
              to="/auth?type=agent"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary-700"
            >
              <UserPlus className="h-4 w-4" />
              {registerCta}
            </Link>
          </div>
        )}
      </section>

      {/* Agency Registration Callout */}
      <section className="border-t border-zinc-200 bg-gradient-to-r from-primary-50 to-emerald-50 py-12 dark:border-zinc-800 dark:from-primary-950/30 dark:to-emerald-950/30">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
            <UserPlus className="h-7 w-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {registerTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-500 dark:text-zinc-400">
            {registerSubtitle}
          </p>
          <Link
            to="/auth?type=agent"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
          >
            <UserPlus className="h-4 w-4" />
            {registerCta}
          </Link>
        </div>
      </section>
    </div>
  )
}