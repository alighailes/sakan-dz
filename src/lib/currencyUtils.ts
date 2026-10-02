import type { CurrencyMode } from '@/types'

/**
 * Algerian Currency Engine
 * Supports standard DZD format and colloquial Centimes format
 */

/**
 * Format price in standard DZD format: "2,500,000 DA"
 */
export function formatDZD(price: number, currency: string = 'DZD'): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format price in Algerian colloquial Centimes format.
 * - >= 1,000,000,000 DA -> Milliards (مليار سنتيم)
 * - >= 10,000,000 DA -> Millions (مليون سنتيم)
 * - < 10,000,000 DA -> standard DZD
 */
export function formatCentimes(price: number, locale: string = 'fr'): string {
  const absPrice = Math.abs(price)

  if (absPrice >= 1_000_000_000) {
    const milliards = price / 1_000_000_000
    const formatted = milliards.toLocaleString('fr-DZ', { maximumFractionDigits: 1 })
    return locale === 'ar' ? `${formatted} مليار سنتيم` : `${formatted} Milliard centimes`
  }

  if (absPrice >= 10_000_000) {
    const millions = price / 1_000_000
    const formatted = millions.toLocaleString('fr-DZ', { maximumFractionDigits: 1 })
    return locale === 'ar' ? `${formatted} مليون سنتيم` : `${formatted} Million centimes`
  }

  return formatDZD(price)
}

/**
 * Format price based on user's currency mode preference
 */
export function formatPrice(
  price: number,
  currency: string = 'DZD',
  mode: CurrencyMode = 'dzd',
  locale: string = 'fr'
): string {
  if (mode === 'centimes') {
    return formatCentimes(price, locale)
  }
  return formatDZD(price, currency)
}

/**
 * Get the alternative format (for dual display)
 */
export function getAlternativePrice(
  price: number,
  currency: string = 'DZD',
  mode: CurrencyMode = 'dzd',
  locale: string = 'fr'
): string {
  if (mode === 'centimes') {
    return formatDZD(price, currency)
  }
  return formatCentimes(price, locale)
}
