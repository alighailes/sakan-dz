import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight,
  Bell,
  BellOff,
  Building2,
  Camera,
  Check,
  Heart,
  Loader2,
  LogOut,
  MessageSquare,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Spinner } from '@/components/ui/spinner'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useProperties } from '@/hooks/useProperties'
import { WILAYAS } from '@/constants'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { sanitizeText } from '@/lib/sanitize'
import {
  isPushSubscribed,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/services/notifications'
import { cn } from '@/lib/utils'

const MAX_AVATAR_BYTES = 3 * 1024 * 1024

interface ProfileExtras {
  commune: string
  bio: string
}

function extrasKey(userId: string) {
  return `sakan-profile-extras:${userId}`
}

function readExtras(userId: string): ProfileExtras {
  try {
    const raw = localStorage.getItem(extrasKey(userId))
    if (!raw) return { commune: '', bio: '' }
    const parsed = JSON.parse(raw) as Partial<ProfileExtras>
    return {
      commune: typeof parsed.commune === 'string' ? parsed.commune : '',
      bio: typeof parsed.bio === 'string' ? parsed.bio : '',
    }
  } catch {
    return { commune: '', bio: '' }
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ProfilePage() {
  const { locale } = useLocale()
  const navigate = useNavigate()
  const { user, profile, loading, updateProfile, updateRole, signOut, activeRole } = useAuthStore()
  const { favorites } = useFavoritesStore()
  const { properties } = useProperties()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [wilayaId, setWilayaId] = useState('16')
  const [commune, setCommune] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [hydrated, setHydrated] = useState(false)

  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [pushActive, setPushActive] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  // Sync form from store profile + per-user extras.
  useEffect(() => {
    if (!user || !profile) return
    setFullName(profile.full_name ?? '')
    setPhone(profile.phone_number ?? '')
    setWilayaId(String(profile.wilaya_id ?? 16))
    setAvatarUrl(profile.avatar_url ?? '')
    const extras = readExtras(user.id)
    setCommune(extras.commune)
    setBio(extras.bio)
    setHydrated(true)
  }, [user, profile])

  // Push subscription state.
  useEffect(() => {
    let cancelled = false
    if (!isPushSupported()) return
    isPushSubscribed()
      .then((v) => {
        if (!cancelled) setPushActive(v)
      })
      .catch((err) => {
        console.error('[ProfilePage] reading push subscription failed:', err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(id)
  }, [toast])

  if (loading && !hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const isSeller = activeRole === 'seller'
  const myListingsCount = properties.filter((p) => p.ownerId === user.id).length
  const favoritesCount = favorites.length
  const messagesCount = 0

  const wilayaOptions = WILAYAS.map((w) => ({
    value: String(w.id),
    label: locale === 'ar' ? `${w.nameAr} (${w.id})` : `${w.name} (${w.id})`,
  }))

  const showToast = (type: 'success' | 'error', message: string) => setToast({ type, message })

  const handleAvatarClick = () => {
    if (avatarBusy) return
    setAvatarError(null)
    fileRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      setAvatarError(locale === 'ar' ? 'المرجو اختيار صورة فقط' : 'Please select an image file')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(locale === 'ar' ? 'حجم الصورة يجب أن لا يتجاوز 3MB' : 'Image must be under 3MB')
      return
    }

    setAvatarBusy(true)
    setAvatarError(null)
    try {
      // Mock mode (no Supabase): keep a local data URL so the UI still works.
      if (!isSupabaseConfigured()) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(new Error('read-failed'))
          reader.readAsDataURL(file)
        })
        await updateProfile({ avatar_url: dataUrl })
        setAvatarUrl(dataUrl)
        showToast('success', locale === 'ar' ? 'تم تحديث الصورة' : 'Avatar updated')
        return
      }

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().slice(0, 4)
      const filePath = `${user.id}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })
      if (error) {
        console.error('[ProfilePage] avatar upload failed:', error.message, error)
        throw error
      }
      if (!data?.path) {
        console.error('[ProfilePage] avatar upload returned no path:', data)
      }

      const publicUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl
      try {
        await updateProfile({ avatar_url: publicUrl })
      } catch (profileError) {
        console.error('[ProfilePage] saving avatar_url to profiles failed:', profileError)
        throw profileError
      }
      try {
        await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      } catch {
        // user_metadata mirror is best-effort only.
      }
      setAvatarUrl(publicUrl)
      showToast('success', locale === 'ar' ? 'تم تحديث الصورة' : 'Avatar updated')
    } catch (err) {
      console.error('[ProfilePage] avatar upload failed:', err)
      setAvatarError(
        locale === 'ar' ? 'تعذّر رفع الصورة، حاول مجدداً' : 'Failed to upload image, try again'
      )
    } finally {
      setAvatarBusy(false)
    }
  }

  /** Strip spaces/dashes and normalize +213 / 00213 prefixes to local 0X form. */
  const normalizePhoneInput = (value: string): string => {
    let v = value.replace(/[\s.\-]/g, '').trim()
    if (v.startsWith('+213')) v = `0${v.slice(4)}`
    else if (v.startsWith('00213')) v = `0${v.slice(5)}`
    else if (v.startsWith('213') && v.length >= 12) v = `0${v.slice(3)}`
    return v
  }

  /** Empty is allowed (optional). Non-empty must match Algerian mobile format. */
  const isPhoneValidOrEmpty = (value: string): boolean => {
    const trimmed = value.trim()
    if (!trimmed) return true
    const cleaned = trimmed.replace(/[\s.\-]/g, '')
    return /^(0|\+213|00213)?[567][0-9]{8}$/.test(cleaned)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving || !user) return
    setFormError(null)

    const name = sanitizeText(fullName).trim()
    const normalizedPhone = normalizePhoneInput(phone)
    const wilayaNum = Number(wilayaId)

    if (!name) {
      setFormError(locale === 'ar' ? 'المرجو إدخال الاسم الكامل' : 'Please enter your full name')
      return
    }
    if (!isPhoneValidOrEmpty(phone)) {
      setFormError(
        locale === 'ar' ? 'رقم الهاتف غير صالح (05/06/07...)' : 'Invalid phone number (05/06/07...)'
      )
      return
    }
    if (!Number.isFinite(wilayaNum) || wilayaNum < 1 || wilayaNum > 58) {
      setFormError(locale === 'ar' ? 'المرجو اختيار الولاية' : 'Please select a wilaya')
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        full_name: name,
        phone_number: normalizedPhone || profile?.phone_number || '',
        wilaya_id: wilayaNum,
        avatar_url: avatarUrl || undefined,
      })
      try {
        localStorage.setItem(
          extrasKey(user.id),
          JSON.stringify({ commune: sanitizeText(commune).trim(), bio: sanitizeText(bio).trim() })
        )
      } catch {
        // Storage unavailable — core profile already saved.
      }
      showToast(
        'success',
        locale === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully'
      )
    } catch {
      const message =
        locale === 'ar' ? 'تعذّر حفظ التغييرات، حاول مجدداً' : 'Failed to save changes, try again'
      setFormError(message)
      showToast('error', message)
    } finally {
      setSaving(false)
    }
  }

  const handleRoleToggle = async () => {
    try {
      await updateRole(isSeller ? 'buyer' : 'seller')
      showToast('success', locale === 'ar' ? 'تم تبديل الدور' : 'Role switched')
    } catch {
      showToast('error', locale === 'ar' ? 'تعذّر تبديل الدور' : 'Failed to switch role')
    }
  }

  const handlePushToggle = async () => {
    if (pushBusy || !isPushSupported()) return
    setPushBusy(true)
    try {
      if (pushActive) {
        await unsubscribeFromPush()
        setPushActive(false)
        showToast('success', locale === 'ar' ? 'تم إيقاف الإشعارات' : 'Notifications disabled')
      } else {
        let res: Awaited<ReturnType<typeof subscribeToPush>>
        try {
          res = await subscribeToPush(user.id)
        } catch (err) {
          console.error('[ProfilePage] push subscribe threw:', err)
          showToast(
            'error',
            locale === 'ar'
              ? 'تعذّر تفعيل الإشعارات، حاول مجدداً'
              : 'Failed to enable notifications, try again'
          )
          return
        }
        if (res.ok) {
          setPushActive(true)
          showToast('success', locale === 'ar' ? 'تم تفعيل الإشعارات' : 'Notifications enabled')
        } else if (res.reason === 'denied') {
          showToast(
            'error',
            locale === 'ar'
              ? 'تم رفض إذن الإشعارات من المتصفح — فعّله من إعدادات الموقع ثم حاول مجدداً'
              : 'Notification permission was denied — enable it in site settings and try again'
          )
        } else if (res.reason === 'unsupported' || res.reason === 'no-sw') {
          showToast(
            'error',
            locale === 'ar'
              ? 'متصفحك لا يدعم إشعارات الدفع'
              : 'Your browser does not support push notifications'
          )
        } else if (res.reason === 'no-vapid') {
          showToast(
            'error',
            locale === 'ar'
              ? 'خدمة الإشعارات غير مهيأة حالياً'
              : 'Push service is not configured right now'
          )
        } else {
          showToast(
            'error',
            locale === 'ar'
              ? 'تعذّر تفعيل الإشعارات، حاول مجدداً'
              : 'Failed to enable notifications, try again'
          )
        }
      }
    } catch (err) {
      console.error('[ProfilePage] push toggle failed:', err)
      showToast(
        'error',
        locale === 'ar' ? 'تعذّر تغيير حالة الإشعارات' : 'Failed to change notification state'
      )
    } finally {
      setPushBusy(false)
    }
  }

  const handleSignOut = async () => {
    if (!confirmSignOut) {
      setConfirmSignOut(true)
      window.setTimeout(() => setConfirmSignOut(false), 4000)
      return
    }
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-28">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={cn(
            'fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-2xl backdrop-blur-lg',
            toast.type === 'success'
              ? 'bg-emerald-600/95 text-white'
              : 'bg-rose-600/95 text-white'
          )}
        >
          {toast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Avatar header */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative mx-auto h-24 w-24">
          <button
            type="button"
            onClick={handleAvatarClick}
            aria-label={locale === 'ar' ? 'تغيير الصورة' : 'Change avatar'}
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-2xl font-bold text-zinc-600 ring-2 ring-zinc-200 transition hover:ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(fullName || profile?.full_name || user.email || '')
            )}
            {avatarBusy && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleAvatarClick}
            aria-label={locale === 'ar' ? 'تعديل الصورة' : 'Edit avatar'}
            className="absolute -bottom-1 -end-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/40 transition hover:bg-emerald-600"
          >
            {avatarBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <h1 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">
          {profile?.full_name || user.email}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
        {avatarError && <p className="mt-2 text-xs text-rose-500">{avatarError}</p>}
        <span
          className={cn(
            'mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
            isSeller
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
          )}
        >
          {isSeller
            ? locale === 'ar'
              ? 'وكيل عقاري'
              : 'Agent'
            : locale === 'ar'
              ? 'باحث عن سكن'
              : 'Buyer'}
        </span>
      </div>

      {/* Personal info form */}
      <form
        onSubmit={handleSave}
        className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          {locale === 'ar' ? 'المعلومات الشخصية' : 'Personal information'}
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'الاسم الكامل' : 'Full name'}
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={locale === 'ar' ? 'مثال: أمين بن علي' : 'e.g. Amine Benali'}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'رقم الهاتف' : 'Phone number'}
            </label>
            <Input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0550123456"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {locale === 'ar' ? 'صيغة جزائرية: 05/06/07 متبوعة بـ 8 أرقام' : 'Algerian format: 05/06/07 + 8 digits'}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'الولاية' : 'Wilaya'}
            </label>
            <SearchableSelect
              value={wilayaId}
              onChange={setWilayaId}
              options={wilayaOptions}
              placeholder={locale === 'ar' ? 'اختر الولاية' : 'Select wilaya'}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'البلدية' : 'Commune'}
            </label>
            <Input
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              placeholder={locale === 'ar' ? 'مثال: باب الزوار' : 'e.g. Bab Ezzouar'}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'نبذة عني' : 'Bio'}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder={
                locale === 'ar'
                  ? 'اكتب نبذة قصيرة عنك (مفيد للوكلاء والبائعين)...'
                  : 'Short bio (useful for agents and sellers)...'
              }
              className="flex min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {locale === 'ar' ? 'نوع الحساب' : 'Account type'}
            </span>
            <div className="flex items-center justify-between rounded-xl bg-zinc-100 px-4 py-2.5 text-sm dark:bg-zinc-800">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                {isSeller
                  ? locale === 'ar'
                    ? 'وكيل عقاري'
                    : 'Agent'
                  : locale === 'ar'
                    ? 'باحث عن سكن'
                    : 'Buyer'}
              </span>
              <button
                type="button"
                onClick={handleRoleToggle}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50 dark:bg-zinc-700 dark:text-emerald-300 dark:hover:bg-zinc-600"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                {locale === 'ar' ? 'تبديل الدور' : 'Switch role'}
              </button>
            </div>
          </div>
        </div>

        {formError && (
          <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={saving} className="mt-5 w-full">
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : locale === 'ar' ? (
            'حفظ التغييرات'
          ) : (
            'Save changes'
          )}
        </Button>
      </form>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Link
          to="/my-listings"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Building2 className="mx-auto h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{myListingsCount}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {locale === 'ar' ? 'الإعلانات المنشورة' : 'My listings'}
          </p>
        </Link>
        <Link
          to="/favorites"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Heart className="mx-auto h-5 w-5 text-rose-500" />
          <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{favoritesCount}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {locale === 'ar' ? 'المفضلة' : 'Favorites'}
          </p>
        </Link>
        <Link
          to="/messages"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <MessageSquare className="mx-auto h-5 w-5 text-sky-600 dark:text-sky-400" />
          <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{messagesCount}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {locale === 'ar' ? 'الرسائل الواردة' : 'Messages'}
          </p>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={handlePushToggle}
          disabled={pushBusy || !isPushSupported()}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-start text-sm transition hover:bg-zinc-50 disabled:opacity-60 dark:hover:bg-zinc-800"
        >
          {pushBusy ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          ) : pushActive ? (
            <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <BellOff className="h-5 w-5 text-zinc-400" />
          )}
          <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-100">
            {locale === 'ar' ? 'تفعيل إشعارات الدفع' : 'Enable push notifications'}
          </span>
          <span
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              pushActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                pushActive ? 'end-0.5' : 'start-0.5'
              )}
            />
          </span>
        </button>

        <div className="my-2 border-t border-zinc-100 dark:border-zinc-800" />

        <Button
          type="button"
          variant="destructive"
          onClick={handleSignOut}
          className="w-full"
        >
          <LogOut className="h-4 w-4" />
          {confirmSignOut
            ? locale === 'ar'
              ? 'تأكيد تسجيل الخروج؟'
              : 'Confirm sign out?'
            : locale === 'ar'
              ? 'تسجيل الخروج'
              : 'Sign out'}
        </Button>
      </div>
    </div>
  )
}
