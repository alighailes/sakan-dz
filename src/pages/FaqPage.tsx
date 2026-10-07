import { useState } from 'react'
import { ArrowRight, ChevronDown, Search, Sparkles } from 'lucide-react'
import { useLocale } from '@/i18n'

interface FAQ {
  question: string
  answer: string
}

export function FaqPage() {
  const { t } = useLocale()
  const f = t.faq

  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQ[] = [
    {
      question: f?.q1 ?? 'ما هو الفرق بين العقد التوثيقي وعقد الشيوع؟',
      answer: f?.a1 ?? 'العقد التوثيقي (Acte Notarié) هو عقد رسمي يحرره موثق، يسجل في الدفتر العقاري، ويمنح ملكية كاملة ومحمية قانونياً. عقد الشيوع (Indivision) يعني ملكية مشتركة غير مقسمة، ولا يمنح ملكية فردية للعقار، وصعب التمويل البنكي عليه.',
    },
    {
      question: f?.q2 ?? 'كيف يتم التحقق من صحة الوثائق العقارية؟',
      answer: f?.a2 ?? 'فريق سكن DZ يتحقق من: 1) وجود العقد التوثيقي، 2) الدفتر العقاري (Livret Foncier)، 3) شهادة السلبية (Certificat de Négativité) الصادرة عن المحافظة العقارية، 4) مطابقة صاحب الإعلان مع المالك في الوثائق.',
    },
    {
      question: f?.q3 ?? 'هل استخدام منصة سكن DZ مجاني للأفراد؟',
      answer: f?.a3 ?? 'نعم، التصفح والبحث وحفظ المفضلة وإنشاء تنبيهات الأسعار مجاني 100% للأفراد. الرسوم تطبق فقط على: ترقية الإعلان لـ VIP، ونشر الإعلانات للوكالات (حسب الباقة).',
    },
    {
      question: f?.q4 ?? 'كيف يمكنني إدراج عقاري التجاري أو الفلاحي؟',
      answer: f?.a4 ?? 'من صفحة "أضف إعلاناً" اختر نوع العقار "تجاري" أو "أرض فلاحية". ستظهر حقول مخصصة: النشاط التجاري، الرخصة، المساحة الإجمالية، الواجهة، وغيرها. التوثيق مطلوب بنفس صرامة العقارات السكنية.',
    },
    {
      question: f?.q5 ?? 'كيف أحسب الرسوم وأتعاب الموثق في الجزائر؟',
      answer: f?.a5 ?? 'أتعاب الموثق تتراوح بين 3% و 5% من قيمة العقار (تتناقص تدريجياً مع ارتفاع السعر). تضاف إليها: حقوق التسجيل (1-2%)، الضريبة على القيمة المضافة (19% على الأتعاب)، ورسوم المحافظة العقارية. المجموع تقريباً 5-7% من السعر.',
    },
    {
      question: f?.q6 ?? 'ما هي شروط الحصول على قرض بنكي للسكن في الجزائر؟',
      answer: f?.a6 ?? 'الشروط الأساسية: 1) أن تكون جزائري الجنسية، 2) ألا يتجاوز عمرك 70 سنة عند نهاية القرض، 3) دخل شهري ثابت (راتب أو مهنة حرة)، 4) دفعة أولى 10-30%، 5) عقار بوثائق قانونية كاملة (عقد توثيقي + دفتر عقاري).',
    },
    {
      question: f?.q7 ?? 'ما الفرق بين المرابحة والإجارة المنتهية بالتمليك؟',
      answer: f?.a7 ?? 'المرابحة: البنك يشتري العقار ويبيعه لك بهامش ربح متفق عليه، تدفعه أقساطاً. الإجارة المنتهية بالتمليك: البنك يشتري العقار ويؤجره لك، مع وعد بنقل الملكية في نهاية المدة. كلاهما بدون فائدة ربوية.',
    },
    {
      question: f?.q8 ?? 'كيف أبلغ عن إعلان مشبوه أو احتيالي؟',
      answer: f?.a8 ?? 'في صفحة الإعلان اضغط على "إبلاغ" (أيقونة العلم). حدد السبب: صور مزيفة، سعر غير واقعي، طلب تحويل مالي مسبق، وثائق ناقصة. فريق المراجعة يتحقق خلال 24 ساعة.',
    },
  ]

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <span>{f?.badge ?? 'الأسئلة الشائعة'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {f?.heroTitle ?? 'مركز المساعدة — الأسئلة الشائعة'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {f?.heroSubtitle ?? 'ابحث عن إجابات سريعة للأسئلة الأكثر تكراراً حول العقارات، التمويل، والمنصة.'}
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder={f?.searchPlaceholder ?? 'ابحث في الأسئلة...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className={`border-b border-zinc-200 last:border-0 dark:border-zinc-800 ${openIndex === index ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''}`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-right sm:text-left flex items-center justify-between gap-4"
                >
                  <span className="font-medium text-zinc-900 dark:text-white text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 transition-transform duration-200 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 pr-4 text-zinc-600 dark:text-zinc-300 leading-relaxed animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
              <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">
                {f?.noResults ?? 'لا توجد نتائج مطابقة'}
              </h3>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                {f?.noResultsHint ?? 'جرب كلمات بحث أخرى أو تواصل مع الدعم.'}
              </p>
            </div>
          )}
        </div>

        {/* Still need help */}
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            {f?.stillNeedHelp ?? 'ما زلت بحاجة للمساعدة؟'}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-xl mx-auto">
            {f?.stillNeedHelpDesc ?? 'فريق الدعم جاهز للإجابة على استفساراتك. تواصل معنا مباشرة.'}
          </p>
          <a
            href="mailto:support@sakandz.com"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
          >
            <ArrowRight className="h-5 w-5" />
            {f?.contactSupport ?? 'تواصل مع الدعم'}
          </a>
        </div>
      </section>
    </div>
  )
}