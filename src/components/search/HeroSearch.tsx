import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Home, Building2, Palmtree, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WILAYAS, OPERATION_TYPES, LEGAL_STATUS } from '@/constants'
import { useLocale } from '@/i18n'
import { useSearchStore } from '@/stores/searchStore'
import { cn } from '@/lib/utils'
import type { OperationType, LegalStatus } from '@/types'

const OPERATION_ICONS: Record<string, typeof Home> = {
  rent: Building2,
  sale: Home,
  vacation: Palmtree,
  colocation: Users,
}

const QUICK_FILTERS = [
  { label: 'شقق وهران', wilaya: 31, operation: 'rent' as OperationType },
  { label: 'استوديو العاصمة', wilaya: 16, operation: 'rent' as OperationType },
  { label: 'كراء عطل جيجل', wilaya: 18, operation: 'vacation' as OperationType },
  { label: 'فلل البليدة', wilaya: 9, operation: 'sale' as OperationType },
  { label: 'شقق قسنطينة', wilaya: 25, operation: 'rent' as OperationType },
]

export function HeroSearch() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { locale, t } = useLocale()
  const { filters, setFilters, setActiveOperation } = useSearchStore()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [wilayaId, setWilayaId] = useState<number | ''>(
    searchParams.get('wilaya') ? Number(searchParams.get('wilaya')) : ''
  )
  const [operation, setOperation] = useState<OperationType | ''>(
    (searchParams.get('operation') as OperationType) || ''
  )

  useEffect(() => {
    const q = searchParams.get('q')
    const wilaya = searchParams.get('wilaya')
    const op = searchParams.get('operation')

    if (q) setQuery(q)
    if (wilaya) setWilayaId(Number(wilaya))
    if (op) {
      setOperation(op as OperationType)
      setActiveOperation(op as OperationType)
    }
  }, [searchParams, setActiveOperation])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const filters: Record<string, unknown> = {}
    if (query.trim()) filters.query = query.trim()
    if (wilayaId !== '') filters.wilayaId = Number(wilayaId)
    if (operation) {
      filters.operationType = operation
      setActiveOperation(operation as OperationType)
    }
    setFilters(filters)

    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (wilayaId !== '') params.set('wilaya', String(wilayaId))
    if (operation) params.set('operation', operation)
    const queryString = params.toString()
    navigate(`/listings${queryString ? `?${queryString}` : ''}`)
  }

  const handleQuickFilter = (wilaya: number, op: OperationType) => {
    setWilayaId(wilaya)
    setOperation(op)
    setActiveOperation(op)
    setFilters({ wilayaId: wilaya, operationType: op })
    navigate(`/listings?wilaya=${wilaya}&operation=${op}`)
  }

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Ambient glow */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Headline */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {t.hero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80 sm:text-xl">
          {t.hero.subtitle}
        </p>

        {/* Floating Glass Search Island */}
        <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-2xl">
          <div className="glass-strong rounded-2xl p-2 shadow-soft-xl">
            {/* Operation Toggle Pills */}
            <div className="flex items-center gap-1 overflow-x-auto px-2 pb-2 scrollbar-hide">
              <button
                type="button"
                onClick={() => setOperation('')}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                  !operation
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                )}
              >
                {t.filters.all}
              </button>
              {OPERATION_TYPES.map((op) => {
                const Icon = OPERATION_ICONS[op.value] || Home
                return (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setOperation(op.value)}
                    className={cn(
                      'flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                      operation === op.value
                        ? 'bg-primary-600 text-white shadow-glow'
                        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {locale === 'ar' ? op.labelAr : op.labelFr}
                  </button>
                )
              })}
            </div>

            {/* Search Input Group */}
            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Wilaya Select */}
              <div className="relative sm:w-48">
                <select
                  value={wilayaId}
                  onChange={(e) => setWilayaId(e.target.value ? Number(e.target.value) : '')}
                  className="h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">{t.filters.allWilayas}</option>
                  {WILAYAS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {locale === 'ar' ? w.nameAr : w.name} ({w.id})
                    </option>
                  ))}
                </select>
                <MapPin className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>

              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder={t.hero.searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Search Button */}
              <Button type="submit" size="lg" className="h-11 w-full sm:w-auto">
                <Search className="h-4 w-4" />
                {t.hero.search}
              </Button>
            </div>
          </div>
        </form>

        {/* Legal Status Filter */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-primary-100/60">
            {locale === 'ar' ? 'الوثائق القانونية' : 'Statut juridique'}:
          </span>
          <select
            value={filters.legalStatus ?? ''}
            onChange={(e) => {
              const val = (e.target.value || undefined) as LegalStatus | undefined
              setFilters({ legalStatus: val })
            }}
            className="h-9 rounded-full border border-white/20 bg-white/10 px-3 text-sm text-white backdrop-blur-sm transition-all hover:border-white/40 focus:border-white/60 focus:outline-none [&>option]:text-zinc-900"
          >
            <option value="">{t.filters.allLegal}</option>
            {LEGAL_STATUS.map((ls) => (
              <option key={ls.value} value={ls.value}>
                {locale === 'ar' ? ls.labelAr : ls.labelFr}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {QUICK_FILTERS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleQuickFilter(chip.wilaya, chip.operation)}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/20 hover:text-white"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-primary-100/70">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">58</span>
            <span className="text-sm">Wilayas</span>
          </div>
          <div className="h-4 w-px bg-primary-400/30" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">1000+</span>
            <span className="text-sm">Annonces</span>
          </div>
          <div className="h-4 w-px bg-primary-400/30" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">500+</span>
            <span className="text-sm">Utilisateurs</span>
          </div>
        </div>

        {/* Trust badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-primary-100/50">
          <TrendingUp className="h-4 w-4" />
          <span>Plateforme N°1 de l'immobilier en Algérie</span>
        </div>
      </div>
    </section>
  )
}
