import { Phone, MessageCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Property } from '@/types'

interface ContactButtonsProps {
  property: Property
  showPhone?: boolean
}

/** Read seller phone from property data with legacy fallbacks. */
export function getPropertyPhone(property: Property): string | undefined {
  const anyProp = property as unknown as Record<string, unknown>
  const profiles = anyProp.profiles as Record<string, unknown> | undefined
  const candidates: unknown[] = [
    anyProp.phone,
    anyProp.phone_number,
    profiles?.phone,
    profiles?.phone_number,
    property.ownerPhone,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim() !== '') return c.trim()
  }
  return undefined
}

function cleanAlgerianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 10) {
    return `+213${digits.slice(1)}`
  }
  if (digits.startsWith('213') && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`
  }
  return phone
}

/** Convert 0550123456 / +213550123456 -> 213550123456 for wa.me links. */
export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 10) {
    return `213${digits.slice(1)}`
  }
  if (digits.startsWith('213')) {
    return digits
  }
  return digits
}

export function ContactButtons({ property, showPhone = true }: ContactButtonsProps) {
  const { locale, t } = useLocale()

  const rawPhone = getPropertyPhone(property)

  const priceLabel = property.operationType === 'vacation' && property.pricePerNight
    ? `${formatPrice(property.pricePerNight, property.currency)} ${t.property.perNight}`
    : property.operationType === 'rent'
      ? `${formatPrice(property.price, property.currency)} ${t.property.perMonth}`
      : formatPrice(property.price, property.currency)

  const whatsappMessage = locale === 'ar'
    ? `سلام عليكم، أنا مهتم بعقارك المعروض على سكن DZ: ${property.title} - ${priceLabel}`
    : `Bonjour, je suis intéressé par votre bien sur Sakan DZ: ${property.title} - ${priceLabel}`

  if (!rawPhone) {
    return (
      <div className="flex gap-2">
        <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          <Phone className="h-4 w-4" />
          {locale === 'ar' ? 'رقم الهاتف غير متوفر' : 'Numéro indisponible'}
        </span>
      </div>
    )
  }

  const cleanedPhone = cleanAlgerianPhone(rawPhone)
  const waPhone = formatPhoneForWhatsApp(rawPhone)
  const encodedMessage = encodeURIComponent(whatsappMessage)

  return (
    <div className="flex gap-2">
      <a
        href={`https://wa.me/${waPhone}?text=${encodedMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: 'whatsapp' }), 'flex-1 gap-2')}
      >
        <MessageCircle className="h-4 w-4" />
        {t.property.whatsApp}
      </a>
      {showPhone && (
        <a
          href={`tel:${cleanedPhone}`}
          className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 gap-2')}
        >
          <Phone className="h-4 w-4" />
          {t.property.callNow}
        </a>
      )}
    </div>
  )
}
