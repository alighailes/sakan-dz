import { Link } from 'react-router-dom'
import { Facebook, Instagram, Linkedin, Mail, Phone, Home, Users, Shield, BookOpen } from 'lucide-react'
import { useLocale } from '@/i18n'

export function Footer() {
  const { locale } = useLocale()

  return (
    <footer className="border-t border-emerald-900/30 bg-gradient-to-b from-emerald-950 via-emerald-900 to-zinc-950 pb-16 dark:border-emerald-900/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
          {/* Col 1 & 2: Brand info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-glow">
                <svg viewBox="0 0 32 32" className="h-6 w-6">
                  <path d="M8 16l8-8 8 8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 14v8h12v-8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                Sakan <span className="text-emerald-400">DZ</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-zinc-300 max-w-xs leading-relaxed">
              {locale === 'ar'
                ? 'سكن DZ هي المنصة العقارية الرائدة في الجزائر، تربط البائعين والمشترين بوكلاء معتمدين لإتمام صفقات آمنة وشفافة.'
                : 'Sakan DZ est la plateforme immobilière de référence en Algérie, connectant vendeurs et acheteurs avec des agents certifiés pour des transactions sécurisées et transparentes.'}
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-300 hidden sm:block">
                {locale === 'ar' ? 'تابعنا' : 'Suivez-nous'}
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/50 text-zinc-300 transition-all hover:bg-emerald-600 hover:text-white"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/50 text-zinc-300 transition-all hover:bg-emerald-600 hover:text-white"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/50 text-zinc-300 transition-all hover:bg-emerald-600 hover:text-white"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: About links */}
          <div>
            <h3 className="text-white font-bold mb-4">{locale === 'ar' ? 'عن سكن DZ' : 'À propos de Sakan DZ'}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  {locale === 'ar' ? 'من نحن' : 'Qui sommes-nous'}
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-sm text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  {locale === 'ar' ? 'فرص العمل' : 'Carrières'}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {locale === 'ar' ? 'اتصل بنا' : 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Help & Services */}
          <div>
            <h3 className="text-white font-bold mb-4">{locale === 'ar' ? 'المساعدة والخدمات' : 'Aide et Services'}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help"
                  className="text-sm text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  {locale === 'ar' ? 'مركز المساعدة' : 'Centre d\'aide'}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
                </Link>
              </li>
              <li>
                <Link
                  to="/publish"
                  className="text-sm text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  {locale === 'ar' ? 'أضف إعلاناً' : 'Publier une annonce'}
                </Link>
              </li>
              <li>
                <Link
                  to="/agents"
                  className="text-sm text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  {locale === 'ar' ? 'الوكلاء المعتمدين' : 'Agents certifiés'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">{locale === 'ar' ? 'قانوني وتواصل' : 'Légal et Contact'}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {locale === 'ar' ? 'شروط الاستخدام' : 'Conditions d\'utilisation'}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {locale === 'ar' ? 'سياسة الخصوصية' : 'Politique de confidentialité'}
                </Link>
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href="mailto:contact@sakandz.com"
                  className="hover:text-emerald-400 transition-colors"
                >
                  contact@sakandz.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href="tel:+213550000000"
                  className="hover:text-emerald-400 transition-colors"
                >
                  +213 550 000 000
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-12 border-t border-emerald-900/30 pt-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-zinc-400 text-center sm:text-left">
              {locale === 'ar' ? '© 2026 سكن DZ. جميع الحقوق محفوظة.' : '© 2026 Sakan DZ. Tous droits réservés.'}
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <Link
                to="/terms"
                className="hover:text-emerald-400 transition-colors"
              >
                {locale === 'ar' ? 'شروط الاستخدام' : 'Conditions d\'utilisation'}
              </Link>
              <Link
                to="/privacy"
                className="hover:text-emerald-400 transition-colors"
              >
                {locale === 'ar' ? 'سياسة الخصوصية' : 'Politique de confidentialité'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}