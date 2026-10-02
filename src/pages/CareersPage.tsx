import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Code2, Clock, Globe, MapPin, Sparkles, Target, Users } from 'lucide-react'
import { useLocale } from '@/i18n'

const positions = [
  {
    title: 'careers.pos1.title',
    desc: 'careers.pos1.desc',
    location: 'careers.pos1.location',
    type: 'careers.pos1.type',
    icon: Code2,
  },
  {
    title: 'careers.pos2.title',
    desc: 'careers.pos2.desc',
    location: 'careers.pos2.location',
    type: 'careers.pos2.type',
    icon: Briefcase,
  },
  {
    title: 'careers.pos3.title',
    desc: 'careers.pos3.desc',
    location: 'careers.pos3.location',
    type: 'careers.pos3.type',
    icon: Globe,
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

export function CareersPage() {
  const { t } = useLocale()
  const c = t.careers

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 py-16 sm:py-24">
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4h-4zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
            <Sparkles className="h-4 w-4" />
            <span>{c?.badge ?? 'فرص العمل'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {c?.heroTitle ?? 'انضم إلى فريق سكن DZ'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {c?.heroSubtitle ?? 'نبني مستقبل PropTech في الجزائر. نبحث عن المواهب الشغوفة لتطوير المنصة العقارية الأولى في البلاد.'}
          </p>
        </div>
      </section>

      {/* Culture & Vision */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              {c?.visionTitle ?? 'رؤيتنا'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              {c?.visionDesc ?? 'أن نصبح المنصة العقارية الأولى في الجزائر، حيث الثقة والشفافية والتقنية تلتقي لخدمة الجميع.'}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              {c?.cultureTitle ?? 'ثقافتنا'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              {c?.cultureDesc ?? 'فريق متنوع، بيئة مرنة، وتعلم مستمر. نقدر المبادرة والشفافية والتأثير الحقيقي.'}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300 mb-4">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              {c?.impactTitle ?? 'أثرنا'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              {c?.impactDesc ?? 'نساعد الآلاف في العثور على منازلهم، ونمكن الوكلاء من تطوير أعمالهم بأمان.'}
            </p>
          </div>

          {/* Open Positions */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary-600" />
              {c?.openPositions ?? 'المناصب الشاغرة'}
            </h2>
            <div className="grid gap-6">
              {positions.map((pos, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft transition-all hover:border-primary-300 hover:shadow-soft-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                        <pos.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                          {getTranslation(c, pos.title) ?? pos.title}
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                          {getTranslation(c, pos.desc) ?? pos.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                        <MapPin className="h-3 w-3" />
                        {getTranslation(c, pos.location) ?? pos.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Clock className="h-3 w-3" />
                        {getTranslation(c, pos.type) ?? pos.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {c?.ctaTitle ?? 'لم تجد المنصب المناسب؟'}
            </h3>
            <p className="text-primary-100/80 mb-6 max-w-xl mx-auto">
              {c?.ctaDesc ?? 'نحن نبحث دائماً عن المواهب الاستثنائية. أرسل لنا سيرتك الذاتية وملف أعمالك.'}
            </p>
            <a
              href="mailto:careers@sakandz.com"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-primary-700 shadow-lg transition-all hover:bg-primary-50"
            >
              {c?.ctaButton ?? 'إرسال السيرة الذاتية'}
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          {/* Back Home */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-200 px-8 py-3.5 text-base font-bold text-zinc-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
            >
              {c?.backToHome ?? 'العودة إلى الصفحة الرئيسية'}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}