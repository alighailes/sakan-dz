// ============================================================
// Sakan DZ - Core Type Definitions
// ============================================================

// --- Enums / Union Types ---
export type OperationType = 'rent' | 'sale' | 'vacation' | 'colocation'
export type PropertyType = 'apartment' | 'villa' | 'studio' | 'commercial' | 'land'
export type LegalStatus =
  | 'acte_livret'        // عقد توثيقي + دفتر عقاري
  | 'acte_seul'          // عقد توثيقي فقط
  | 'indivision'         // عقد في الشيوع
  | 'decision_attribution' // مقرر استفادة / ترقية عقارية
  | 'cle_desistement'    // مفتاح / تنازل
  | 'promesse_vente'     // وعد بالبيع
  | 'papier_timbre'      // ورقة عرفية / عقد عرفي
export type Currency = 'DZD' | 'EUR' | 'USD'
export type UserType = 'individual' | 'agency'
export type WaterAvailability = '24_7' | 'tank_bache' | 'schedule' | 'intermittent'
export type GasType = 'city_gas' | 'butane_bottles' | 'none'
export type ElectricityMeter = 'individual' | 'shared' | 'commercial'
export type ColocationGender = 'male_only' | 'female_only' | 'any'
export type PriceBenchmark = 'very_good' | 'fair' | 'premium'

// --- Wilaya ---
export interface Wilaya {
  id: number
  name: string
  nameAr: string
  lat: number
  lng: number
}

// --- Property ---
export interface Property {
  id: string
  title: string
  titleAr?: string
  description: string
  descriptionAr?: string
  operationType: OperationType
  propertyType: PropertyType
  price: number
  currency: Currency
  pricePerNight?: number
  wilayaId: number
  daira?: string
  commune?: string
  address?: string
  latitude: number
  longitude: number
  bedrooms: number
  bathrooms: number
  area: number
  floor?: number
  legalStatus: LegalStatus
  images: string[]
  ownerId: string
  ownerName: string
  ownerPhone?: string
  isFeatured: boolean
  isAvailable: boolean
  isVerified: boolean
  viewsCount: number
  createdAt: string
  updatedAt: string
  // Module 2: Essential commodities
  waterAvailability: WaterAvailability
  gasType: GasType
  electricityMeter: ElectricityMeter
  hasElevator: boolean
  floorNumber?: number
  buildingFloors?: number
  // Module 4: Colocation
  colocationGender?: ColocationGender
  studentFriendly: boolean
  roommatesCount?: number
  availableBeds?: number
  smokingAllowed: boolean
  wifiIncluded: boolean
  // Module 5: Vacation
  cleaningFee?: number
  bookedDates?: string[]
  // Module 7: Agency
  agencyId?: string
  agencyName?: string
}

// --- User Profile ---
export interface UserProfile {
  id: string
  full_name: string
  phone_number: string
  user_type: UserType
  agency_name?: string
  wilaya_id: number
  avatar_url?: string
  created_at: string
  updated_at: string
}

// --- User ---
export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  wilayaId?: number
  isVerified: boolean
  createdAt: string
}

// --- Conversation & Messages ---
export interface Conversation {
  id: string
  propertyId: string
  propertyTitle: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  isRead: boolean
  createdAt: string
}

// --- Favorites ---
export interface Favorite {
  id: string
  userId: string
  propertyId: string
  createdAt: string
}

// --- Search Filters ---
export interface SearchFilters {
  operationType?: OperationType
  propertyType?: PropertyType
  wilayaId?: number
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minArea?: number
  legalStatus?: LegalStatus
  query?: string
  // Module 4: Colocation filters
  colocationGender?: ColocationGender
  studentFriendly?: boolean
}

// --- Map Types ---
export interface MapMarker {
  id: string
  lat: number
  lng: number
  price: number
  currency: Currency
  operationType: OperationType
  propertyType: PropertyType
  title: string
}

// --- Form Types ---
export interface PropertyFormData {
  title: string
  description: string
  operationType: OperationType
  propertyType: PropertyType
  legalStatus: LegalStatus
  wilayaId: number
  daira: string
  commune: string
  address: string
  latitude: number
  longitude: number
  price: number
  currency: Currency
  pricePerNight?: number
  bedrooms: number
  bathrooms: number
  area: number
  floor?: number
  images: string[]
  isFeatured: boolean
  // Module 2
  waterAvailability: WaterAvailability
  gasType: GasType
  electricityMeter: ElectricityMeter
  hasElevator: boolean
  floorNumber?: number
  buildingFloors?: number
  // Module 4
  colocationGender?: ColocationGender
  studentFriendly: boolean
  roommatesCount?: number
  availableBeds?: number
  smokingAllowed: boolean
  wifiIncluded: boolean
  // Module 5
  cleaningFee?: number
}

// --- Theme ---
export type Theme = 'light' | 'dark'

// --- Locale ---
export type Locale = 'fr' | 'ar'

// --- Currency Display Mode ---
export type CurrencyMode = 'dzd' | 'centimes'

// --- Agent ---
export interface Agent {
  id: string
  name: string
  agencyName: string
  wilaya: string
  commune: string
  phone: string
  whatsapp?: string
  email: string
  avatarUrl: string
  verified: boolean
  rating: number
  reviewsCount: number
  activeListingsCount: number
  licenseNumber: string
  specialties: string[]
  bio: string
}
