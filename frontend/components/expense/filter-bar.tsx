import { Search, X } from 'lucide-react'
import { CATEGORIES, type ExpenseFilters } from '@/lib/expense-types'

type FilterBarProps = {
  filters: ExpenseFilters
  onChange: (filters: ExpenseFilters) => void
  onReset: () => void
  hasActiveFilters: boolean
}

const fieldClass =
  'w-full border-0 border-b border-ink bg-transparent py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-stamp'

export function FilterBar({ filters, onChange, onReset, hasActiveFilters }: FilterBarProps) {
  const update = <K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-2 gap-x-6 gap-y-5 bg-paper-deep/60 p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end md:p-5"
    >
      <label className="col-span-2 flex flex-col gap-1 md:col-span-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">Search title</span>
        <span className="relative flex items-center">
          <Search className="pointer-events-none absolute left-0 size-4 text-ink-soft" aria-hidden="true" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="e.g. groceries"
            className={`${fieldClass} pl-6`}
          />
        </span>
      </label>

      <label className="col-span-2 flex flex-col gap-1 md:col-span-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">Category</span>
        <select
          value={filters.category}
          onChange={(e) => update('category', e.target.value as ExpenseFilters['category'])}
          className={`${fieldClass} cursor-pointer`}
        >
          <option value="All">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">From</span>
        <input
          type="date"
          value={filters.startDate}
          max={filters.endDate || undefined}
          onChange={(e) => update('startDate', e.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">To</span>
        <input
          type="date"
          value={filters.endDate}
          min={filters.startDate || undefined}
          onChange={(e) => update('endDate', e.target.value)}
          className={fieldClass}
        />
      </label>

      <button
        type="button"
        onClick={onReset}
        disabled={!hasActiveFilters}
        className="col-span-2 inline-flex items-center justify-center gap-1.5 border border-ink px-3 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink md:col-span-1"
      >
        <X className="size-3.5" aria-hidden="true" />
        Clear
      </button>
    </form>
  )
}
