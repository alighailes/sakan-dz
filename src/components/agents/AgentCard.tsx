import { Link } from 'react-router-dom'
import { Award, Eye, MessageCircle, Phone, ShieldCheck, Star } from 'lucide-react'
import { useLocale } from '@/i18n'
import type { Agent } from '@/types'

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  const { locale, t } = useLocale()
  const isRTL = locale === 'ar'

  const callLabel = t?.agents?.call ?? 'اتصال مباشر'
  const whatsappLabel = t?.agents?.whatsapp ?? 'واتساب'
  const listingsLabel = t?.agents?.viewListings ?? 'عرض الإعلانات'
  const licenseLabel = t?.agents?.license ?? 'معتمد من الدولة'
  const listingsCountLabel = t?.agents?.activeListings ?? 'عقار معروض'

  const whatsappMessage = encodeURIComponent(
    isRTL
      ? `مرحباً، أنا مهتم بخدماتك العقارية على سكن DZ.`
      : `Bonjour, je suis intéressé par vos services immobiliers sur Sakan DZ.`
  )
  const whatsappDigits = (agent.whatsapp || agent.phone || '').replace(/[^0-9]/g, '')

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-6">
        {/* Verified badge — in normal flow so it never overlaps the title */}
        {agent.verified ? (
          <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-white shadow backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{licenseLabel}</span>
          </div>
        ) : null}

        {/* Avatar & Info */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              loading="lazy"
              className="h-16 w-16 rounded-2xl object-cover shadow-md"
            />
            {agent.verified && (
              <div className="absolute -bottom-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base font-bold leading-snug text-zinc-900 line-clamp-2 dark:text-white">
              {agent.agencyName || agent.name}
            </h3>
            {agent.agencyName ? (
              <p className="mt-0.5 break-words text-sm font-medium leading-snug text-primary-600 line-clamp-1 dark:text-primary-400">
                {agent.name}
              </p>
            ) : null}
            {(agent.wilaya || agent.commune) ? (
              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                {agent.wilaya ? <span>{agent.wilaya}</span> : null}
                {agent.wilaya && agent.commune ? <span>•</span> : null}
                {agent.commune ? <span>{agent.commune}</span> : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* License */}
        {agent.licenseNumber ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800/40 dark:bg-amber-900/20">
            <Award className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              {isRTL ? `اعتماد رقم: ${agent.licenseNumber}` : `Agrément n°: ${agent.licenseNumber}`}
            </span>
          </div>
        ) : null}

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              {agent.rating}
            </span>
            <span className="text-xs text-zinc-400">
              ({agent.reviewsCount})
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {agent.activeListingsCount}
            </span>
            <span className="text-xs text-zinc-400">
              {listingsCountLabel}
            </span>
          </div>
        </div>

        {/* Specialties */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(agent.specialties ?? []).map((spec) => (
            <span
              key={spec}
              className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p className="mt-4 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {agent.bio}
        </p>

        {/* CTAs */}
        <div className="mt-5 flex items-center gap-2">
          <a
            href={`tel:${agent.phone}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 hover:shadow-glow"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">{callLabel}</span>
          </a>
          {whatsappDigits ? (
            <a
              href={`https://wa.me/${whatsappDigits}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 hover:shadow-glow"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{whatsappLabel}</span>
            </a>
          ) : null}
          <Link
            to={`/listings?agentId=${agent.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-zinc-200 px-3 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">{listingsLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
