import { useState } from 'react'
import { Check, Copy, Link2, Loader2, UserPlus, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/i18n'
import { buildJoinLink, type SharedGroup } from '@/services/collaborativeFavoritesApi'

interface CollaborativeHeaderProps {
  group: SharedGroup | null
  currentUserId: string | null
  loading: boolean
  joinError: string | null
  onCreate: () => void
  onJoin: (code: string) => void
}

export function CollaborativeHeader({
  group,
  currentUserId,
  loading,
  joinError,
  onCreate,
  onJoin,
}: CollaborativeHeaderProps) {
  const { locale } = useLocale()
  const [modalOpen, setModalOpen] = useState(false)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const partner = group?.members.find((m) => m.userId !== currentUserId) ?? null
  const inviteLink = group ? buildJoinLink(group.inviteCode) : ''

  const handleCopy = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — user can copy manually from the input.
      setCopied(false)
    }
  }

  const handleJoin = () => {
    if (!code.trim()) return
    onJoin(code.trim().toUpperCase())
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600/10 dark:bg-primary-900/30">
          <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            {locale === 'ar' ? 'المفضلة المشتركة' : 'Favoris partagés'}
          </h2>
          {loading ? (
            <p className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {locale === 'ar' ? 'جارٍ التحميل…' : 'Chargement…'}
            </p>
          ) : partner ? (
            <p className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                {partner.displayName.trim().charAt(0).toUpperCase() || '?'}
              </span>
              <span className="truncate font-medium">{partner.displayName}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                {locale === 'ar' ? 'شريك نشط' : 'Partenaire actif'}
              </span>
            </p>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {locale === 'ar' ? 'ادعُ شريكك لمشاركة المفضلة' : 'Invitez votre partenaire à partager vos favoris'}
            </p>
          )}
        </div>
        {group ? (
          <Button size="sm" className="gap-1.5" onClick={() => setModalOpen(true)}>
            <Link2 className="h-4 w-4" />
            {locale === 'ar' ? 'شارك مع شريكك' : 'Partager avec votre partenaire'}
          </Button>
        ) : (
          <Button size="sm" className="gap-1.5" disabled={loading} onClick={onCreate}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {locale === 'ar' ? 'إنشاء مجموعة' : 'Créer un groupe'}
          </Button>
        )}
      </div>

      {/* Join with a code — inline */}
      <div className="mt-3 flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={locale === 'ar' ? 'أدخل رمز الدعوة…' : 'Code d’invitation…'}
          maxLength={12}
          className="font-mono tracking-widest"
        />
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" disabled={!code.trim()} onClick={handleJoin}>
          <UserPlus className="h-4 w-4" />
          {locale === 'ar' ? 'انضم' : 'Rejoindre'}
        </Button>
      </div>
      {joinError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{joinError}</p>
      )}

      {/* Invite modal */}
      {modalOpen && group && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl animate-scale-in dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {locale === 'ar' ? 'شارك مع شريكك' : 'Partager avec votre partenaire'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label={locale === 'ar' ? 'إغلاق' : 'Fermer'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {locale === 'ar'
                ? 'أرسل هذا الرابط لشريكك للانضمام إلى مفضلتكما المشتركة.'
                : 'Envoyez ce lien à votre partenaire pour rejoindre vos favoris partagés.'}
            </p>
            <div className="mt-4 flex gap-2">
              <Input value={inviteLink} readOnly className="font-mono text-xs" />
              <Button size="sm" className="shrink-0 gap-1.5" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied
                  ? locale === 'ar' ? 'تم النسخ!' : 'Copié !'
                  : locale === 'ar' ? 'نسخ' : 'Copier'}
              </Button>
            </div>
            <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800/60">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {locale === 'ar' ? 'أو رمز الدعوة' : 'Ou le code d’invitation'}
              </p>
              <p className="mt-0.5 text-2xl font-bold tracking-[0.3em] text-primary-600 dark:text-primary-400">
                {group.inviteCode}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
