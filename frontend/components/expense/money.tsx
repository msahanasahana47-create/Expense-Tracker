import { formatAmount } from '@/lib/expense-types'
import { cn } from '@/lib/utils'

export function Money({ value, className, symbolClassName }: { value: number; className?: string; symbolClassName?: string }) {
  return (
    <span className={cn('font-serif tabular-nums', className)}>
      <span className={cn('mr-[0.08em] font-mono text-[0.6em] align-[0.35em] text-ink-soft', symbolClassName)}>₹</span>
      {formatAmount(value)}
    </span>
  )
}
