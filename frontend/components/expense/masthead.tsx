import { Plus } from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'

type MastheadProps = {
  entryCount: number
  demo: boolean
  onCreate: () => void
}

export function Masthead({ entryCount, demo, onCreate }: MastheadProps) {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="border-b border-ink">
      {demo && (
        <div role="status" className="bg-ink px-4 py-2 text-center text-[11px] uppercase tracking-[0.18em] text-paper">
          Backend unreachable at <span className="text-stamp">{API_BASE_URL}</span> — showing demo ledger
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex items-center justify-between gap-4 border-b border-rule py-3 text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          <span suppressHydrationWarning>{today}</span>
          <span className="hidden sm:inline">Personal Accounts · Vol. {new Date().getFullYear()}</span>
          <span>No. {String(entryCount).padStart(3, '0')}</span>
        </div>
        <div className="flex flex-col gap-6 py-8 md:flex-row md:items-end md:justify-between md:py-10">
          <div>
            <h1 className="font-serif text-6xl leading-[0.85] tracking-tight md:text-8xl">
              Expense Tracker
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              A plain record of where the money went. Write it down, look it over, spend with intent.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="group inline-flex items-center gap-3 self-start border-2 border-ink bg-ink px-5 py-3 text-sm font-medium uppercase tracking-[0.15em] text-paper shadow-[4px_4px_0_0_var(--stamp)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--stamp)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:translate-y-0 active:shadow-[2px_2px_0_0_var(--stamp)] md:self-auto"
          >
            <Plus className="size-4 transition-transform group-hover:rotate-90" aria-hidden="true" />
            New entry
          </button>
        </div>
      </div>
    </header>
  )
}
