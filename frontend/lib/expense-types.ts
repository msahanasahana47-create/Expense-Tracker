export const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Others'] as const
export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Wallet'] as const

export type Category = (typeof CATEGORIES)[number]
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export type Expense = {
  id: string
  title: string
  category: Category
  amount: number
  paymentMethod: PaymentMethod
  expenseDate: string
  notes: string
}

export type ExpenseInput = Omit<Expense, 'id'>

export type ExpenseFilters = {
  search: string
  category: Category | 'All'
  startDate: string
  endDate: string
}

export const CATEGORY_CODES: Record<Category, string> = {
  Food: 'FOD',
  Travel: 'TRV',
  Shopping: 'SHP',
  Bills: 'BIL',
  Education: 'EDU',
  Others: 'OTH',
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

const numberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatAmount(value: number) {
  return numberFormatter.format(value)
}

export function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}
