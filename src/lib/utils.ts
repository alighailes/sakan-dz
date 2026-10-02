import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'DZD'): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(dateString: string, locale: string = 'fr'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getOperationLabelFr(type: string): string {
  const labels: Record<string, string> = {
    rent: 'Location',
    sale: 'Vente',
    vacation: 'Vacances',
    colocation: 'Colocation',
  }
  return labels[type] || type
}

export function getPropertyTypeLabelFr(type: string): string {
  const labels: Record<string, string> = {
    apartment: 'Appartement',
    villa: 'Villa',
    studio: 'Studio',
    commercial: 'Local commercial',
    land: 'Terrain',
  }
  return labels[type] || type
}

export function getLegalStatusLabelFr(status: string): string {
  const labels: Record<string, string> = {
    acte_livret: 'Acte + Livret foncier',
    acte_seul: 'Acte notarié seul',
    indivision: 'Dans l\'indivision',
    decision_attribution: 'Décision d\'attribution',
    cle_desistement: 'Clé / Désistement',
    promesse_vente: 'Promesse de vente',
    papier_timbre: 'Papier timbré',
  }
  return labels[status] || status
}
