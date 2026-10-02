import { Link } from 'react-router-dom'
import { ArrowRight, Building2, FileText, Shield, Sparkles, Tag, Users } from 'lucide-react'
import { useLocale } from '@/i18n'

const stats = [
  { label: 'about.stats.wilayas', value: '58', icon: Building2 },
  { label: 'about.stats.listings', value: '1000+', icon: FileText },
  { label: 'about.stats.agents', value: '500+', icon: Users },
  { label: 'about.stats.trust', value: '100%', icon: Shield },
]

const pillars = [
  {
    title: 'about.pillars.transparency.title',
    desc: 'about.pillars.transparency.desc',
    icon: Shield,
  },
  {
    title: 'about.pillars.currency.title',
    desc: 'about.pillars.currency.desc',
    icon: Tag,
  },
  {
    title: 'about.pillars.fees.title',
    desc: 'about.pillars.fees.desc',
    icon: Sparkles,
  },
]

function getTranslation(obj: Record<string, unknown>, key: string): string {
  const keys = key.split('.')
  let result: unknown = obj
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  return typeof result === 'string' ? result : key
}

export function AboutPage() {
  const { t } = useLocale()
  const a = t.about

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
            <span>{a?.badge ?? 'حول سكن DZ'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {a?.heroTitle ?? 'منصة سكن DZ — مرجع العقار في الجزائر'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {a?.heroSubtitle ?? 'نربط البائعين والمشترين والوسطاء المعتمدين في منصة واحدة آمنة، شفافة، ومصممة للسوق الجزائري.'}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              {a?.storyTitle ?? 'قصتنا'}
            </h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300">
              <p>{a?.storyP1 ?? 'ولدت سكن DZ من ملاحظة بسيطة: البحث عن عقار في الجزائر كان معقداً، محفوفاً بالمخاطر، ويفتقر للشفافية.'}</p>
              <p>{a?.storyP2 ?? 'قررنا بناء منصة تضع الثقة أولاً: تحقق من الوثائق، أسعار واضحة، ووسطاء معتمدون فقط.'}</p>
              <p>{a?.storyP3 ?? 'اليوم، نحن المنصة المرجعية لآلاف الجزائريين الباحثين عن منزلهم أو استثمارهم القادم.'}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-50 p-8 dark:from-primary-950/30 dark:to-emerald-950/30">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              {a?.missionTitle ?? 'مهمتنا'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {a?.missionDesc ?? 'جعل البحث عن العقار في الجزائر بسيطاً وآمناً وشفافاً للجميع.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium dark:bg-primary-900/30 dark:text-primary-300">
                {a?.value1 ?? 'شفافية مطلقة'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium dark:bg-emerald-900/30 dark:text-emerald-300">
                {a?.value2 ?? 'بيانات موثقة'}
              </span>
              <span className="px-3 py-1 rounded-full bg-accent-100 text-accent-700 text-sm font-medium dark:bg-accent-900/30 dark:text-accent-300">
                {a?.value3 ?? 'صفر رسوم خفية'}
              </span>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-soft dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 mx-auto mb-4 dark:bg-primary-900/40 dark:text-primary-300">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {getTranslation(a, stat.label) ?? stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Pillars */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-10">
            {a?.pillarsTitle ?? 'ركائزنا الثلاث'}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 mx-auto mb-4 dark:bg-primary-900/40 dark:text-primary-300">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white text-center mb-2">
                  {getTranslation(a, pillar.title) ?? pillar.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-center">
                  {getTranslation(a, pillar.desc) ?? pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
          >
            {a?.ctaText ?? 'تعرف على وكلائنا المعتمدين'}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}