'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Toast = {
  id: string
  tone: 'success' | 'error'
  title: string
  message: string
}

export function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-80"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 4000)
    return () => window.clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 border-2 bg-paper p-3 shadow-[4px_4px_0_0_var(--ink)] animate-in slide-in-from-bottom-3 fade-in duration-200',
        toast.tone === 'error' ? 'border-stamp' : 'border-ink',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 shrink-0 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-paper',
          toast.tone === 'error' ? 'bg-stamp' : 'bg-moss',
        )}
      >
        {toast.tone === 'error' ? 'Err' : 'Ok'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{toast.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-ink-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
