'use client'

import { useCallback, useDeferredValue, useState } from 'react'
import useSWR from 'swr'
import { createExpense, deleteExpense, fetchExpenses, isDemoMode, updateExpense } from '@/lib/api'
import type { Expense, ExpenseFilters, ExpenseInput } from '@/lib/expense-types'
import { Masthead } from './masthead'
import { SummaryCards } from './summary-cards'
import { FilterBar } from './filter-bar'
import { ExpenseList } from './expense-list'
import { ExpenseForm } from './expense-form'
import { ToastStack, type Toast } from './toast-stack'

const EMPTY_FILTERS: ExpenseFilters = { search: '', category: 'All', startDate: '', endDate: '' }

type FormState = { open: false } | { open: true; expense: Expense | null }

export function ExpenseDashboard() {
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_FILTERS)
  const [formState, setFormState] = useState<FormState>({ open: false })
  const [toasts, setToasts] = useState<Toast[]>([])

  const deferredSearch = useDeferredValue(filters.search)
  const queryFilters: ExpenseFilters = { ...filters, search: deferredSearch }

  const { data, error, isLoading, mutate } = useSWR(
    ['expenses', queryFilters.search, queryFilters.category, queryFilters.startDate, queryFilters.endDate],
    () => fetchExpenses(queryFilters),
    { keepPreviousData: true, revalidateOnFocus: false },
  )

  const expenses = data ?? []
  const hasActiveFilters =
    filters.search !== '' || filters.category !== 'All' || filters.startDate !== '' || filters.endDate !== ''

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToasts((current) => [...current, { ...toast, id: crypto.randomUUID() }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const closeForm = useCallback(() => setFormState({ open: false }), [])

  async function handleSubmit(input: ExpenseInput, id?: string) {
    if (id) {
      await updateExpense(id, input)
      pushToast({ tone: 'success', title: 'Entry amended', message: `“${input.title}” was updated.` })
    } else {
      await createExpense(input)
      pushToast({ tone: 'success', title: 'Entry recorded', message: `“${input.title}” was added to the ledger.` })
    }
    setFormState({ open: false })
    await mutate()
  }

  async function handleDelete(expense: Expense) {
    try {
      await deleteExpense(expense.id)
      pushToast({ tone: 'success', title: 'Entry struck', message: `“${expense.title}” was removed.` })
      await mutate()
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not delete',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      })
    }
  }

  return (
    <div className="min-h-dvh">
      <Masthead
        entryCount={expenses.length}
        demo={isDemoMode() && !isLoading}
        onCreate={() => setFormState({ open: true, expense: null })}
      />

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-24 pt-8 md:px-8">
        <SummaryCards expenses={expenses} loading={isLoading && !data} filtered={hasActiveFilters} />

        <section aria-labelledby="entries-heading" className="flex flex-col gap-5">
          <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
            <h2 id="entries-heading" className="font-serif text-3xl leading-none md:text-4xl">
              Entries
            </h2>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
              {expenses.length} {expenses.length === 1 ? 'record' : 'records'}
            </p>
          </div>

          <FilterBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(EMPTY_FILTERS)}
            hasActiveFilters={hasActiveFilters}
          />

          <ExpenseList
            expenses={expenses}
            loading={isLoading && !data}
            error={error instanceof Error ? error.message : error ? 'Unable to load expenses.' : null}
            hasActiveFilters={hasActiveFilters}
            onRetry={() => mutate()}
            onResetFilters={() => setFilters(EMPTY_FILTERS)}
            onCreate={() => setFormState({ open: true, expense: null })}
            onEdit={(expense) => setFormState({ open: true, expense })}
            onDelete={handleDelete}
          />
        </section>
      </main>

      {formState.open && (
        <ExpenseForm
          key={formState.expense?.id ?? 'new'}
          expense={formState.expense}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
