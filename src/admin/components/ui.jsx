import { TriangleAlert, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import { cx } from '../../lib/cx'
import { statusLabel } from '../../services/enquiryService'

/* ---------- Buttons ---------- */
const BTN_BASE =
  'inline-flex items-center justify-center gap-2 border font-semibold uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50'
const BTN_VARIANTS = {
  primary: 'border-gold bg-gold text-ink hover:border-gold-soft hover:bg-gold-soft',
  outline: 'border-white/20 bg-transparent text-bone hover:border-gold hover:text-gold',
  danger: 'border-[#d9614d]/60 bg-[#d9614d]/10 text-[#f0b3a7] hover:bg-[#d9614d] hover:text-ink',
  ghost: 'border-transparent bg-transparent text-mist hover:text-gold',
}
const BTN_SIZES = {
  sm: 'px-3 py-2 text-[10px] tracking-[0.14em]',
  md: 'px-4 py-2.5 text-[11px] tracking-[0.14em]',
}

export function Btn({ variant = 'primary', size = 'md', loading = false, icon: Icon, className, children, type = 'button', disabled, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], className)}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" strokeWidth={2} aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      )}
      {children}
    </button>
  )
}

export function IconBtn({ label, icon: Icon, variant = 'ghost', className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'grid size-9 shrink-0 place-items-center border border-transparent text-white/55 transition-colors focus-visible:outline-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-35',
        variant === 'danger' ? 'hover:border-[#d9614d]/50 hover:text-[#f0b3a7]' : 'hover:border-gold/40 hover:text-gold',
        className,
      )}
      {...props}
    >
      <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
    </button>
  )
}

/* ---------- Layout bits ---------- */
export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="display text-4xl leading-none text-bone sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">{description}</p>}
        <div className="mt-4 h-px w-16 bg-gold" aria-hidden="true" />
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}

export function Card({ className, children, ...props }) {
  return (
    <div className={cx('border border-white/10 bg-coal', className)} {...props}>
      {children}
    </div>
  )
}

export function Spinner({ label = 'Loading…', className }) {
  return (
    <div role="status" className={cx('flex items-center justify-center gap-3 py-16 text-sm text-mist', className)}>
      <LoaderCircle className="size-5 animate-spin text-gold" strokeWidth={1.8} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 grid size-12 place-items-center border border-gold/30 bg-gold/[0.05] text-gold">
          <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
        </span>
      )}
      <p className="display text-xl text-bone">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-mist">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 grid size-12 place-items-center border border-[#d9614d]/40 bg-[#d9614d]/10 text-[#f0b3a7]">
        <TriangleAlert className="size-5" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <p className="display text-xl text-bone">Something went wrong</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-mist">{message}</p>
      {onRetry && (
        <Btn variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Btn>
      )}
    </div>
  )
}

/* ---------- Form bits ---------- */
export function Field({ label, htmlFor, error, hint, required, className, children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <div className="mt-2">{children}</div>
      {hint && !error && <p className="mt-1.5 text-[11px] text-white/45">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[11px] leading-snug text-[#e89a8b]">
          {error}
        </p>
      )}
    </div>
  )
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-6 w-11 shrink-0 items-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50',
        checked ? 'border-gold bg-gold/25' : 'border-white/20 bg-white/[0.04]',
      )}
    >
      <span
        className={cx(
          'absolute top-1/2 size-3.5 -translate-y-1/2 transition-all',
          checked ? 'left-[calc(100%-1.125rem)] bg-gold' : 'left-1.5 bg-white/50',
        )}
      />
    </button>
  )
}

/* ---------- Badges ---------- */
const STATUS_TONES = {
  new: 'border-gold/50 bg-gold/10 text-gold',
  contacted: 'border-[#6fa0d6]/50 bg-[#6fa0d6]/10 text-[#a9c9ee]',
  interested: 'border-[#d6a76f]/50 bg-[#d6a76f]/10 text-[#efd39a]',
  converted: 'border-[#3f7a58]/60 bg-[#3f7a58]/15 text-[#7fd0a1]',
  not_interested: 'border-white/20 bg-white/[0.04] text-mist',
  active: 'border-[#3f7a58]/60 bg-[#3f7a58]/15 text-[#7fd0a1]',
  expired: 'border-[#d9614d]/50 bg-[#d9614d]/10 text-[#f0b3a7]',
  frozen: 'border-[#6fa0d6]/50 bg-[#6fa0d6]/10 text-[#a9c9ee]',
  cancelled: 'border-white/20 bg-white/[0.04] text-mist',
  none: 'border-white/15 bg-transparent text-white/45',
  inactive: 'border-white/15 bg-transparent text-white/45',
}

export function Badge({ tone = 'none', children, className }) {
  return (
    <span
      className={cx(
        'inline-flex items-center whitespace-nowrap border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]',
        STATUS_TONES[tone] ?? STATUS_TONES.none,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function EnquiryStatusBadge({ status }) {
  return <Badge tone={status}>{statusLabel(status)}</Badge>
}

/* ---------- Pagination ---------- */
export function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-4 py-4 sm:flex-row">
      <p className="text-xs text-mist">
        Showing <span className="text-bone">{from}–{to}</span> of <span className="text-bone">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Btn variant="outline" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          Prev
        </Btn>
        <span className="min-w-[4.5rem] text-center text-xs tabular-nums text-mist">
          Page {page} / {pages}
        </span>
        <Btn variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          Next
          <ChevronRight className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </Btn>
      </div>
    </nav>
  )
}
