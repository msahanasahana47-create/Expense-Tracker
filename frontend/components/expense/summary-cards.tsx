import { CATEGORIES, CATEGORY_CODES, formatAmount, formatCurrency, type Expense } from '@/lib/expense-types'
import { cn } from '@/lib/utils'

type SummaryCardsProps = {
  expenses: Expense[]
  loading: boolean
  filtered: boolean
}

const SEGMENT_SHADES = ['bg-stamp', 'bg-ink', 'bg-ink/70', 'bg-moss', 'bg-ink/40', 'bg-ink/20']

export function SummaryCards({ expenses, loading, filtered }: SummaryCardsProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const largest = expenses.reduce<Expense | null>((max, e) => (!max || e.amount > max.amount ? e : max), null)
  const average = expenses.length ? total / expenses.length : 0

  const breakdown = CATEGORIES.map((category) => {
    const items = expenses.filter((e) => e.category === category)
    const amount = items.reduce((sum, e) => sum + e.amount, 0)
    return { category, amount, count: items.length, share: total ? amount / total : 0 }
  }).sort((a, b) => b.amount - a.amount)

  const [whole, fraction] = formatAmount(total).split('.')

  return (
    <section aria-labelledby="summary-heading" className="grid gap-px border border-ink bg-ink lg:grid-cols-[1.1fr_1fr]">
      <h2 id="summary-heading" className="sr-only">
        Spending summary
      </h2>

      <div className="flex flex-col justify-between gap-8 bg-paper p-6 md:p-8">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          <span>Total outlay</span>
          <span className="border border-ink px-2 py-0.5 text-ink">{filtered ? 'Filtered view' : 'All time'}</span>
        </div>

        {loading ? (
          <div className="h-24 w-3/4 animate-pulse bg-paper-deep" aria-label="Loading total" />
        ) : (
          <p className="font-serif leading-none tracking-tight">
            <span className="mr-2 align-[0.9em] font-mono text-2xl text-stamp md:text-3xl">₹</span>
            <span className="text-6xl sm:text-7xl md:text-8xl">{whole}</span>
            <span className="text-3xl text-ink-soft md:text-4xl">.{fraction}</span>
          </p>
        )}

        <dl className="grid grid-cols-3 border-t border-rule pt-4">
          <Stat label="Entries" value={loading ? '—' : String(expenses.length)} />
          <Stat label="Average" value={loading ? '—' : formatCurrency(average)} />
          <Stat
            label="Largest"
            value={loading || !largest ? '—' : formatCurrency(largest.amount)}
            hint={largest?.title}
          />
        </dl>
      </div>

      <div className="flex flex-col gap-5 bg-paper p-6 md:p-8">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          <span>By category</span>
          <span>Share</span>
        </div>

        <div className="flex h-3 w-full overflow-hidden border border-ink" role="img" aria-label="Category share of spending">
          {total > 0 &&
            breakdown
              .filter((b) => b.amount > 0)
              .map((b, i) => (
                <div
                  key={b.category}
                  className={cn('h-full transition-[width] duration-700', SEGMENT_SHADES[i])}
                  style={{ width: `${b.share * 100}%` }}
                />
              ))}
        </div>

        <ul className="flex flex-col">
          {breakdown.map((b, i) => (
            <li key={b.category} className="flex items-baseline gap-3 py-1.5 text-sm">
              <span
                aria-hidden="true"
                className={cn('size-2.5 shrink-0 translate-y-[-1px] border border-ink', b.amount > 0 ? SEGMENT_SHADES[i] : 'bg-transparent')}
              />
              <span className="w-9 shrink-0 text-[11px] tracking-wider text-ink-soft">{CATEGORY_CODES[b.category]}</span>
              <span className={cn(b.amount === 0 && 'text-ink-soft')}>{b.category}</span>
              <span className="leader h-3 flex-1" aria-hidden="true" />
              <span className="tabular-nums">{loading ? '—' : formatCurrency(b.amount)}</span>
              <span className="w-12 text-right text-xs tabular-nums text-ink-soft">
                {loading ? '' : `${Math.round(b.share * 100)}%`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 border-l border-rule px-3 first:border-l-0 first:pl-0">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium tabular-nums md:text-base">{value}</dd>
      {hint && <dd className="truncate text-[11px] text-ink-soft">{hint}</dd>}
    </div>
  )
}
