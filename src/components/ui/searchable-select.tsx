import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/i18n'

export interface SearchableOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: SearchableOption[]
  placeholder?: string
  /** Placeholder of the inner filter input. Defaults to a wilaya-style hint per locale. */
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  name?: string
}

/**
 * Searchable dropdown (Combobox) — type to filter, smooth vertical scroll
 * for touch devices. Dependency-free, keyboard-friendly (Escape closes),
 * closes on outside click / selection.
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  disabled = false,
  className,
  name,
}: SearchableSelectProps) {
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)

  const filterPlaceholder =
    searchPlaceholder ??
    (locale === 'ar'
      ? 'اختر أو اكتب ولاية (مثال: الجزائر، وهران، سعيدة)...'
      : 'Sélectionnez ou tapez une wilaya (ex: Alger, Oran, Saïda)...')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    )
  }, [options, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const id = window.setTimeout(() => searchRef.current?.focus(), 30)
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open ])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100',
          !selected && 'text-zinc-400 dark:text-zinc-500'
        )}
      >
        <span className="block truncate text-start">
          {selected ? selected.label : (placeholder ?? '')}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && !disabled && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-soft-lg dark:border-zinc-700 dark:bg-zinc-800">
          <div className="relative border-b border-zinc-100 dark:border-zinc-700">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={filterPlaceholder}
              className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
          <ul
            role="listbox"
            className="max-h-60 touch-pan-y overflow-y-auto overscroll-contain p-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                {locale === 'ar' ? 'لا توجد نتائج مطابقة' : 'Aucun résultat'}
              </li>
            )}
            {filtered.map((o) => {
              const active = o.value === value
              return (
                <li key={o.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors',
                      active
                        ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/60'
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {active && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
