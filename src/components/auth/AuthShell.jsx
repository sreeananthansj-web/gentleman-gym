import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import Logo from '../ui/Logo'
import { cx } from '../../lib/cx'

export function AuthShell({ eyebrow, title, subtitle, footer, children }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-5 py-12 text-bone">
      <div
        className="pointer-events-none absolute -right-28 -top-28 size-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-28 size-96 rounded-full bg-gold/[0.06] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo href="/" />
        </div>

        <section className="border border-white/12 bg-coal p-7 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)] sm:p-9">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="display mt-4 text-4xl leading-none text-bone">{title}</h1>
          {subtitle && (
            <p className="mt-3 text-sm leading-relaxed text-mist">{subtitle}</p>
          )}
          <div className="mt-7">{children}</div>
        </section>

        {footer && (
          <div className="mt-6 text-center text-xs text-white/55">{footer}</div>
        )}
      </div>
    </main>
  )
}

export function FormField({ label, htmlFor, error, hint, required, className, children }) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65"
      >
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <div className="mt-2">{children}</div>
      {hint && !error && (
        <p className="mt-1.5 text-[11px] leading-snug text-white/45">{hint}</p>
      )}
      {error && (
        <p
          id={`${htmlFor}-error`}
          className="mt-1.5 text-[11px] leading-snug text-[#e89a8b]"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  error,
  className,
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cx('field pr-12', className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-white/45 transition-colors hover:text-gold"
      >
        {visible ? (
          <EyeOff className="size-4" strokeWidth={1.7} aria-hidden="true" />
        ) : (
          <Eye className="size-4" strokeWidth={1.7} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export function AuthNotice({ tone = 'error', children }) {
  if (!children) return null
  const isSuccess = tone === 'success'
  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={cx(
        'flex items-start gap-2.5 border p-3.5 text-xs leading-relaxed',
        isSuccess
          ? 'border-[#3f7a58]/50 bg-[#3f7a58]/15 text-[#9ee0b8]'
          : 'border-[#d9614d]/40 bg-[#d9614d]/[0.07] text-[#f0b3a7]',
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <ShieldAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      )}
      <div>{children}</div>
    </div>
  )
}
