'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import {
  CATEGORIES,
  PAYMENT_METHODS,
  todayISO,
  type Category,
  type Expense,
  type ExpenseInput,
  type PaymentMethod,
} from '@/lib/expense-types'
import { cn } from '@/lib/utils'

type ExpenseFormProps = {
  expense: Expense | null
  onClose: () => void
  onSubmit: (input: ExpenseInput, id?: string) => Promise<void>
}

type FormValues = {
  title: string
  category: Category | ''
  amount: string
  paymentMethod: PaymentMethod | ''
  expenseDate: string
  notes: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.title.trim()) errors.title = 'Title is required.'
  else if (values.title.trim().length > 100) errors.title = 'Keep the title under 100 characters.'
  if (!values.category) errors.category = 'Choose a category.'
  if (!values.amount.trim()) errors.amount = 'Amount is required.'
  else if (!Number.isFinite(Number(values.amount)) || Number(values.amount) <= 0)
    errors.amount = 'Amount must be greater than 0.'
  if (!values.paymentMethod) errors.paymentMethod = 'Choose a payment method.'
  if (!values.expenseDate) errors.expenseDate = 'Date is required.'
  else if (values.expenseDate > todayISO()) errors.expenseDate = 'Date cannot be in the future.'
  if (values.notes.length > 300) errors.notes = 'Notes must be 300 characters or fewer.'
  return errors
}

export function ExpenseForm({ expense, onClose, onSubmit }: ExpenseFormProps) {
  const isEdit = Boolean(expense)
  const [values, setValues] = useState<FormValues>({
    title: expense?.title ?? '',
    category: expense?.category ?? '',
    amount: expense ? String(expense.amount) : '',
    paymentMethod: expense?.paymentMethod ?? '',
    expenseDate: expense?.expenseDate ?? todayISO(),
    notes: expense?.notes ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstFieldRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    const next = { ...values, [key]: value }
    setValues(next)
    if (submitted) setErrors(validate(next))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    setServerError(null)
    try {
      await onSubmit(
        {
          title: values.title.trim(),
          category: values.category as Category,
          amount: Math.round(Number(values.amount) * 100) / 100,
          paymentMethod: values.paymentMethod as PaymentMethod,
          expenseDate: values.expenseDate,
          notes: values.notes.trim(),
        },
        expense?.id,
      )
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save this entry.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close form"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-form-title"
        className="relative flex h-full w-full max-w-md flex-col bg-paper shadow-[-12px_0_0_0_var(--ink)] animate-in slide-in-from-right duration-300"
      >
        <div className="perforation h-2.5 w-full bg-ink" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 border-b border-ink px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              {isEdit ? 'Amendment slip' : 'Receipt · new'}
            </p>
            <h2 id="expense-form-title" className="mt-1 font-serif text-4xl leading-none">
              {isEdit ? 'Edit entry' : 'Record expense'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-9 items-center justify-center border border-ink hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
            {serverError && (
              <p role="alert" className="border-l-4 border-stamp bg-stamp/10 px-3 py-2 text-sm text-stamp">
                {serverError}
              </p>
            )}

            <Field label="Title" htmlFor="title" error={errors.title} required>
              <input
                ref={firstFieldRef}
                id="title"
                value={values.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="What did you pay for?"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'title-error' : undefined}
                className={inputClass(errors.title)}
              />
            </Field>

            <Field label="Amount (₹)" htmlFor="amount" error={errors.amount} required>
              <div className="relative">
                <span className="pointer-events-none absolute bottom-3.5 left-0 font-mono text-xl text-ink-soft">₹</span>
                <input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={values.amount}
                  onChange={(e) => setField('amount', e.target.value)}
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.amount)}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                  className={cn(inputClass(errors.amount), 'pl-6 font-serif text-4xl tabular-nums')}
                />
              </div>
            </Field>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                Category <span className="text-stamp">*</span>
              </legend>
              <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-describedby={errors.category ? 'category-error' : undefined}>
                {CATEGORIES.map((c) => {
                  const active = values.category === c
                  return (
                    <label
                      key={c}
                      className={cn(
                        'cursor-pointer border px-2 py-2 text-center text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-stamp',
                        active ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-ink',
                      )}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={c}
                        checked={active}
                        onChange={() => setField('category', c)}
                        className="sr-only"
                      />
                      {c}
                    </label>
                  )
                })}
              </div>
              {errors.category && <ErrorText id="category-error">{errors.category}</ErrorText>}
            </fieldset>

            <div className="grid grid-cols-2 gap-5">
              <Field label="Payment method" htmlFor="paymentMethod" error={errors.paymentMethod} required>
                <select
                  id="paymentMethod"
                  value={values.paymentMethod}
                  onChange={(e) => setField('paymentMethod', e.target.value as PaymentMethod)}
                  aria-invalid={Boolean(errors.paymentMethod)}
                  aria-describedby={errors.paymentMethod ? 'paymentMethod-error' : undefined}
                  className={cn(inputClass(errors.paymentMethod), 'cursor-pointer')}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date" htmlFor="expenseDate" error={errors.expenseDate} required>
                <input
                  id="expenseDate"
                  type="date"
                  max={todayISO()}
                  value={values.expenseDate}
                  onChange={(e) => setField('expenseDate', e.target.value)}
                  aria-invalid={Boolean(errors.expenseDate)}
                  aria-describedby={errors.expenseDate ? 'expenseDate-error' : undefined}
                  className={inputClass(errors.expenseDate)}
                />
              </Field>
            </div>

            <Field label="Notes" htmlFor="notes" error={errors.notes} hint={`${values.notes.length}/300`}>
              <textarea
                id="notes"
                rows={3}
                value={values.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Optional details"
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={errors.notes ? 'notes-error' : undefined}
                className={cn(inputClass(errors.notes), 'resize-none border bg-paper-deep/40 p-3')}
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 border-t border-dashed border-ink px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-ink px-4 py-3 text-xs uppercase tracking-[0.15em] hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] border-2 border-ink bg-ink px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-paper shadow-[3px_3px_0_0_var(--stamp)] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:translate-y-0 disabled:opacity-60"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to ledger'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}

function inputClass(error?: string) {
  return cn(
    'w-full border-0 border-b bg-transparent py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60',
    error ? 'border-stamp focus:border-stamp' : 'border-ink focus:border-stamp',
  )
}

function Field({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label htmlFor={htmlFor} className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          {label} {required && <span className="text-stamp">*</span>}
        </label>
        {hint && <span className="text-[10px] tabular-nums text-ink-soft">{hint}</span>}
      </div>
      {children}
      {error && <ErrorText id={`${htmlFor}-error`}>{error}</ErrorText>}
    </div>
  )
}

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-xs text-stamp">
      {children}
    </p>
  )
}
