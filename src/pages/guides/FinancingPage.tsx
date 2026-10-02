import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Banknote, Shield, Sparkles } from 'lucide-react'
import { useLocale } from '@/i18n'

interface Bank {
  name: string
  desc: string
}

export function FinancingPage() {
  const { locale, t } = useLocale()
  const g = t.guides?.financing

  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [duration, setDuration] = useState('25')

  const income = parseFloat(monthlyIncome) || 0
  const down = parseFloat(downPayment) || 0
  const years = parseInt(duration) || 25

  const maxMonthly = income * 0.35
  const months = years * 12
  const monthlyRate = 0.025 / 12
  const financingAmount = maxMonthly * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate)
  const totalBudget = financingAmount + down

  const banks: Bank[] = [
    { name: g?.banksList?.[0]?.name ?? 'CNEP Banque', desc: g?.banksList?.[0]?.desc ?? 'الصندوق الوطني للتوفير والاحتياط - عروض مرابحة تنافسية' },
    { name: g?.banksList?.[1]?.name ?? 'BNA (البنك الوطني الجزائري)', desc: g?.banksList?.[1]?.desc ?? 'برامج مرابحة للسكن والترقوي مع فترات سداد مرنة' },
    { name: g?.banksList?.[2]?.name ?? 'بنك البركة Algérie', desc: g?.banksList?.[2]?.desc ?? 'مصرف إسلامي متخصص في المرابحة والإجارة المنتهية بالتمليك' },
    { name: g?.banksList?.[3]?.name ?? 'بنك السلام Algérie', desc: g?.banksList?.[3]?.desc ?? 'خدمات تمويل إسلامي متوافقة مع الشريعة للسكن والعقار' },
    { name: g?.banksList?.[4]?.name ?? 'BDL (بنك التنمية المحلية)', desc: g?.banksList?.[4]?.desc ?? 'عروض مرابحة للسكن الريفي والترقوي العمومي' },
  ]

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(Math.round(num))
  }

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
            <span>{g?.badge ?? 'دليل التمويل والمرابحة'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {g?.heroTitle ?? 'دليلك للتمويل العقاري والمرابحة الإسلامية في الجزائر'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {g?.heroSubtitle ?? 'افهم خياراتك التمويلية: القرض الكلاسيكي، السعر الموجه، والمرابحة، واختر الأنسب لوضعك.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Conventional Loan */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <Banknote className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {g?.conventionalTitle ?? 'القرض العقاري الكلاسيكي (السعر الموجه)'}
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300">
            {g?.conventionalDesc ?? 'قرض مدعوم من الدولة لبرامج السكن (السكن الريفي، الترقوي، العمومي) بفائدة مخفضة (~1-3%) تصل لـ 25-30 سنة.'}
          </p>
        </div>

        {/* Islamic Financing */}
        <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-50/50 p-8 dark:border-emerald-900/30 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {g?.islamicTitle ?? 'التمويل الإسلامي (المرابحة والإجارة المنتهية بالتمليك)'}
            </h2>
          </div>
          <p className="text-emerald-800 dark:text-emerald-200">
            {g?.islamicDesc ?? 'البنك يشتري العقار ويبيعه لك بهامش ربح متفق عليه، أو يؤجره لك مع وعد بالتمليك في النهاية. بدون فائدة ربوية.'}
          </p>
        </div>

        {/* Banks */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
            {g?.banksTitle ?? 'البنوك المقدمة للمرابحة في الجزائر'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {banks.map((bank, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
                <h4 className="font-bold text-zinc-900 dark:text-white">{bank.name}</h4>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{bank.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calculator */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-gradient-to-r from-primary-50 to-emerald-50 p-8 dark:border-zinc-800 dark:from-primary-950/30 dark:to-emerald-950/30">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            {g?.calculatorTitle ?? 'حاسبة التمويل التقديرية'}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {g?.calculatorDesc ?? 'أدخل بياناتك للحصول على تقدير فوري لقدرتك التمويلية والقسط الشهري.'}
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {g?.monthlyIncomeLabel ?? 'الدخل الشهري الصافي (دج)'}
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {g?.downPaymentLabel ?? 'الدفعة الأولى المتاحة (دج)'}
              </label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="1000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {g?.durationLabel ?? 'مدة السداد (سنة)'}
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {Array.from({ length: 26 }, (_, i) => i + 5).map((year) => (
                  <option key={year} value={String(year)}>
                    {year} {locale === 'ar' ? 'سنة' : 'ans'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(income > 0 || down > 0) && (
            <div className="mt-8 rounded-xl bg-white/80 p-6 dark:bg-zinc-800/50">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                {g?.calculatorTitle ?? 'نتيجة الحساب'}
              </h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-900/30">
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    {g?.maxMonthlyPayment ?? 'أقصى قسط شهري مسموح (35% من الدخل)'}
                  </p>
                  <p className="text-2xl font-bold text-primary-900 dark:text-primary-100 mt-1">
                    {formatNumber(maxMonthly)} دج
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/30">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {g?.estimatedFinancing ?? 'مبلغ التمويل التقديري'}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                    {formatNumber(financingAmount)} دج
                  </p>
                </div>
                <div className="rounded-lg bg-accent-50 p-4 dark:bg-accent-900/30">
                  <p className="text-sm text-accent-700 dark:text-accent-300">
                    {locale === 'ar' ? 'إجمالي الميزانية' : 'Budget total'}
                  </p>
                  <p className="text-2xl font-bold text-accent-900 dark:text-accent-100 mt-1">
                    {formatNumber(totalBudget)} دج
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                {g?.disclaimer ?? 'حساب تقديري مبسط. الشروط النهائية تحددها البنك حسب ملفك وملاءتك.'}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
          >
            {g?.ctaText ?? 'تواصل مع بنك معتمد'}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}