import { useState } from 'react'
import { ArrowRight, CheckCircle, Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react'
import { useLocale } from '@/i18n'
import { WILAYAS } from '@/constants'

export function ContactPage() {
  const { locale, t } = useLocale()
  const c = t.contact

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    wilaya: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setFormData({ fullName: '', phone: '', email: '', wilaya: '', subject: '', message: '' })
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      locale === 'ar'
        ? 'مرحباً، أود التواصل مع فريق سكن DZ.'
        : 'Bonjour, je souhaite contacter l\'équipe Sakan DZ.'
    )
    window.open(`https://wa.me/213550000000?text=${message}`, '_blank')
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
            <span>{c?.badge ?? 'تواصل معنا'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {c?.heroTitle ?? 'نحن هنا للمساعدة'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
            {c?.heroSubtitle ?? 'فريق الدعم متاح للإجابة على استفساراتكم. املأ النموذج أو تواصل معنا مباشرة.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              {c?.formTitle ?? 'أرسل لنا رسالة'}
            </h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                  {c?.successTitle ?? 'تم إرسال رسالتك بنجاح!'}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  {c?.successDesc ?? 'سيعود فريقنا إليكم في أقرب وقت ممكن.'}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-bold text-white transition-all hover:bg-primary-700"
                >
                  {c?.sendAnother ?? 'إرسال رسالة أخرى'}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      {c?.fullNameLabel ?? 'الاسم الكامل'}
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      {c?.phoneLabel ?? 'رقم الهاتف'}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      placeholder="+213 5XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      {c?.emailLabel ?? 'البريد الإلكتروني'}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="wilaya" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      {c?.wilayaLabel ?? 'الولاية'}
                    </label>
                    <select
                      id="wilaya"
                      name="wilaya"
                      value={formData.wilaya}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="">{c?.selectWilaya ?? 'اختر الولاية'}</option>
                      {WILAYAS.map((w) => (
                        <option key={w.id} value={w.id}>
                          {locale === 'ar' ? w.nameAr : w.name} ({w.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {c?.subjectLabel ?? 'موضوع الرسالة'}
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="">{c?.selectSubject ?? 'اختر الموضوع'}</option>
                    <option value="general">{c?.subjectGeneral ?? 'استفسار عام'}</option>
                    <option value="technical">{c?.subjectTechnical ?? 'دعم تقني'}</option>
                    <option value="listing">{c?.subjectListing ?? 'مشكلة في إعلان'}</option>
                    <option value="partnership">{c?.subjectPartnership ?? 'شراكة / وكالة'}</option>
                    <option value="legal">{c?.subjectLegal ?? 'استفسار قانوني'}</option>
                    <option value="other">{c?.subjectOther ?? 'أخرى'}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {c?.messageLabel ?? 'نص الرسالة'}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 resize-none"
                    placeholder={c?.messagePlaceholder ?? 'اكتب رسالتك هنا...'}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-glow"
                >
                  <Send className="h-5 w-5" />
                  {c?.submitBtn ?? 'إرسال الرسالة'}
                </button>
              </form>
            )}
          </div>

          {/* Direct Contact Info */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-50/50 p-8 dark:border-emerald-900/30 dark:bg-emerald-950/30">
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                {c?.directTitle ?? 'التواصل المباشر'}
              </h2>
              <div className="space-y-4">
                <a
                  href="mailto:contact@sakandz.com"
                  className="flex items-center gap-3 rounded-xl bg-white/70 p-4 transition-all hover:bg-white hover:shadow-soft dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{c?.emailLabel ?? 'البريد الإلكتروني'}</p>
                    <p className="font-medium text-zinc-900 dark:text-white">contact@sakandz.com</p>
                  </div>
                </a>
                <a
                  href="tel:+213550000000"
                  className="flex items-center gap-3 rounded-xl bg-white/70 p-4 transition-all hover:bg-white hover:shadow-soft dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{c?.phoneLabel ?? 'الهاتف'}</p>
                    <p className="font-medium text-zinc-900 dark:text-white">+213 550 000 000</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 rounded-xl bg-white/70 p-4 dark:bg-zinc-800/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{c?.addressLabel ?? 'المقر'}</p>
                    <p className="font-medium text-zinc-900 dark:text-white">{c?.addressValue ?? 'الجزائر العاصمة، الجزائر'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Chat */}
            <button
              onClick={handleWhatsApp}
              className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-center shadow-lg transition-all hover:bg-emerald-700 hover:shadow-glow"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <span className="text-xl">💬</span>
                </div>
                <div className="text-left">
                  <p className="text-sm text-emerald-100">{c?.whatsappLabel ?? 'محادثة واتساب سريعة'}</p>
                  <p className="font-bold text-white">{c?.whatsappDesc ?? 'تواصل مع الدعم مباشرة'}</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}