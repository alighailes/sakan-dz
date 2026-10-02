import { Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { formatPrice } from '@/lib/utils'
import type { Property } from '@/types'

interface ContactButtonsProps {
  property: Property
  showPhone?: boolean
}

function cleanAlgerianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 10) {
    return `+213${digits.slice(1)}`
  }
  if (digits.startsWith('213') && digits.length === 13) {
    return `+${digits}`
  }
  if (digits.startsWith('+213') && digits.length === 13) {
    return digits
  }
  return phone
}

export function ContactButtons({ property, showPhone = true }: ContactButtonsProps) {
  const { locale, t } = useLocale()

  const priceLabel = property.operationType === 'vacation' && property.pricePerNight
    ? `${formatPrice(property.pricePerNight, property.currency)} ${t.property.perNight}`
    : property.operationType === 'rent'
      ? `${formatPrice(property.price, property.currency)} ${t.property.perMonth}`
      : formatPrice(property.price, property.currency)

  const whatsappMessage = locale === 'ar'
    ? `سلام عليكم، أنا مهتم بعقارك المعروض على سكن DZ: ${property.title} - ${priceLabel}`
    : `Bonjour, je suis intéressé par votre bien sur Sakan DZ: ${property.title} - ${priceLabel}`

  const handleWhatsApp = () => {
    if (!property.ownerPhone) return
    const cleanedPhone = cleanAlgerianPhone(property.ownerPhone)
    const encodedMessage = encodeURIComponent(whatsappMessage)
    window.open(`https://wa.me/${cleanedPhone.replace('+', '')}?text=${encodedMessage}`, '_blank')
  }

  const handleCall = () => {
    if (!property.ownerPhone) return
    const cleanedPhone = cleanAlgerianPhone(property.ownerPhone)
    window.location.href = `tel:${cleanedPhone}`
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="whatsapp"
        className="flex-1 gap-2"
        onClick={handleWhatsApp}
        disabled={!property.ownerPhone}
      >
        <MessageCircle className="h-4 w-4" />
        {t.property.whatsApp}
      </Button>
      {showPhone && property.ownerPhone && (
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleCall}
        >
          <Phone className="h-4 w-4" />
          {t.property.callNow}
        </Button>
      )}
    </div>
  )
}
