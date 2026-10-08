import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-[#295255]/10 text-[#295255] dark:bg-[#295255]/20 dark:text-primary-200',
        secondary: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
        success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        destructive: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        accent: 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300',
        outline: 'border border-zinc-200 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300',
        glass: 'bg-white/80 text-zinc-700 backdrop-blur-sm dark:bg-zinc-800/80 dark:text-zinc-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
