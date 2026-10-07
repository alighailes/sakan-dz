import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Shield, Scale, Sparkles } from 'lucide-react'
import { useLocale } from '@/i18n'

const sections = [
  {
    number: 1,
    title: 'legal.terms.section1',
    content: 'legal.terms.content1',
    icon: FileText,
  },
  {
    number: 2,
    title: 'legal.terms.section2',
    content: 'legal.terms.content2',
    icon: Shield,
  },
  {
    number: 3,
    title: 'legal.terms.section3',
    content: 'legal.terms.content3',
    icon: Scale,
  },
  {
    number: 4,
    title: 'legal.terms.section4',
    content: 'legal.terms.content4',
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

export function TermsPage() {
  const { t } = useLocale()
  const l = t.legal?.terms

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
            <span>{l?.badge ?? 'شروط الاستخدام'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {l?.heroTitle ?? 'شروط استخدام منصة سكن DZ'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {l?.heroSubtitle ?? 'يرجى قراءة هذه الشروط بعناية قبل استخدام المنصة. استمراركم في التصفح يعني قبولكم لها.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {sections.map((section) => (
            <div
              key={section.number}
              className={`relative group flex gap-6`}
            >
              <div className="relative flex shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {section.number}
                </div>
                {section.number < sections.length && (
                  <div className="absolute top-14 bottom-0 start-6 w-0.5 bg-zinc-200 dark:bg-zinc-700" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <section.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  {getTranslation(l, section.title) ?? section.title}
                </h2>
                <div className="mt-4 prose prose-zinc dark:prose-invert max-w-none">
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {getTranslation(l, section.content) ?? section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="mt-12 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {l?.lastUpdated ?? 'آخر تحديث: يناير 2026'}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
          >
            {l?.backToHome ?? 'العودة إلى الصفحة الرئيسية'}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}