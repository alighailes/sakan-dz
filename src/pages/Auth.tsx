import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Phone, Building2, Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { WILAYAS } from '@/constants'
import { cn } from '@/lib/utils'
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'
import { signalPushNudge } from '@/services/notifications'
import type { UserType } from '@/types'

type AuthView = 'login' | 'register' | 'forgot'

export function AuthPage() {
  const [view, setView] = useState<AuthView>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { locale, t } = useLocale()
  const { signUp, signInWithPassword, resetPassword, loading, error, clearError } = useAuthStore()

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regUserType, setRegUserType] = useState<UserType>('individual')
  const [regAgencyName, setRegAgencyName] = useState('')
  const [regWilayaId, setRegWilayaId] = useState(16)
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const from = (location.state as { from?: string })?.from || '/'

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePhone = (phone: string) => /^(0)(5|6|7)[0-9]{8}$/.test(phone.replace(/\s/g, ''))

  const switchView = (v: AuthView) => {
    setView(v)
    setErrors({})
    clearError()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!loginEmail.trim()) newErrors.loginEmail = t.auth.emailRequired
    else if (!validateEmail(loginEmail)) newErrors.loginEmail = t.auth.invalidEmail
    if (!loginPassword) newErrors.loginPassword = t.auth.passwordRequired

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      await signInWithPassword(loginEmail, loginPassword)
      signalPushNudge()
      navigate(from, { replace: true })
    } catch {
      // Error is handled by the store
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!regFullName.trim()) newErrors.regFullName = t.auth.fullNameRequired
    if (!regEmail.trim()) newErrors.regEmail = t.auth.emailRequired
    else if (!validateEmail(regEmail)) newErrors.regEmail = t.auth.invalidEmail
    if (!regPhone.trim()) newErrors.regPhone = t.auth.phoneRequired
    else if (!validatePhone(regPhone)) newErrors.regPhone = t.auth.invalidPhone
    if (!regPassword) newErrors.regPassword = t.auth.passwordRequired
    else if (regPassword.length < 8) newErrors.regPassword = t.auth.passwordMinLength
    else if (!/[0-9]/.test(regPassword)) newErrors.regPassword = t.auth.passwordNeedsNumber
    else if (!/[A-ZÀ-Þ]/.test(regPassword)) newErrors.regPassword = t.auth.passwordNeedsUppercase
    if (regPassword !== regConfirmPassword) newErrors.regConfirmPassword = t.auth.passwordMismatch
    if (regUserType === 'agency' && !regAgencyName.trim()) newErrors.regAgencyName = t.auth.agencyNameRequired

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      await signUp(sanitizeEmail(regEmail), regPassword, {
        full_name: sanitizeText(regFullName),
        phone_number: sanitizePhone(regPhone),
        user_type: regUserType,
        agency_name: regUserType === 'agency' ? sanitizeText(regAgencyName) : undefined,
        wilaya_id: regWilayaId,
      })
      signalPushNudge()
      navigate(from, { replace: true })
    } catch {
      // Error is handled by the store
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!forgotEmail.trim()) newErrors.forgotEmail = t.auth.emailRequired
    else if (!validateEmail(forgotEmail)) newErrors.forgotEmail = t.auth.invalidEmail

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      await resetPassword(forgotEmail)
      setResetSent(true)
    } catch {
      // Error is handled by the store
    }
  }

  const getError = (key: string) => errors[key]

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
          {/* Tab Switcher */}
          {view !== 'forgot' && (
            <div className="mb-6 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              <button
                onClick={() => switchView('login')}
                className={cn(
                  'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
                  view === 'login'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {t.auth.login}
              </button>
              <button
                onClick={() => switchView('register')}
                className={cn(
                  'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
                  view === 'register'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {t.auth.register}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Login Form */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.auth.welcomeBack}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.auth.loginSubtitle}</p>
              </div>

              <div>
                <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder={t.auth.emailPlaceholder}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    error={getError('loginEmail')}
                  />
                </div>
                {getError('loginEmail') && (
                  <p className="mt-1 text-xs text-red-500">{getError('loginEmail')}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.auth.passwordPlaceholder}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10"
                    error={getError('loginPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {getError('loginPassword') && (
                  <p className="mt-1 text-xs text-red-500">{getError('loginPassword')}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => switchView('forgot')}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  {t.auth.forgotPassword}
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  t.auth.loginButton
                )}
              </Button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {t.auth.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  {t.auth.register}
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.auth.createAccount}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.auth.registerSubtitle}</p>
              </div>

              <div>
                <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.fullName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder={t.auth.fullNamePlaceholder}
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="pl-10"
                    error={getError('regFullName')}
                  />
                </div>
                {getError('regFullName') && (
                  <p className="mt-1 text-xs text-red-500">{getError('regFullName')}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder={t.auth.emailPlaceholder}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-10"
                    error={getError('regEmail')}
                  />
                </div>
                {getError('regEmail') && (
                  <p className="mt-1 text-xs text-red-500">{getError('regEmail')}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.phone}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder={t.auth.phonePlaceholder}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="pl-10"
                    error={getError('regPhone')}
                    dir="ltr"
                  />
                </div>
                {getError('regPhone') && (
                  <p className="mt-1 text-xs text-red-500">{getError('regPhone')}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.userType}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegUserType('individual')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all',
                      regUserType === 'individual'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                    )}
                  >
                    <User className="h-4 w-4" />
                    {t.auth.individual}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegUserType('agency')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all',
                      regUserType === 'agency'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    {t.auth.agency}
                  </button>
                </div>
              </div>

              {regUserType === 'agency' && (
                <div className="animate-fade-in">
                  <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.auth.agencyName}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder={t.auth.agencyNamePlaceholder}
                      value={regAgencyName}
                      onChange={(e) => setRegAgencyName(e.target.value)}
                      className="pl-10"
                      error={getError('regAgencyName')}
                    />
                  </div>
                  {getError('regAgencyName') && (
                    <p className="mt-1 text-xs text-red-500">{getError('regAgencyName')}</p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.wilaya}
                </label>
                <SearchableSelect
                  value={String(regWilayaId)}
                  onChange={(v) => setRegWilayaId(Number(v) || 16)}
                  options={WILAYAS.map((w) => ({
                    value: String(w.id),
                    label: locale === 'ar' ? `${w.nameAr} (${w.id})` : `${w.name} (${w.id})`,
                  }))}
                  placeholder={t.auth.wilaya}
                />
              </div>

              <div>
                <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.auth.passwordPlaceholder}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-10 pr-10"
                    error={getError('regPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {getError('regPassword') && (
                  <p className="mt-1 text-xs text-red-500">{getError('regPassword')}</p>
                )}
                {/* Live password requirements checklist */}
                <ul className="mt-2 space-y-1">
                  {[
                    { ok: regPassword.length >= 8, label: t.auth.passwordMin8 },
                    { ok: /[0-9]/.test(regPassword), label: t.auth.passwordNeedsNumber },
                    { ok: /[A-ZÀ-Þ]/.test(regPassword), label: t.auth.passwordNeedsUppercase },
                  ].map((rule) => (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        rule.ok
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-400 dark:text-red-400'
                      }`}
                    >
                      {rule.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    error={getError('regConfirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {getError('regConfirmPassword') && (
                  <p className="mt-1 text-xs text-red-500">{getError('regConfirmPassword')}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  t.auth.registerButton
                )}
              </Button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {t.auth.hasAccount}{' '}
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  {t.auth.login}
                </button>
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.auth.backToLogin}
              </button>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.auth.resetPasswordSuccess}</h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t.auth.resetPasswordSuccessHint}</p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => switchView('login')}
                  >
                    {t.auth.backToLogin}
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.auth.resetPasswordTitle}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.auth.resetPasswordInstructions}</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.auth.email}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        placeholder={t.auth.emailPlaceholder}
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10"
                        error={getError('forgotEmail')}
                      />
                    </div>
                    {getError('forgotEmail') && (
                      <p className="mt-1 text-xs text-red-500">{getError('forgotEmail')}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      t.auth.resetPasswordButton
                    )}
                  </Button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
