import { useCallback, useMemo, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { ToastContext } from './useToast'

const STYLES = {
  success: { icon: CircleCheck, ring: 'border-[#3f7a58]/60', color: 'text-[#6fc794]' },
  error: { icon: CircleAlert, ring: 'border-[#d9614d]/60', color: 'text-[#f0b3a7]' },
  info: { icon: Info, ring: 'border-gold/40', color: 'text-gold' },
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (type, message) => {
      const id = nextId.current++
      setToasts((current) => [...current.slice(-3), { id, type, message }])
      window.setTimeout(() => dismiss(id), type === 'error' ? 7000 : 4000)
    },
    [dismiss],
  )

  const api = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:items-end"
      >
        {toasts.map((toast) => {
          const style = STYLES[toast.type]
          const Icon = style.icon
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 border bg-charcoal px-4 py-3 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)] ${style.ring}`}
            >
              <Icon className={`mt-0.5 size-4 shrink-0 ${style.color}`} strokeWidth={1.8} aria-hidden="true" />
              <p className="min-w-0 flex-1 text-[13px] leading-snug text-bone">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-white/40 transition-colors hover:text-bone"
              >
                <X className="size-4" strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
