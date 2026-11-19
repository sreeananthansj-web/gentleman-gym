import { cx } from '../../lib/cx'

export default function Logo({ href = '/', className, compact = false, onClick }) {
  return (
    <a href={href} onClick={onClick} aria-label="Gentleman Gym home" className={cx('group inline-flex items-center gap-3', className)}>
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden border border-gold/60 bg-black transition-colors duration-300 group-hover:border-gold sm:size-12">
        <img src="/images/gentleman-logo.jpg" alt="" width="96" height="100" className="h-full w-full object-cover" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="display whitespace-nowrap text-[17px] leading-none tracking-[0.06em] text-bone sm:text-[19px]">
          GENTLEMAN <span className="text-gold">GYM</span>
        </span>
        {!compact && <span className="mt-1.5 whitespace-nowrap text-[7.5px] font-medium uppercase tracking-[0.26em] text-mist sm:text-[8px] sm:tracking-[0.3em]">Thellukuzhi · Kerala</span>}
      </span>
    </a>
  )
}
