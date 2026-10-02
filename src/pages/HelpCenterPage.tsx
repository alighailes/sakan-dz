import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Calculator, Home, Search, Shield, Sparkles, Users } from 'lucide-react'
import { useLocale } from '@/i18n'

const categories = [
  {
    title: 'helpCenter.cat1.title',
    desc: 'helpCenter.cat1.desc',
    link: 'helpCenter.cat1.link',
    icon: Home,
    href: '/publish',
  },
  {
    title: 'helpCenter.cat2.title',
    desc: 'helpCenter.cat2.desc',
    link: 'helpCenter.cat2.link',
    icon: Shield,
    href: '/faq',
  },
  {
    title: 'helpCenter.cat3.title',
    desc: 'helpCenter.cat3.desc',
    link: 'helpCenter.cat3.link',
    icon: BookOpen,
    href: '/guides/first-time-buyer',
  },
  {
    title: 'helpCenter.cat4.title',
    desc: 'helpCenter.cat4.desc',
    link: 'helpCenter.cat4.link',
    icon: Users,
    href: '/agents',
  },
]

const popularArticles = [
  { title: 'helpCenter.article1', href: '/publish' },
  { title: 'helpCenter.article2', href: '/faq' },
  { title: 'helpCenter.article3', href: '/guides/first-time-buyer' },
  { title: 'helpCenter.article4', href: '/agents' },
  { title: 'helpCenter.article5', href: '/faq' },
  { title: 'helpCenter.article6', href: '/valuation' },
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

export function HelpCenterPage() {
  const { t } = useLocale()
  const h = t.helpCenter

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
            <span>{h?.badge ?? 'مركز المساعدة'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {h?.heroTitle ?? 'مركز مساعدة سكن DZ'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {h?.heroSubtitle ?? 'ابحث عن إجابات، تصفح الأدلة، وتواصل مع الدعم عند الحاجة.'}
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder={h?.searchPlaceholder ?? 'ابحث في مقالات المساعدة...'}
            className="w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
          {h?.categoriesTitle ?? 'أقسام المساعدة'}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={cat.href}
              className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft transition-all hover:border-primary-300 hover:shadow-soft-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 mb-4 dark:bg-primary-900/40 dark:text-primary-300">
                <cat.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                {getTranslation(h, cat.title) ?? cat.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                {getTranslation(h, cat.desc) ?? cat.desc}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
                {getTranslation(h, cat.link) ?? cat.link}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Articles */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
          {h?.popularTitle ?? 'المقالات الأكثر قراءة'}
        </h2>
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          {popularArticles.map((article, i) => (
            <Link
              key={i}
              to={article.href}
              className={`flex items-center justify-between px-6 py-4 border-b border-zinc-200 last:border-0 transition-colors hover:bg-primary-50/50 dark:border-zinc-800 dark:hover:bg-primary-900/20 ${i === popularArticles.length - 1 ? '' : ''}`}
            >
              <span className="font-medium text-zinc-900 dark:text-white">
                {getTranslation(h, article.title) ?? article.title}
              </span>
              <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-primary-600 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Tools */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
          {h?.toolsTitle ?? 'أدوات سريعة'}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/valuation"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft transition-all hover:border-primary-300 hover:shadow-soft-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 mb-4 dark:bg-primary-900/40 dark:text-primary-300">
              <Calculator className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              {h?.tool1Title ?? 'تقييم العقار'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {h?.tool1Desc ?? 'احسب السعر التقديري لعقارك فوراً.'}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
              {h?.tool1Link ?? 'جرب الآن'}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            to="/guides/financing"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft transition-all hover:border-primary-300 hover:shadow-soft-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              {h?.tool2Title ?? 'حاسبة التمويل'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {h?.tool2Desc ?? 'احسب قدرتك التمويلية والقسط الشهري.'}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {h?.tool2Link ?? 'احسب الآن'}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            to="/guides/first-time-buyer"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft transition-all hover:border-primary-300 hover:shadow-soft-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-700 mb-4 dark:bg-accent-900/40 dark:text-accent-300">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              {h?.tool3Title ?? 'دليل المشتري'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {h?.tool3Desc ?? 'خطوات شراء أول عقار بأمان.'}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent-600 dark:text-accent-400">
              {h?.tool3Link ?? 'اقرأ الدليل'}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Contact Support */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {h?.contactTitle ?? 'لم تجد ما تبحث عنه؟'}
          </h2>
          <p className="text-primary-100/80 mb-6 max-w-xl mx-auto">
            {h?.contactDesc ?? 'فريق الدعم متاح للمساعدة. راسلنا وسنرد عليك خلال 24 ساعة.'}
          </p>
          <a
            href="mailto:support@sakandz.com"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-primary-700 shadow-lg transition-all hover:bg-primary-50"
          >
            <ArrowRight className="h-5 w-5" />
            {h?.contactBtn ?? 'تواصل مع الدعم'}
          </a>
        </div>
      </section>
    </div>
  )
}