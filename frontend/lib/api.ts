import {
  CATEGORIES,
  PAYMENT_METHODS,
  type Category,
  type Expense,
  type ExpenseFilters,
  type ExpenseInput,
  type PaymentMethod,
} from './expense-types'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type RawExpense = Record<string, unknown>

function normalize(raw: RawExpense): Expense {
  const category = CATEGORIES.includes(raw.category as Category) ? (raw.category as Category) : 'Others'
  const paymentMethod = PAYMENT_METHODS.includes(raw.paymentMethod as PaymentMethod)
    ? (raw.paymentMethod as PaymentMethod)
    : 'Cash'
  const date = String(raw.expenseDate ?? raw.date ?? '')
  return {
    id: String(raw._id ?? raw.id ?? ''),
    title: String(raw.title ?? ''),
    category,
    amount: Number(raw.amount ?? 0),
    paymentMethod,
    expenseDate: date.slice(0, 10),
    notes: String(raw.notes ?? ''),
  }
}

function unwrapList(payload: unknown): RawExpense[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    for (const key of ['data', 'expenses', 'items', 'results']) {
      if (Array.isArray(obj[key])) return obj[key] as RawExpense[]
    }
  }
  return []
}

function unwrapItem(payload: unknown): RawExpense {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    for (const key of ['data', 'expense', 'item']) {
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) return obj[key] as RawExpense
    }
    return obj
  }
  return {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const text = await response.text()
  const body = text ? JSON.parse(text) : null
  if (!response.ok) {
    const message =
      (body && (body.message || body.error)) || `Request failed with status ${response.status}`
    throw new ApiError(String(message), response.status)
  }
  return body as T
}

function buildQuery(filters: ExpenseFilters) {
  const params = new URLSearchParams()
  if (filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.category !== 'All') params.set('category', filters.category)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  const query = params.toString()
  return query ? `?${query}` : ''
}

function applyFilters(list: Expense[], filters: ExpenseFilters) {
  const term = filters.search.trim().toLowerCase()
  return list
    .filter((e) => (term ? e.title.toLowerCase().includes(term) : true))
    .filter((e) => (filters.category === 'All' ? true : e.category === filters.category))
    .filter((e) => (filters.startDate ? e.expenseDate >= filters.startDate : true))
    .filter((e) => (filters.endDate ? e.expenseDate <= filters.endDate : true))
    .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
}

let demoMode = false
let demoStore: Expense[] = createDemoData()

function isNetworkFailure(error: unknown) {
  return error instanceof TypeError
}

export function isDemoMode() {
  return demoMode
}

export async function fetchExpenses(filters: ExpenseFilters): Promise<Expense[]> {
  if (!demoMode) {
    try {
      const payload = await request<unknown>(`/expenses${buildQuery(filters)}`)
      return applyFilters(unwrapList(payload).map(normalize), filters)
    } catch (error) {
      if (!isNetworkFailure(error)) throw error
      demoMode = true
    }
  }
  return applyFilters(demoStore, filters)
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  if (demoMode) {
    const created = { ...input, id: crypto.randomUUID() }
    demoStore = [created, ...demoStore]
    return created
  }
  const payload = await request<unknown>('/expenses', { method: 'POST', body: JSON.stringify(input) })
  return normalize(unwrapItem(payload))
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<Expense> {
  if (demoMode) {
    const updated = { ...input, id }
    demoStore = demoStore.map((e) => (e.id === id ? updated : e))
    return updated
  }
  const payload = await request<unknown>(`/expenses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return normalize(unwrapItem(payload))
}

export async function deleteExpense(id: string): Promise<void> {
  if (demoMode) {
    demoStore = demoStore.filter((e) => e.id !== id)
    return
  }
  await request<unknown>(`/expenses/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

function createDemoData(): Expense[] {
  const daysAgo = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().slice(0, 10)
  }
  const rows: Array<[string, Category, number, PaymentMethod, number, string]> = [
    ['Groceries — weekly run', 'Food', 2340, 'UPI', 1, 'Vegetables, milk, rice'],
    ['Electricity bill', 'Bills', 1875.5, 'Bank Transfer', 3, 'September cycle'],
    ['Train to Pune', 'Travel', 945, 'Card', 5, 'Return ticket, 2A'],
    ['Data structures course', 'Education', 3499, 'Card', 8, 'Annual access'],
    ['Running shoes', 'Shopping', 4299, 'Card', 10, ''],
    ['Dinner with team', 'Food', 1620, 'Cash', 12, 'Split four ways'],
    ['Mobile recharge', 'Bills', 299, 'Wallet', 14, '28-day plan'],
    ['Cab to airport', 'Travel', 780, 'UPI', 18, 'Early morning flight'],
    ['Birthday gift', 'Others', 1200, 'Cash', 21, 'For Meera'],
    ['Coffee beans', 'Food', 650, 'UPI', 24, 'Single origin, 250g'],
  ]
  return rows.map(([title, category, amount, paymentMethod, ago, notes], index) => ({
    id: `demo-${index + 1}`,
    title,
    category,
    amount,
    paymentMethod,
    expenseDate: daysAgo(ago),
    notes,
  }))
}
