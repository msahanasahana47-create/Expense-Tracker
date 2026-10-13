'use client'

import { useState } from 'react'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { CATEGORY_CODES, formatDate, type Expense } from '@/lib/expense-types'
import { cn } from '@/lib/utils'
import { Money } from './money'

type ExpenseListProps = {
  expenses: Expense[]
  loading: boolean
  error: string | null
  hasActiveFilters: boolean
  onRetry: () => void
  onResetFilters: () => void
  onCreate: () => void
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => Promise<void>
}

export function ExpenseList({
  expenses,
  loading,
  error,
  hasActiveFilters,
  onRetry,
  onResetFilters,
  onCreate,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  if (loading) return <LoadingRows />

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-start gap-4 border-2 border-stamp p-6 md:p-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stamp">Error · could not load</p>
        <p className="font-serif text-3xl">The books won&apos;t open.</p>
        <p className="text-sm text-ink-soft">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-xs uppercase tracking-[0.15em] hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp"
        >
          <RotateCw className="size-3.5" aria-hidden="true" />
          Try again
        </button>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 border border-dashed border-ink-soft px-6 py-16 text-center">
        <p className="font-serif text-4xl italic">Nothing on the books.</p>
        <p className="max-w-sm text-sm text-ink-soft">
          {hasActiveFilters
            ? 'No entries match these filters. Loosen the search or widen the date range.'
            : 'Your ledger is empty. Record your first expense to get started.'}
        </p>
        <button
          type="button"
          onClick={hasActiveFilters ? onResetFilters : onCreate}
          className="mt-2 inline-flex items-center gap-2 border border-ink px-4 py-2 text-xs uppercase tracking-[0.15em] hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp"
        >
          {hasActiveFilters ? 'Clear filters' : (
            <>
              <Plus className="size-3.5" aria-hidden="true" /> New entry
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink text-left text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              <th scope="col" className="w-12 py-3 pr-2 font-normal">No.</th>
              <th scope="col" className="py-3 pr-4 font-normal">Date</th>
              <th scope="col" className="py-3 pr-4 font-normal">Particulars</th>
              <th scope="col" className="py-3 pr-4 font-normal">Category</th>
              <th scope="col" className="py-3 pr-4 font-normal">Method</th>
              <th scope="col" className="py-3 pr-4 text-right font-normal">Amount</th>
              <th scope="col" className="w-28 py-3 text-right font-normal">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <TableRow key={expense.id} expense={expense} index={index} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col md:hidden">
        {expenses.map((expense, index) => (
          <MobileRow key={expense.id} expense={expense} index={index} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    </>
  )
}

type RowProps = {
  expense: Expense
  index: number
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => Promise<void>
}

function TableRow({ expense, index, onEdit, onDelete }: RowProps) {
  return (
    <tr className="group border-b border-rule align-top transition-colors hover:bg-paper-deep/60">
      <td className="py-4 pr-2 text-xs tabular-nums text-ink-soft">{String(index + 1).padStart(2, '0')}</td>
      <td className="whitespace-nowrap py-4 pr-4 tabular-nums">{formatDate(expense.expenseDate)}</td>
      <td className="py-4 pr-4">
        <p className="font-medium">{expense.title}</p>
        {expense.notes && <p className="mt-0.5 max-w-xs text-xs leading-relaxed text-ink-soft">{expense.notes}</p>}
      </td>
      <td className="py-4 pr-4">
        <CategoryStamp category={expense.category} />
      </td>
      <td className="whitespace-nowrap py-4 pr-4 text-ink-soft">{expense.paymentMethod}</td>
      <td className="whitespace-nowrap py-4 pr-4 text-right text-xl leading-none">
        <Money value={expense.amount} />
      </td>
      <td className="py-3 text-right">
        <RowActions expense={expense} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  )
}

function MobileRow({ expense, index, onEdit, onDelete }: RowProps) {
  return (
    <li className="flex flex-col gap-3 border-b border-rule py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            {String(index + 1).padStart(2, '0')} · {formatDate(expense.expenseDate)}
          </p>
          <p className="mt-1 font-medium">{expense.title}</p>
          {expense.notes && <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{expense.notes}</p>}
        </div>
        <p className="shrink-0 text-2xl leading-none">
          <Money value={expense.amount} />
        </p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <CategoryStamp category={expense.category} />
          <span>{expense.paymentMethod}</span>
        </div>
        <RowActions expense={expense} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </li>
  )
}

function CategoryStamp({ category }: { category: Expense['category'] }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-ink px-1.5 py-0.5 text-[10px] uppercase tracking-[0.15em]">
      <span className="font-semibold">{CATEGORY_CODES[category]}</span>
      <span className="text-ink-soft">{category}</span>
    </span>
  )
}

function RowActions({ expense, onEdit, onDelete }: Omit<RowProps, 'index'>) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em]">
        <span className="mr-1 text-stamp">Strike?</span>
        <button
          type="button"
          disabled={deleting}
          onClick={async () => {
            setDeleting(true)
            await onDelete(expense)
            setDeleting(false)
            setConfirming(false)
          }}
          className="bg-stamp px-2 py-1 text-paper hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-60"
        >
          {deleting ? '…' : 'Yes'}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => setConfirming(false)}
          className="border border-ink px-2 py-[3px] hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1">
      <IconButton label={`Edit ${expense.title}`} onClick={() => onEdit(expense)}>
        <Pencil className="size-3.5" aria-hidden="true" />
      </IconButton>
      <IconButton label={`Delete ${expense.title}`} onClick={() => setConfirming(true)} danger>
        <Trash2 className="size-3.5" aria-hidden="true" />
      </IconButton>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label.split(' ')[0]}
      className={cn(
        'inline-flex size-8 items-center justify-center border border-transparent text-ink-soft transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp',
        danger ? 'hover:bg-stamp hover:text-paper hover:border-stamp' : 'hover:bg-ink hover:text-paper',
      )}
    >
      {children}
    </button>
  )
}

function LoadingRows() {
  return (
    <div aria-busy="true" aria-label="Loading entries" className="flex flex-col">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-rule py-5">
          <div className="h-3 w-6 animate-pulse bg-paper-deep" />
          <div className="h-3 w-20 animate-pulse bg-paper-deep" />
          <div className="h-3 flex-1 animate-pulse bg-paper-deep" />
          <div className="hidden h-3 w-16 animate-pulse bg-paper-deep md:block" />
          <div className="h-5 w-24 animate-pulse bg-paper-deep" />
        </div>
      ))}
    </div>
  )
}
