import type { Wilaya, OperationType, PropertyType, LegalStatus } from '@/types'
import { WILAYAS_58 } from '@/data/algeria-locations'

// ============================================================
// 58 Wilayas of Algeria — canonical data lives in
// src/data/algeria-locations.ts (single source of truth).
// Kept here in the legacy shape so existing consumers keep working.
// ============================================================
export const WILAYAS: Wilaya[] = WILAYAS_58.map((w) => ({
  id: w.code,
  name: w.name_fr,
  nameAr: w.name_ar,
  lat: w.lat,
  lng: w.lng,
}))

// ============================================================
// Operation Types
// ============================================================
export const OPERATION_TYPES: { value: OperationType; labelFr: string; labelAr: string }[] = [
  { value: 'rent', labelFr: 'Location', labelAr: 'إيجار' },
  { value: 'sale', labelFr: 'Vente', labelAr: 'بيع' },
  { value: 'vacation', labelFr: 'Location vacances', labelAr: 'إيجار سياحي' },
  { value: 'colocation', labelFr: 'Colocation', labelAr: 'سكن مشترك' },
]

// ============================================================
// Property Types
// ============================================================
export const PROPERTY_TYPES: { value: PropertyType; labelFr: string; labelAr: string }[] = [
  { value: 'apartment', labelFr: 'Appartement', labelAr: 'شقة' },
  { value: 'villa', labelFr: 'Villa', labelAr: 'فيلا' },
  { value: 'studio', labelFr: 'Studio', labelAr: 'ستوديو' },
  { value: 'commercial', labelFr: 'Local commercial', labelAr: 'محل تجاري' },
  { value: 'land', labelFr: 'Terrain', labelAr: 'أرض' },
]

// ============================================================
// Legal Status
// ============================================================
export const LEGAL_STATUS: { value: LegalStatus; labelFr: string; labelAr: string }[] = [
  { value: 'acte_livret', labelFr: 'Acte + Livret', labelAr: 'عقد توثيقي + دفتر عقاري' },
  { value: 'acte_seul', labelFr: 'Acte notarié seul', labelAr: 'عقد توثيقي فقط' },
  { value: 'indivision', labelFr: 'Dans l\'indivision', labelAr: 'عقد في الشيوع' },
  { value: 'decision_attribution', labelFr: 'Décision d\'attribution', labelAr: 'مقرر استفادة / ترقية' },
  { value: 'cle_desistement', labelFr: 'Clé / Désistement', labelAr: 'مفتاح / تنازل' },
  { value: 'promesse_vente', labelFr: 'Promesse de vente', labelAr: 'وعد بالبيع' },
  { value: 'papier_timbre', labelFr: 'Papier timbré', labelAr: 'ورقة عرفية / عقد عرفي' },
]

// ============================================================
// Currencies
// ============================================================
export const CURRENCIES = ['DZD', 'EUR', 'USD'] as const

// ============================================================
// Map defaults — centered on Algeria with constrained bounds
// ============================================================
export const MAP_DEFAULT_CENTER: [number, number] = [35.6987, 3.0588] // Center of Algeria
export const MAP_DEFAULT_ZOOM = 6
export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [18.9, -8.7], // South-West (covers Tamanrasset / Tindouf)
  [37.3, 12.0], // North-East (covers Annaba / Djanet)
]
export const MAP_MIN_ZOOM = 5

// ============================================================
// Pagination
// ============================================================
export const ITEMS_PER_PAGE = 12
