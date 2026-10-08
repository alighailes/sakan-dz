import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ImagePlus, Loader2, LogIn, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useLocale } from '@/i18n'
import { WILAYAS_58, getWilayaByCode, getCommunesByWilaya, wilayaLabel, communeLabel, communeValue } from '@/data/algeria-locations'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '@/stores/authStore'
import { uploadPropertyImages } from '../services/storage'
import { invalidatePropertiesCache } from '@/services/api'
import { supabase } from '@/lib/supabase'
import { sanitizePhone, sanitizeText } from '@/lib/sanitize'
import { LocationPicker } from '@/components/map/LocationPicker'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { isValidAlgeriaLatLng, normalizeLatLng } from '@/lib/mapHelpers'

const OPERATIONS = [
  { value: 'sale', labelAr: 'بيع', labelFr: 'Vente' },
  { value: 'rent', labelAr: 'إيجار', labelFr: 'Location' },
  { value: 'vacation', labelAr: 'عطل / موسمي', labelFr: 'Vacances' },
  { value: 'colocation', labelAr: 'سكن مشترك', labelFr: 'Colocation' },
]

const PROPERTY_TYPES = [
  { value: 'apartment', labelAr: 'شقة', labelFr: 'Appartement' },
  { value: 'villa', labelAr: 'فيلا', labelFr: 'Villa' },
  { value: 'land', labelAr: 'أرض', labelFr: 'Terrain' },
  { value: 'commercial', labelAr: 'تجاري', labelFr: 'Commercial' },
  { value: 'office', labelAr: 'مكتب', labelFr: 'Bureau' },
  { value: 'studio', labelAr: 'استوديو', labelFr: 'Studio' },
]

const LEGAL_OPTIONS = [
  { value: 'acte_livret', labelAr: 'عقد توثيقي + دفتر عقاري', labelFr: 'Acte + livret foncier' },
  { value: 'acte_seul', labelAr: 'عقد توثيقي فقط', labelFr: 'Acte seul' },
  { value: 'indivision', labelAr: 'شيوع', labelFr: 'Indivision' },
  { value: 'decision_attribution', labelAr: 'مقرر استفادة', labelFr: "Décision d'attribution" },
  { value: 'cle_desistement', labelAr: 'مفتاح / تنازل', labelFr: 'Clé / désistement' },
  { value: 'promesse_vente', labelAr: 'وعد بالبيع', labelFr: 'Promesse de vente' },
  { value: 'papier_timbre', labelAr: 'ورقة عرفية', labelFr: 'Papier timbré' },
]

// Surface the exact PostgREST/Supabase server message (plus details, hint
// and code when present) instead of a generic string, so schema mismatches
// are directly diagnosable from the UI.
function formatPublishError(err: unknown): string {
  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>
    const message = typeof record.message === 'string' ? record.message : null
    if (message) {
      const extras = [
        typeof record.details === 'string' && record.details ? record.details : null,
        typeof record.hint === 'string' && record.hint ? record.hint : null,
        typeof record.code === 'string' && record.code ? `code ${record.code}` : null,
      ].filter(Boolean)
      return extras.length > 0 ? `${message} (${extras.join(' · ')})` : message
    }
  }
  if (err instanceof Error && err.message) return err.message
  return 'Failed to publish'
}

