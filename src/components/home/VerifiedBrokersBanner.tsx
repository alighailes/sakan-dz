import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { useLocale } from '@/i18n'

const avatars = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face&auto=format&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face&auto=format&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face&auto=format&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face&auto=format&q=80',
]

export function VerifiedBrokersBanner() {
  const { locale, t } = useLocale()
  const isRTL = locale === 'ar'

  const title = t?.home?.truBrokerTitle ?? 'ابحث عن الوكيل المعتمد'
  const subtitle = t?.home?.truBrokerSubtitle ?? 'تواصل مع نخبة الوكلاء والوسطاء العقاريين الموثوقين'
  const cta = t?.home?.truBrokerCta ?? 'ابحث عن الوكيل'

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-950 shadow-xl">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -start-10 -top-10 h-40 w-40 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute -bottom-10 -end-10 h-40 w-40 rounded-full bg-teal-400 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center gap-6 p-6 sm:p-8 md:flex-row md:justify-between">
          {/* Avatars & Headline */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
            {/* Avatar cluster */}
            <div className="flex items-center -space-x-3 rtl:space-x-reverse">
              {avatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 rounded-full border-2 border-emerald-400/60 object-cover shadow-lg transition-transform hover:scale-110 sm:h-14 sm:w-14"
                  style={{ zIndex: avatars.length - i }}
                />
              ))}
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400/60 bg-emerald-900 text-xs font-bold text-emerald-300 shadow-lg sm:h-14 sm:w-14">
                +50
              </div>
            </div>

            {/* Text */}
            <div className="text-center sm:text-start">
              <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {isRTL ? 'TruBroker DZ' : 'TruBroker DZ'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white sm:text-2xl">
                {title}
              </h3>
              <p className="mt-1 max-w-md text-sm text-emerald-100/70">
                {subtitle}
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/agents"
            className="group flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-950 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-emerald-50 hover:shadow-emerald-500/25 hover:shadow-xl"
          >
            {cta}
            {isRTL ? (
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </Link>
        </div>
      </div>
    </section>
  )
}
