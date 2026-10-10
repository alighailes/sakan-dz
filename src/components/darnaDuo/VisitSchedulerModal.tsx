import { useState } from 'react'
import { X, Calendar, Clock, Download, MessageCircle, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLocale } from '@/i18n'
import type { Property } from '@/types'

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00'
]

interface VisitSchedulerModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property
  onSchedule: (visitAt: string, notes: string) => void
  loading?: boolean
}

export function VisitSchedulerModal({
  isOpen,
  onClose,
  property,
  onSchedule,
  loading = false,
}: VisitSchedulerModalProps) {
  const { locale } = useLocale()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<'datetime' | 'confirm'>('datetime')

  const generateICS = (start: Date, end: Date, title: string, description: string, location?: string): string => {
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@darna-duo`
    const now = formatDate(new Date())

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Darna Duo//Visit Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      location ? `LOCATION:${location}` : '',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n')
  }

  const downloadICS = () => {
    if (!date || !time) return
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)
    const start = new Date(year, month - 1, day, hours, minutes)
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    const title = locale === 'ar' ? `معاينة: ${property.title}` : `Visite: ${property.title}`
    const description = locale === 'ar'
      ? `معاينة للعقار: ${property.title}\n${notes ? `ملاحظات: ${notes}` : ''}`
      : `Visite du bien: ${property.title}\n${notes ? `Notes: ${notes}` : ''}`
    const location = property.address ? `${property.address}, ${property.commune}` : property.commune

    const icsContent = generateICS(start, end, title, description, location)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `darna-duo-visite-${property.id}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getGoogleCalendarUrl = () => {
    if (!date || !time) return ''
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)
    const start = new Date(year, month - 1, day, hours, minutes)
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    const formatForGoogle = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const title = encodeURIComponent(locale === 'ar' ? `معاينة: ${property.title}` : `Visite: ${property.title}`)
    const details = encodeURIComponent(locale === 'ar'
      ? `معاينة للعقار: ${property.title}\n${notes ? `ملاحظات: ${notes}` : ''}`
      : `Visite du bien: ${property.title}\n${notes ? `Notes: ${notes}` : ''}`)
    const location = encodeURIComponent(property.address ? `${property.address}, ${property.commune}` : property.commune || '')

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatForGoogle(start)}/${formatForGoogle(end)}&details=${details}&location=${location}`
  }

  const handleShareWhatsApp = () => {
    if (!date || !time) return
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)
    const visitDate = new Date(year, month - 1, day, hours, minutes)
    const formattedDate = visitDate.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    const address = property.address ? `${property.address}, ${property.commune}` : property.commune || ''
    const propertyLink = `${window.location.origin}/property/${property.id}`

    const message = locale === 'ar'
      ? `موعد معاينة عقار ${address} مبرمج يوم ${formattedDate} على الساعة ${formattedTime}. رابط الإعلان: ${propertyLink}`
      : `Rendez-vous de visite pour ${address} programmé le ${formattedDate} à ${formattedTime}. Lien de l'annonce: ${propertyLink}`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
  }

  const handleConfirm = () => {
    if (!date || !time) return
    setStep('confirm')
  }

  const handleFinalSchedule = () => {
    if (!date || !time) return
    const visitAt = `${date}T${time}:00`
    onSchedule(visitAt, notes)
    onClose()
  }

  if (!isOpen) return null

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white/70 dark:bg-zinc-900/70 shadow-2xl animate-scale-in backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-white/20 dark:border-zinc-800/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {locale === 'ar' ? 'جدولة موعد معاينة' : 'Planifier une visite'}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[280px]">
              {property.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors"
            aria-label={locale === 'ar' ? 'إغلاق' : 'Fermer'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'datetime' ? (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {locale === 'ar' ? 'التاريخ' : 'Date'}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={minDate}
                    className="pl-10 bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {locale === 'ar' ? 'الوقت' : 'Heure'}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none appearance-none cursor-pointer"
                    disabled={!date}
                  >
                    <option value="" disabled>
                      {locale === 'ar' ? 'اختر وقتاً' : 'Choisir une heure'}
                    </option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
                {!date && (
                  <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                    {locale === 'ar' ? 'اختر التاريخ أولاً' : 'Sélectionnez d\'abord la date'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {locale === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optionnel)'}
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={locale === 'ar' ? 'مثال: الالتقاء أمام المسجد، مع الموثق/الوكيل...' : 'Ex: Rendez-vous devant la mosquée, avec le notaire/l\'agent...'}
                  className="resize-none bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 focus:border-primary-500 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/20 dark:border-zinc-800/50">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1.5" onClick={downloadICS} disabled={!date || !time}>
                  <Download className="h-4 w-4" />
                  {locale === 'ar' ? 'تصدير .ics' : 'Exporter .ics'}
                </Button>
                <Button variant="outline" className="flex-1 gap-1.5" onClick={() => window.open(getGoogleCalendarUrl(), '_blank')} disabled={!date || !time}>
                  <Calendar className="h-4 w-4" />
                  {locale === 'ar' ? 'Google Calendar' : 'Google Calendar'}
                </Button>
              </div>

              <Button variant="outline" className="w-full gap-1.5" onClick={handleShareWhatsApp} disabled={!date || !time}>
                <MessageCircle className="h-4 w-4" />
                {locale === 'ar' ? 'مشاركة عبر واتساب' : 'Partager via WhatsApp'}
              </Button>

              <Button
                className="w-full"
                size="lg"
                onClick={handleConfirm}
                disabled={loading || !date || !time}
              >
                {loading ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {locale === 'ar' ? 'جارٍ الحفظ...' : 'Enregistrement...'}
                  </>
                ) : (
                  locale === 'ar' ? 'تأكيد الموعد' : 'Confirmer le rendez-vous'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/50 dark:bg-emerald-900/30">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {locale === 'ar' ? 'تم تأكيد الموعد!' : 'Rendez-vous confirmé !'}
            </h4>
            <div className="rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 p-4 text-sm">
              <p className="text-zinc-700 dark:text-zinc-300">
                {locale === 'ar'
                  ? `📅 ${date} — 🕐 ${time}`
                  : `📅 ${date} — 🕐 ${time}`}
              </p>
              {notes && (
                <p className="mt-2 text-zinc-500 dark:text-zinc-400 italic">
                  {locale === 'ar' ? '📝 ' : '📝 '}{notes}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-white/20 dark:border-zinc-800/50">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1.5" onClick={downloadICS}>
                  <Download className="h-4 w-4" />
                  {locale === 'ar' ? 'تصدير .ics' : 'Exporter .ics'}
                </Button>
                <Button variant="outline" className="flex-1 gap-1.5" onClick={() => window.open(getGoogleCalendarUrl(), '_blank')}>
                  <Calendar className="h-4 w-4" />
                  {locale === 'ar' ? 'Google Calendar' : 'Google Calendar'}
                </Button>
              </div>

              <Button variant="outline" className="w-full gap-1.5" onClick={handleShareWhatsApp}>
                <MessageCircle className="h-4 w-4" />
                {locale === 'ar' ? 'مشاركة عبر واتساب' : 'Partager via WhatsApp'}
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setStep('datetime')}>
                  {locale === 'ar' ? 'تعديل' : 'Modifier'}
                </Button>
                <Button className="flex-1" onClick={handleFinalSchedule} disabled={loading}>
                  {loading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {locale === 'ar' ? 'جارٍ الحفظ...' : 'Enregistrement...'}
                    </>
                  ) : (
                    locale === 'ar' ? 'حفظ وإغلاق' : 'Enregistrer et fermer'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}