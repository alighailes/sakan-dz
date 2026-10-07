import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Home, Shield, Search, Sparkles, Truck } from 'lucide-react'
import { useLocale } from '@/i18n'

interface Step {
  number: number
  title: string
  desc: string
  icon: typeof Sparkles
}

export function FirstTimeBuyerPage() {
  const { locale, t } = useLocale()
  const isRTL = locale === 'ar'
  const g = t.guides?.firstTimeBuyer

  const steps: Step[] = [
    {
      number: 1,
      title: g?.step1Title ?? 'تحديد الميزانية',
      desc: g?.step1Desc ?? 'احسب قدرتك الشرائية مع إضافة رسوم الموثق (3-5%)، الضرائب، وتكاليف النقل.',
      icon: Sparkles,
    },
    {
      number: 2,
      title: g?.step2Title ?? 'فحص الوضع القانوني',
      desc: g?.step2Desc ?? 'تأكد من وجود العقد التوثيقي، الدفتر العقاري، وشهادة السلبية المطابقة.',
      icon: Shield,
    },
    {
      number: 3,
      title: g?.step3Title ?? 'الزيارة الميدانية',
      desc: g?.step3Desc ?? 'افحص شبكات الماء، الغاز، الكهرباء، العزل، وهدوء الحي في أوقات مختلفة.',
      icon: Search,
    },
    {
      number: 4,
      title: g?.step4Title ?? 'إبرام الوعد بالبيع',
      desc: g?.step4Desc ?? 'وقّع الوعد بالبيع (Promesse de vente) وادفع العربون عند الموثق حصراً.',
      icon: Home,
    },
    {
      number: 5,
      title: g?.step5Title ?? 'عقد البيع النهائي',
      desc: g?.step5Desc ?? 'أكمل الإجراءات لدى الموثق، سجّل العقد، واستلم المفاتيح رسمياً.',
      icon: Truck,
    },
  ]

  const tips = [
    g?.tip1 ?? 'لا تشترِ بعقد عرفي أو ورقة غير موثقة مهما بدا السعر مغرياً.',
    g?.tip2 ?? 'تأكد من تطابق شهادة السلبية مع الواقع القانوني للعقار.',
    g?.tip3 ?? 'لا تدفع العربون للبائع مباشرة، فقط للموثق في حساب أمانة.',
    g?.tip4 ?? 'استعن بموثق تثق به لمراجعة كل البنود قبل التوقيع.',
    g?.tip5 ?? 'تحقق من خلو العقار من الرهون أو الحجوزات عبر شهادة السلبية.',
  ]

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
            <CheckCircle className="h-4 w-4" />
            <span>{g?.badge ?? 'دليل المشتري لأول مرة'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {g?.heroTitle ?? 'دليلك الشامل لشراء أول عقار في الجزائر'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {g?.heroSubtitle ?? 'افهم كل خطوة من تحديد الميزانية إلى استلام المفاتيح، وتجنب المخاطر القانونية الشائعة.'}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`relative group flex gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <div className="relative flex shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-14 bottom-0 start-6 w-0.5 bg-zinc-200 dark:bg-zinc-700" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  {step.desc}
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <step.icon className="h-8 w-8 text-primary-500 dark:text-primary-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Golden Tips */}
        <div className="mt-16 rounded-2xl border border-emerald-400/30 bg-emerald-50/50 p-8 dark:border-emerald-900/30 dark:bg-emerald-950/30">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            <Sparkles className="h-6 w-6" />
            {g?.tipsTitle ?? 'نصائح ذهبية لتفادي المخاطر'}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl bg-white/70 p-4 dark:bg-zinc-800/50">
                <CheckCircle className="mt-0.5 shrink-0 h-5 w-5 text-emerald-500" />
                <span className="text-zinc-700 dark:text-zinc-300">
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/listings?legalStatus=acte_livret"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
          >
            {g?.ctaText ?? 'تصفح العقارات الموثقة الآن'}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="border-t border-zinc-200 bg-zinc-50/50 py-12 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {g?.legalNoticeTitle ?? 'ملاحظة قانونية هامة'}
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            {g?.legalNoticeDesc ?? 'هذا الدليل للأغراض المعلوماتية فقط ولا يغني عن استشارة موثق أو محامٍ مختص. الأسعار والنسب المذكورة تقريبية وقابلة للتغير وفق القوانين الجاري بها العمل.'}
          </p>
        </div>
      </section>
    </div>
  )
}