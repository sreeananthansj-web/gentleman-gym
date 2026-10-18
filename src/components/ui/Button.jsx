import { cx } from '../../lib/cx'

const base =
  'group inline-flex items-center justify-center gap-2.5 border font-semibold uppercase transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary:
    'border-gold bg-gold text-ink shadow-[0_14px_40px_-18px_rgba(216,169,75,0.65)] hover:border-gold-soft hover:bg-gold-soft active:translate-y-px',
  outline:
    'border-bone/25 bg-transparent text-bone hover:border-gold hover:bg-gold/[0.06] hover:text-gold active:translate-y-px',
  dark: 'border-white/12 bg-white/[0.04] text-bone hover:border-gold/60 hover:bg-white/[0.08] hover:text-gold active:translate-y-px',
  ghost:
    'border-transparent bg-transparent px-0 py-1 text-bone hover:text-gold active:translate-y-px',
}

const sizes = {
  sm: 'px-5 py-2.5 text-[10px] tracking-[0.18em]',
  md: 'px-6 py-3.5 text-[11px] tracking-[0.16em]',
  lg: 'px-7 py-4 text-[12px] tracking-[0.15em] sm:px-8',
}

export default function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  className,
  type = 'button',
  ...props
}) {
  const classes = cx(
    base,
    variants[variant],
    variant !== 'ghost' && sizes[size],
    className,
  )

  const content = (
    <>
      {Icon && iconPosition === 'left' ? (
        <Icon
          className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
      {Icon && iconPosition === 'right' ? (
        <Icon
          className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      ) : null}
    </>
  )

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  )
}
