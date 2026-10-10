// BottomNav spec test: clean artifact-free bar + animated active indicator + role tabs.
// RED-GREEN: run with `node scripts/check-bottomnav-design06.cjs` — exit 1 = spec violated.
const fs = require('fs')
const path = require('path')

const bottomNavPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'BottomNav.tsx')
const layoutPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'Layout.tsx')
const supabasePath = path.join(__dirname, '..', 'src', 'lib', 'supabase.ts')
const authCtxPath = path.join(__dirname, '..', 'src', 'contexts', 'AuthContext.tsx')
const authStorePath = path.join(__dirname, '..', 'src', 'stores', 'authStore.ts')
const navbarPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'Navbar.tsx')
const twConfigPath = path.join(__dirname, '..', 'tailwind.config.js')

const src = fs.readFileSync(bottomNavPath, 'utf8')
const layout = fs.readFileSync(layoutPath, 'utf8')

let failures = 0
function check(name, cond) {
  if (cond) {
    console.log(`PASS: ${name}`)
  } else {
    failures++
    console.log(`FAIL: ${name}`)
  }
}

// 1. Clean bar: no SVG cutout artifacts, polished translucent bar, mobile only
check('no SVG cutout artifacts', !src.includes('<svg'))
check('bar fixed bottom full-bleed (fixed bottom-0 inset-x-0 z-40)', src.includes('fixed bottom-0 inset-x-0 z-40'))
check('bar mobile-only (md:hidden)', src.includes('md:hidden'))
check('bar translucent theme bg (bg-white/95 dark:bg-zinc-900/95)', src.includes('bg-white/95') && src.includes('dark:bg-zinc-900/95'))
check('bar blur + clean top edge (backdrop-blur-md border-t border-zinc-200)',
  src.includes('backdrop-blur-md') && src.includes('border-t') && src.includes('border-zinc-200'))
check('bar height ~64px (h-16)', src.includes('h-16'))
check('safe-area bottom padding (pb-[env(safe-area-inset-bottom)])', src.includes('pb-[env(safe-area-inset-bottom)]'))
// 2. Animated floating active indicator (no static center FAB)
check('no static center FAB (no h-14 w-14 / -top-6)', !src.includes('h-14 w-14') && !src.includes('-top-6'))
check('active floating pill (bg-emerald-600 text-white shadow-lg shadow-emerald-600/30)',
  ['bg-emerald-600', 'text-white', 'shadow-lg', 'shadow-emerald-600/30'].every((t) => src.includes(t)))
check('active elevation + smooth motion (-translate-y-2 transition-all duration-300)',
  src.includes('-translate-y-2') && src.includes('transition-all') && src.includes('duration-300'))
check('spring easing utility used (ease-spring)', src.includes('ease-spring'))
check('inactive items at baseline (text-zinc-400 dark:text-zinc-500)',
  src.includes(' text-zinc-400') && src.includes('dark:text-zinc-500'))
// 3. Buyer tabs (Home / Listings / Map / Favorites / Profile)
check('buyer Home icon to /', src.includes('Home') && src.includes("'/'"))
check('buyer listings icon to /listings', /\b(Building2|Search)\b/.test(src) && src.includes("'/listings'"))
check('buyer Map icon to /map (critical)', /\bMap\b/.test(src) && src.includes("'/map'"))
check('buyer Heart to /favorites', src.includes('Heart') && src.includes("'/favorites'"))
check('buyer User to /auth', src.includes('User') && src.includes("'/auth'"))
// 4. Role-adaptive agent tabs (Home / My listings / Publish / Messages / Profile)
check('role check via activeRole', src.includes('activeRole'))
check('agent home tab (Home → / alongside buyer)', (src.match(/to: '\/'/g) || []).length >= 2)
check('agent my-listings via t.nav.myListings', src.includes('t.nav.myListings') && src.includes("'/my-listings'"))
check('agent publish via PlusCircle', src.includes('PlusCircle') && src.includes("'/publish'"))
check('agent messages to /messages', src.includes('MessageSquare') && src.includes("'/messages'"))
// 5. Labels + active route wiring
check('localized micro labels (text-[10px] font-medium mt-1)', src.includes('text-[10px] font-medium mt-1'))
check('active route styling (useLocation + isActive/to===pathname)', src.includes('useLocation()') && /location\.pathname/.test(src))
// 6. Easing is real (defined in theme, not a dead class)
const twConfig = fs.readFileSync(twConfigPath, 'utf8')
check('spring easing defined in theme (transitionTimingFunction)', twConfig.includes('spring') && twConfig.includes('cubic-bezier'))
// 7. Integration
check('Layout renders <BottomNav />', layout.includes('<BottomNav />'))
check('Layout mobile content padding (pb-20)', layout.includes('pb-20'))
// 8. Auth flicker guards (unchanged behavior, still enforced)
const supabaseLib = fs.readFileSync(supabasePath, 'utf8')
const authCtx = fs.readFileSync(authCtxPath, 'utf8')
const authStore = fs.readFileSync(authStorePath, 'utf8')
const navbar = fs.readFileSync(navbarPath, 'utf8')
check('supabase lib exposes cached-session reader', supabaseLib.includes('readCachedSupabaseSession') && supabaseLib.includes('sb-'))
check('AuthContext seeds user synchronously from cache', authCtx.includes('readCachedSupabaseSession'))
check('authStore seeds user synchronously from cache', authStore.includes('readCachedSupabaseSession'))
check('Navbar holds skeleton while loading (no login flash)', navbar.includes('animate-pulse'))

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED — spec not satisfied.`)
  process.exit(1)
} else {
  console.log('\nAll checks passed.')
}
