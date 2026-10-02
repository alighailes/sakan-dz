import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Calculator, Globe } from 'lucide-react'
import { useLocale } from '@/i18n'

export function HomeGuidesAndServices() {
  const { t } = useLocale()

  const authTitle = t?.home?.guides?.authTitle ?? 'حافظ على تنظيمك. سجّل الدخول أو أنشئ حساباً'
  const authSubtitle = t?.home?.guides?.authSubtitle ?? 'احفظ العقارات المفضلة، أنشئ تنبيهات مخصصة للأسعار، وتابع استفساراتك مع المعلنين.'
  const authCta = t?.home?.guides?.authCta ?? 'سجّل الدخول أو أنشئ حساباً'

  const guide1Title = t?.home?.guides?.guide1Title ?? 'أدلة للمشترين لأول مرة'
  const guide1Desc = t?.home?.guides?.guide1Desc ?? 'كن واثقاً مما يمكنك تحمله وافهم عملية الشراء والتوثيق خطوة بخطوة.'
  const guide1Link = t?.home?.guides?.guide1Link ?? 'ألقِ نظرة'

  const guide2Title = t?.home?.guides?.guide2Title ?? 'هل يمكن لصيغ التمويل مساعدتك في امتلاك منزل؟'
  const guide2Desc = t?.home?.guides?.guide2Desc ?? 'كل ما تحتاج معرفته عن القروض البنكية والمرابحة الإسلامية واشتراطاتها.'
  const guide2Link = t?.home?.guides?.guide2Link ?? 'ألقِ نظرة'

  const guide3Title = t?.home?.guides?.guide3Title ?? 'تقييم مجاني للعقار'
  const guide3Desc = t?.home?.guides?.guide3Desc ?? 'اكتشف متوسط سعر المتر المربع وقيمة عقارك السوقية في منطقتك.'
  const guide3Link = t?.home?.guides?.guide3Link ?? 'احصل على تقييم مجاني'

  const service1Title = t?.home?.guides?.service1Title ?? 'تقييم فوري عبر الإنترنت'
  const service1Desc = t?.home?.guides?.service1Desc ?? 'أسرع وأسهل طريقة لمعرفة قيمة منزلك'
  const service1Link = t?.home?.guides?.service1Link ?? 'احصل على تقييم فوري'

  const service2Title = t?.home?.guides?.service2Title ?? 'العقارات التجارية'
  const service2Desc = t?.home?.guides?.service2Desc ?? 'ابحث عن المحلات والمكاتب المعروضة للبيع والإيجار'
  const service2Link = t?.home?.guides?.service2Link ?? 'ابحث الآن'

  const service3Title = t?.home?.guides?.service3Title ?? 'عقارات الاصطياف والعطل'
  const service3Desc = t?.home?.guides?.service3Desc ?? 'ابحث عن شقق وشاليهات للإيجار القصير في المدن الساحلية'
  const service3Link = t?.home?.guides?.service3Link ?? 'ابحث الآن'

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Tier 1: Auth Prompt Card */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900 md:flex-row">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{authTitle}</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{authSubtitle}</p>
        </div>
        <Link
          to="/auth"
          className="shrink-0 rounded-xl border-2 border-primary-600 px-6 py-3 text-sm font-bold text-primary-600 transition-all hover:bg-primary-600 hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-zinc-950"
        >
          {authCta}
        </Link>
      </div>

      {/* Tier 2: Advice & Guides Grid */}
      <div className="my-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1 */}
        <Link
          to="/guides/first-time-buyer"
          className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-soft transition-all hover:shadow-soft-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop"
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-5">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">{guide1Title}</h4>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{guide1Desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
              {guide1Link}
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </span>
          </div>
        </Link>

        {/* Card 2 */}
        <Link
          to="/guides/financing"
          className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-soft transition-all hover:shadow-soft-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop"
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-5">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">{guide2Title}</h4>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{guide2Desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
              {guide2Link}
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </span>
          </div>
        </Link>

        {/* Card 3 */}
        <Link
          to="/valuation"
          className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-soft transition-all hover:shadow-soft-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop"
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-5">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">{guide3Title}</h4>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{guide3Desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
              {guide3Link}
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </span>
          </div>
        </Link>
      </div>

      {/* Tier 3: Quick Services Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Service 1 */}
        <Link
          to="/valuation"
          className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft transition-all hover:shadow-soft-lg hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
            <Calculator className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{service1Title}</h4>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{service1Desc}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
              {service1Link}
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            </span>
          </div>
        </Link>

        {/* Service 2 */}
        <Link
          to="/listings?type=commercial"
          className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft transition-all hover:shadow-soft-lg hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
            <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{service2Title}</h4>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{service2Desc}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {service2Link}
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            </span>
          </div>
        </Link>

        {/* Service 3 */}
        <Link
          to="/listings?operation=vacation"
          className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft transition-all hover:shadow-soft-lg hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-50 dark:bg-accent-900/30">
            <Globe className="h-6 w-6 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{service3Title}</h4>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{service3Desc}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent-600 dark:text-accent-400">
              {service3Link}
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}