export function PublishPage() {
  const navigate = useNavigate()
  const { locale, t } = useLocale()
  const { user, profile: authProfile, loading: authLoading } = useAuth()
  const storeProfile = useAuthStore((s) => s.profile)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [operation, setOperation] = useState('sale')
  const [propertyType, setPropertyType] = useState('apartment')
  const [legalStatus, setLegalStatus] = useState('acte_livret')
  const [wilayaCode, setWilayaCode] = useState<number | ''>('')
  const [commune, setCommune] = useState('')
  const [surface, setSurface] = useState('')
  const [rooms, setRooms] = useState('3')
  const [bathrooms, setBathrooms] = useState('1')
  const [hasElevator, setHasElevator] = useState(false)
  const [hasWaterTank, setHasWaterTank] = useState(false)
  const [hasCentralHeating, setHasCentralHeating] = useState(false)
  const [hasGarage, setHasGarage] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // Leaflet [latitude, longitude] — e.g. Saida [34.8303, 0.1517].
  // lat (North) must stay in ~18..38, lng (East) in ~-9..12.
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  // Auto-fill phone from the logged-in user's profiles.phone_number.
  // Store profile first (handles mock mode), then context profile, then a
  // direct profiles lookup as a last resort. Never overwrites manual edits.
  useEffect(() => {
    if (phoneTouched || phone) return
    const fromStore = storeProfile?.phone_number?.trim()
    const fromCtx = (authProfile as { phone_number?: string } | null)?.phone_number?.trim()
    if (fromStore) {
      setPhone(fromStore)
      return
    }
    if (fromCtx) {
      setPhone(fromCtx)
      return
    }
    if (!user) return
    let cancelled = false
    void (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', user.id)
          .single()
        if (cancelled) return
        const fetched = (data as { phone_number?: string } | null)?.phone_number?.trim()
        if (fetched) setPhone(fetched)
      } catch {
        // No profile phone available — field stays manual.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [phoneTouched, phone, storeProfile, authProfile, user])

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
            <LogIn className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {locale === 'ar' ? 'سجّل الدخول قبل النشر' : 'Connectez-vous avant de publier'}
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {locale === 'ar'
              ? 'تحتاج إلى حساب لنشر إعلانك. سجّل الدخول أو أنشئ حساباً مجانياً للمتابعة.'
              : "Vous avez besoin d'un compte pour publier votre annonce. Connectez-vous ou créez un compte gratuit pour continuer."}
          </p>
          <Link to="/auth" className="mt-6 inline-block">
            <Button className="gap-2">
              <LogIn className="h-4 w-4" />
              {locale === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'Se connecter / Créer un compte'}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const selected = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'))
    const merged = [...files, ...selected].slice(0, 10)
    setFiles(merged)
    setPreviews(merged.map((f) => URL.createObjectURL(f)))
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const communes = getCommunesByWilaya(wilayaCode === '' ? undefined : wilayaCode)
  const selectedWilaya = getWilayaByCode(wilayaCode === '' ? undefined : wilayaCode)

  const publishWilayaOptions = useMemo(
    () =>
      WILAYAS_58.map((w) => ({
        value: String(w.code),
        label: `${wilayaLabel(w, locale)} (${w.code})`,
      })),
    [locale]
  )
  const publishCommuneOptions = useMemo(
    () =>
      communes.map((c) => ({
        value: communeValue(c),
        label: communeLabel(c, locale),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [communes, locale]
  )
  const publishPropertyTypeOptions = useMemo(
    () =>
      PROPERTY_TYPES.map((pt) => ({
        value: pt.value,
        label: locale === 'ar' ? pt.labelAr : pt.labelFr,
      })),
    [locale]
  )
  const publishWilayaSearchHint =
    locale === 'ar'
      ? 'اختر أو اكتب ولاية (مثال: الجزائر، وهران، سعيدة)...'
      : 'Sélectionnez ou tapez une wilaya (ex: Alger, Oran, Saïda)...'
  // Wilaya capital in Leaflet [lat, lng] order — picker flyTo target.
  const wilayaCenter: [number, number] | null = selectedWilaya
    ? [selectedWilaya.lat, selectedWilaya.lng]
    : null

  const handleWilayaChange = (val: number | '') => {
    setWilayaCode(val)
    setCommune('') // reset dependent commune when wilaya changes
    // Smoothly pan the picker to the wilaya capital and seed the pin there
    // so the payload always carries accurate [latitude, longitude].
    const w = getWilayaByCode(val === '' ? undefined : val)
    if (w) {
      const fixed = normalizeLatLng(w.lat, w.lng)
      if (fixed) {
        setLatitude(fixed.lat)
        setLongitude(fixed.lng)
      } else {
        setLatitude(w.lat)
        setLongitude(w.lng)
      }
    }
  }

  const handleLocationChange = (lat: number, lng: number) => {
    const fixed = normalizeLatLng(lat, lng)
    if (fixed) {
      setLatitude(fixed.lat)
      setLongitude(fixed.lng)
    } else {
      setLatitude(lat)
      setLongitude(lng)
    }
  }

  const hasValidLocation =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    isValidAlgeriaLatLng(latitude, longitude)

  const phoneOk = phone.trim() === '' || sanitizePhone(phone) !== ''

  const canSubmit =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    Number(price) > 0 &&
    wilayaCode !== '' &&
    commune.trim().length > 0 &&
    Number(surface) > 0 &&
    hasValidLocation &&
    phoneOk

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !canSubmit || submitting) return

    setSubmitting(true)
    setErrorMsg(null)

    try {
      // 1. Upload selected image files via Supabase Storage
      let images: string[] = []
      if (files.length > 0) {
        images = await uploadPropertyImages(files, user.id)
      }

      // 2. Insert the listing into public.properties.
      // Wilaya / commune are stored by their canonical French names so that
      // listings stay standardized no matter which UI locale was used.
      // NOTE: the table's area column is named `surface` — sending `area`
      // would fail PostgREST schema validation (PGRST204), so only `surface`
      // is sent.
      // Geolocation: Leaflet + PostGIS canonical order is
      // latitude (North, 18..38) / longitude (East, -9..12).
      // The interactive pin picker guarantees `latitude`/`longitude` are set
      // and already normalized (inverted [lng, lat] pairs auto-swapped).
      const wilayaName = getWilayaByCode(wilayaCode)?.name_fr ?? ''
      const coords = normalizeLatLng(latitude, longitude)
      const cleanPhone = sanitizePhone(phone)
      const { error } = await supabase.from('properties').insert({
        title: sanitizeText(title),
        description: sanitizeText(description),
        price: Number(price),
        operation,
        operation_type: operation,
        property_type: propertyType,
        legal_status: legalStatus,
        wilaya: wilayaName,
        wilaya_id: typeof wilayaCode === 'number' ? wilayaCode : null,        commune: sanitizeText(commune),
        surface: Number(surface),
        rooms: Number(rooms),
        bedrooms: Number(rooms),
        bathrooms: Number(bathrooms),
        latitude: coords ? coords.lat : latitude,
        longitude: coords ? coords.lng : longitude,
        has_elevator: hasElevator,
        has_water_tank: hasWaterTank,
        has_central_heating: hasCentralHeating,
        has_garage: hasGarage,
        images,
        user_id: user.id,
        owner_id: user.id,
        owner_name: user.email ?? '',
        // Actual column is owner_phone (TEXT, nullable) — task's
        // `properties.phone` maps here.
        owner_phone: cleanPhone || null,
      })

      if (error) throw error

      // 3. Success: drop cached listings so the new ad appears immediately
      // on /listings despite the shared query cache, then redirect.
      invalidatePropertiesCache()
      setSubmitted(true)
      window.alert(
        locale === 'ar' ? 'تم نشر إعلانك بنجاح!' : 'Votre annonce a été publiée avec succès !'
      )
      setTimeout(() => navigate('/listings'), 800)
    } catch (err) {
      console.error('Failed to publish:', err)
      setErrorMsg(formatPublishError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center animate-scale-in">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.publish.success}</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {locale === 'ar' ? 'جارٍ تحويلك إلى صفحة الإعلانات...' : 'Redirection vers les annonces...'}
          </p>
        </div>
      </div>
    )
  }

  const checkboxRow = (
    checked: boolean,
    onChange: (v: boolean) => void,
    label: string
  ) => (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:border-primary-400 dark:border-zinc-700 dark:text-zinc-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary-600"
      />
      {label}
    </label>
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.publish.title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {locale === 'ar'
          ? 'املأ بيانات عقارك بدقة ليصل إعلانك إلى المشترين المناسبين.'
          : 'Remplissez les informations de votre bien pour atteindre les bons acheteurs.'}
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {locale === 'ar' ? 'عنوان الإعلان' : "Titre de l'annonce"}
          </label>
          <Input
            placeholder={t.publish.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {locale === 'ar' ? 'الوصف' : 'Description'}
          </label>
          <textarea
            placeholder={t.publish.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            minLength={10}
            className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.publish.pricePlaceholder}
            </label>
            <Input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="5000000"
            />
          </div>
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'نوع العملية' : 'Opération'}
            </label>
            <Select value={operation} onChange={(e) => setOperation(e.target.value)}>
              {OPERATIONS.map((op) => (
                <option key={op.value} value={op.value}>
                  {locale === 'ar' ? op.labelAr : op.labelFr}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'نوع العقار' : 'Type de bien'}
            </label>
            <SearchableSelect
              value={propertyType}
              onChange={(v) => setPropertyType(v)}
              options={publishPropertyTypeOptions}
              placeholder={locale === 'ar' ? 'اختر نوع العقار' : 'Sélectionnez le type de bien'}
            />
          </div>
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'الوضع القانوني' : 'Statut juridique'}
            </label>
            <Select value={legalStatus} onChange={(e) => setLegalStatus(e.target.value)}>
              {LEGAL_OPTIONS.map((ls) => (
                <option key={ls.value} value={ls.value}>
                  {locale === 'ar' ? ls.labelAr : ls.labelFr}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'الولاية' : 'Wilaya'}
            </label>
            <SearchableSelect
              value={wilayaCode === '' ? '' : String(wilayaCode)}
              onChange={(v) => handleWilayaChange(v ? Number(v) : '')}
              options={publishWilayaOptions}
              placeholder={locale === 'ar' ? 'اختر الولاية' : 'Sélectionnez la wilaya'}
              searchPlaceholder={publishWilayaSearchHint}
            />
          </div>
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'البلدية' : 'Commune'}
            </label>
            <SearchableSelect
              value={commune}
              onChange={(v) => setCommune(v)}
              options={publishCommuneOptions}
              placeholder={
                wilayaCode === ''
                  ? t.filters.selectWilayaFirst
                  : locale === 'ar'
                    ? 'اختر البلدية'
                    : 'Sélectionnez la commune'
              }
              disabled={wilayaCode === ''}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {locale === 'ar' ? 'موقع العقار على الخريطة' : 'Position du bien sur la carte'}
            <span className="text-red-500"> *</span>
          </label>
          <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
            {locale === 'ar'
              ? 'اختر الولاية للانتقال إليها تلقائيًا، ثم اسحب الدبوس أو انقر على الخريطة لتحديد الموقع بدقة.'
              : 'Choisissez la wilaya pour y voler automatiquement, puis glissez le pin ou cliquez sur la carte.'}
          </p>
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={handleLocationChange}
            wilayaCenter={wilayaCenter}
            wilayaName={selectedWilaya ? wilayaLabel(selectedWilaya, locale) : ''}
          />
          {!hasValidLocation && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              {locale === 'ar'
                ? 'حدّد الموقع على الخريطة (خط العرض 18–38، خط الطول ‎-9–12‎) قبل النشر.'
                : 'Placez le pin sur la carte (lat 18–38, lng -9–12) avant de publier.'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'المساحة (م²)' : 'Surface (m²)'}
            </label>
            <Input
              type="number"
              min={1}
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'الغرف' : 'Pièces'}
            </label>
            <Input
              type="number"
              min={0}
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'الحمامات' : 'Sdb'}
            </label>
            <Input
              type="number"
              min={0}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {locale === 'ar' ? 'التجهيزات' : 'Équipements'}
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {checkboxRow(hasElevator, setHasElevator, locale === 'ar' ? 'مصعد' : 'Ascenseur')}
            {checkboxRow(hasWaterTank, setHasWaterTank, locale === 'ar' ? 'خزان ماء' : "Réservoir d'eau")}
            {checkboxRow(
              hasCentralHeating,
              setHasCentralHeating,
              locale === 'ar' ? 'تدفئة مركزية' : 'Chauffage central'
            )}
            {checkboxRow(hasGarage, setHasGarage, locale === 'ar' ? 'مرآب' : 'Garage')}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {locale === 'ar' ? 'رقم الهاتف' : 'Téléphone'}
          </label>
          <Input
            type="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setPhoneTouched(true)
            }}
            placeholder="0550123456"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {locale === 'ar'
              ? 'يُملأ تلقائياً من حسابك — صيغة جزائرية: 05/06/07 + 8 أرقام'
              : 'Pré-rempli depuis votre compte — format algérien : 05/06/07 + 8 chiffres'}
          </p>
          {!phoneOk && (
            <p className="mt-1 text-xs text-red-500">
              {locale === 'ar' ? 'رقم الهاتف غير صالح (05/06/07...)' : 'Numéro invalide (05/06/07...)'}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-start text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.publish.images}
          </label>
          <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center transition-colors hover:border-primary-400 dark:border-zinc-700">
            <ImagePlus className="h-8 w-8 text-zinc-400" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {previews.length > 0
                ? locale === 'ar'
                  ? 'التقاط صورة أخرى'
                  : 'Prendre une autre photo'
                : locale === 'ar'
                  ? 'انقر لاختيار الصور (حتى 10)'
                  : 'Cliquez pour choisir des photos (max 10)'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {previews.map((src, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <img src={src} alt={`preview-${i}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {errorMsg}
          </p>
        )}

        <Button type="submit" disabled={!canSubmit || submitting} className="w-full gap-2">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {locale === 'ar' ? 'جارٍ النشر...' : 'Publication...'}
            </>
          ) : (
            <>
              {t.publish.submit}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
