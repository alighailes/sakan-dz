import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Check, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/i18n'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

type RecoveryState = 'verifying' | 'ready' | 'invalid'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useLocale()

  const [state, setState] = useState<RecoveryState>('verifying')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Wait for Supabase to process the recovery link (?code= / #access_token).
  // detectSessionInUrl exchanges it automatically and fires PASSWORD_RECOVERY.
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState('ready') // mock / dev mode: allow exercising the form
      return
    }

    let settled = false
    const settle = (s: RecoveryState) => {
      if (!settled) {
        settled = true
        setState(s)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) settle('ready')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') settle('ready')
      else if (session) settle('ready')
    })

    // No recovery session arrived in time: the link is missing, expired or already used.
    const timer = window.setTimeout(() => settle('invalid'), 4000)

    return () => {
      settled = true
      window.clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!newPassword) newErrors.newPassword = t.auth.passwordRequired
    else if (newPassword.length < 6) newErrors.newPassword = t.auth.passwordMinLength
    if (newPassword !== confirmPassword) newErrors.confirmPassword = t.auth.passwordMismatch

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800))
      }
      setSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.common.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <svg viewBox="0 0 32 32" className="h-5 w-5">
                <path d="M8 16l8-8 8 8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 14v8h12v-8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Sakan <span className="text-primary-600">DZ</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          {state === 'verifying' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t.common.loading}</p>
            </div>
          )}

          {state === 'invalid' && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <TriangleAlert className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.auth.invalidRecoveryLink}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t.auth.invalidRecoveryLinkHint}
              </p>
              <Button className="mt-6 w-full" onClick={() => navigate('/auth')}>
                {t.auth.requestNewLink}
              </Button>
            </div>
          )}

          {state === 'ready' && !success && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.auth.newPasswordTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t.auth.newPasswordSubtitle}
                </p>
              </div>

              {submitError && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {submitError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.newPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.auth.passwordPlaceholder}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    error={errors.newPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    error={errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  t.auth.updatePasswordButton
                )}
              </Button>
            </form>
          )}

          {state === 'ready' && success && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.auth.passwordUpdateSuccess}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t.auth.passwordUpdateSuccessHint}
              </p>
              <Button className="mt-6 w-full" onClick={() => navigate('/auth')}>
                {t.auth.backToLogin}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
