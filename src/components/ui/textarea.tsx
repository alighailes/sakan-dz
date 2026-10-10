import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 resize-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
              : 'border-zinc-200 focus:border-primary-500 focus:ring-primary-500/20 dark:border-zinc-700',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }