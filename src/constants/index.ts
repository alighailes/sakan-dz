import type { Wilaya, OperationType, PropertyType, LegalStatus } from '@/types'

// ============================================================
// 58 Wilayas of Algeria with coordinates
// ============================================================
export const WILAYAS: Wilaya[] = [
  { id: 1, name: 'Adrar', nameAr: 'أدرار', lat: 27.8742, lng: -0.2939 },
  { id: 2, name: 'Chlef', nameAr: 'الشلف', lat: 36.1647, lng: 1.3317 },
  { id: 3, name: 'Laghouat', nameAr: 'الأغواط', lat: 33.8003, lng: 2.8632 },
  { id: 4, name: 'Oum El Bouaghi', nameAr: 'أم البواقي', lat: 35.8756, lng: 7.1133 },
  { id: 5, name: 'Batna', nameAr: 'باتنة', lat: 35.5560, lng: 6.1742 },
  { id: 6, name: 'Béjaïa', nameAr: 'بجاية', lat: 36.7509, lng: 5.0568 },
  { id: 7, name: 'Biskra', nameAr: 'بسكرة', lat: 34.8333, lng: 5.7333 },
  { id: 8, name: 'Béchar', nameAr: 'بشار', lat: 31.6167, lng: -2.2167 },
  { id: 9, name: 'Blida', nameAr: 'البليدة', lat: 36.4722, lng: 2.8278 },
  { id: 10, name: 'Bouira', nameAr: 'البويرة', lat: 36.3742, lng: 3.9000 },
  { id: 11, name: 'Tamanrasset', nameAr: 'تمنراست', lat: 22.7850, lng: 5.5228 },
  { id: 12, name: 'Tébessa', nameAr: 'تبسة', lat: 35.4042, lng: 8.1242 },
  { id: 13, name: 'Tlemcen', nameAr: 'تلمسان', lat: 34.8828, lng: -1.3167 },
  { id: 14, name: 'Tiaret', nameAr: 'تيارت', lat: 35.3711, lng: 1.3181 },
  { id: 15, name: 'Tizi Ouzou', nameAr: 'تيزي وزو', lat: 36.7117, lng: 4.0456 },
  { id: 16, name: 'Alger', nameAr: 'الجزائر', lat: 36.7538, lng: 3.0588 },
  { id: 17, name: 'Djelfa', nameAr: 'الجلفة', lat: 34.6708, lng: 3.2631 },
  { id: 18, name: 'Jijel', nameAr: 'جيجل', lat: 36.8211, lng: 5.7667 },
  { id: 19, name: 'Sétif', nameAr: 'سطيف', lat: 36.1898, lng: 5.4108 },
  { id: 20, name: 'Saïda', nameAr: 'سعيدة', lat: 34.8303, lng: 0.1517 },
  { id: 21, name: 'Skikda', nameAr: 'سكيكدة', lat: 36.8667, lng: 6.9000 },
  { id: 22, name: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', lat: 35.1897, lng: -0.6308 },
  { id: 23, name: 'Annaba', nameAr: 'عنابة', lat: 36.9000, lng: 7.7667 },
  { id: 24, name: 'Guelma', nameAr: 'قالمة', lat: 36.4622, lng: 7.4306 },
  { id: 25, name: 'Constantine', nameAr: 'قسنطينة', lat: 36.3650, lng: 6.6147 },
  { id: 26, name: 'Médéa', nameAr: 'المدية', lat: 36.2675, lng: 2.7500 },
  { id: 27, name: 'Mostaganem', nameAr: 'مستغانم', lat: 35.9333, lng: 0.0833 },
  { id: 28, name: "M'Sila", nameAr: 'المسيلة', lat: 35.7000, lng: 4.5500 },
  { id: 29, name: 'Mascara', nameAr: 'معسكر', lat: 35.3956, lng: 0.1403 },
  { id: 30, name: 'Ouargla', nameAr: 'ورقلة', lat: 31.9500, lng: 5.3333 },
  { id: 31, name: 'Oran', nameAr: 'وهران', lat: 35.6969, lng: -0.6331 },
  { id: 32, name: 'El Bayadh', nameAr: 'البيض', lat: 33.6833, lng: 1.0167 },
  { id: 33, name: 'Illizi', nameAr: 'إليزي', lat: 26.5000, lng: 8.4833 },
  { id: 34, name: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج', lat: 36.0722, lng: 4.7622 },
  { id: 35, name: 'Boumerdès', nameAr: 'بومرداس', lat: 36.7594, lng: 3.4764 },
  { id: 36, name: 'El Tarf', nameAr: 'الطارف', lat: 36.7672, lng: 8.3136 },
  { id: 37, name: 'Tindouf', nameAr: 'تندوف', lat: 27.6742, lng: -8.1478 },
  { id: 38, name: 'Tissemsilt', nameAr: 'تيسمسيلت', lat: 35.6075, lng: 1.8103 },
  { id: 39, name: 'El Oued', nameAr: 'الوادي', lat: 33.3683, lng: 6.8528 },
  { id: 40, name: 'Khenchela', nameAr: 'خنشلة', lat: 35.4353, lng: 7.1431 },
  { id: 41, name: 'Souk Ahras', nameAr: 'سوق أهراس', lat: 36.2864, lng: 7.9511 },
  { id: 42, name: 'Tipaza', nameAr: 'تيبازة', lat: 36.5881, lng: 2.4472 },
  { id: 43, name: 'Mila', nameAr: 'ميلة', lat: 36.4503, lng: 6.2644 },
  { id: 44, name: 'Aïn Defla', nameAr: 'عين الدفلى', lat: 36.2644, lng: 1.9667 },
  { id: 45, name: 'Naâma', nameAr: 'النعامة', lat: 33.2667, lng: -0.3000 },
  { id: 46, name: 'Aïn Témouchent', nameAr: 'عين تموشنت', lat: 35.2975, lng: -1.1404 },
  { id: 47, name: 'Ghardaïa', nameAr: 'غرداية', lat: 32.4912, lng: 3.6739 },
  { id: 48, name: 'Relizane', nameAr: 'غليزان', lat: 35.7372, lng: 0.5567 },
  { id: 49, name: 'Timimoun', nameAr: 'تيميمون', lat: 29.2583, lng: 0.2306 },
  { id: 50, name: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار', lat: 21.3278, lng: 0.9547 },
  { id: 51, name: "Ouled Djellal", nameAr: 'أولاد جلال', lat: 34.4333, lng: 5.0667 },
  { id: 52, name: 'Béni Abbès', nameAr: 'بني عباس', lat: 30.1333, lng: -2.1667 },
  { id: 53, name: 'In Salah', nameAr: 'عين صالح', lat: 27.1936, lng: 2.4606 },
  { id: 54, name: 'In Guezzam', nameAr: 'عين قزام', lat: 19.5728, lng: 5.7694 },
  { id: 55, name: 'Touggourt', nameAr: 'تقرت', lat: 33.1083, lng: 6.0583 },
  { id: 56, name: "Djanet", nameAr: 'جانت', lat: 24.5542, lng: 9.4847 },
  { id: 57, name: "El M'Ghair", nameAr: 'المغير', lat: 33.9500, lng: 5.9167 },
  { id: 58, name: 'El Meniaa', nameAr: 'المنيعة', lat: 30.5833, lng: 2.8833 },
]

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
