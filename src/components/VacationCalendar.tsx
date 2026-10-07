import { useState, useMemo } from 'react'
import { Calendar, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { formatDZD, formatCentimes } from '@/lib/currencyUtils'
import { useCurrencyStore } from '@/stores/currencyStore'
import type { Property } from '@/types'

interface VacationCalendarProps {
  property: Property
}

export function VacationCalendar({ property }: VacationCalendarProps) {
  const { locale } = useLocale()
  const { mode } = useCurrencyStore()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const bookedDates = property.bookedDates || []

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = end.getTime() - start.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [checkIn, checkOut])

  const cleaningFee = property.cleaningFee || 0
  const total = nights * (property.pricePerNight || property.price) + cleaningFee

  const handleWhatsApp = () => {
    if (!property.ownerPhone) return
    const phone = property.ownerPhone.replace(/\D/g, '')
    const intlPhone = phone.startsWith('0') ? `213${phone.slice(1)}` : phone
    const message = locale === 'ar'
      ? `سلام عليكم، أود حجز العقار من ${checkIn} إلى ${checkOut} (المجموع: ${formatDZD(total, property.currency)})`
      : `Bonjour, je souhaite réserver du ${checkIn} au ${checkOut} (Total: ${formatDZD(total, property.currency)})`
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <Calendar className="h-5 w-5 text-primary-600" />
        {locale === 'ar' ? 'حجز العطل' : 'Réserver'}
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              {locale === 'ar' ? 'تاريخ الدخول' : 'Check-in'}
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              {locale === 'ar' ? 'تاريخ الخروج' : 'Check-out'}
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {bookedDates.length > 0 && (
          <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {locale === 'ar' ? 'التواريخ المحجوزة:' : 'Dates réservées:'} {bookedDates.join(', ')}
          </div>
        )}

        {nights > 0 && (
          <div className="space-y-2 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {nights} {locale === 'ar' ? 'ليلة' : 'nuit(s)'} x {formatDZD(property.pricePerNight || property.price, property.currency)}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDZD(nights * (property.pricePerNight || property.price), property.currency)}
              </span>
            </div>
            {cleaningFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {locale === 'ar' ? 'رسوم التنظيف' : 'Frais de ménage'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDZD(cleaningFee, property.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white">
                {locale === 'ar' ? 'المجموع' : 'Total'}
              </span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatDZD(total, property.currency)}
              </span>
            </div>
            {mode === 'centimes' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {formatCentimes(total, locale)}
              </p>
            )}
          </div>
        )}

        <Button
          className="w-full gap-2"
          onClick={handleWhatsApp}
          disabled={!checkIn || !checkOut || nights === 0}
        >
          <MessageCircle className="h-4 w-4" />
          {locale === 'ar' ? 'استفسار عبر واتساب' : 'Demander sur WhatsApp'}
        </Button>
      </div>
    </div>
  )
}
