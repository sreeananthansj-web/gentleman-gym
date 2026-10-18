import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  MapPin,
  Target,
  Users,
} from 'lucide-react'
import { business } from '../data/site'
import Button from './ui/Button'

const highlights = [
  { label: 'Ladies & Gents', detail: 'Train with equal focus', icon: Users },
  { label: 'Certified Trainers', detail: 'Guidance that counts', icon: BadgeCheck },
  { label: 'All Fitness Levels', detail: 'Start where you are', icon: Target },
]

export default function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="Training floor with strength and cardio equipment at Gentleman Gym"
          width="2000"
          height="1200"
          fetchPriority="high"
          decoding="async"
          className="hero-zoom h-full w-full object-cover object-[62%_center]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/25"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/65"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,transparent_10%,rgba(7,7,7,0.55)_100%)]"
          aria-hidden="true"
        />
      </div>

      <div className="shell relative flex flex-1 flex-col justify-center pb-14 pt-32 sm:pt-36 lg:pb-20 lg:pt-40">
        <div className="max-w-5xl">
          <p className="eyebrow hero-rise">
            Professional Multi-Gym<span className="hidden sm:inline"> · Kerala</span>
          </p>

          <h1 id="hero-title" className="hero-title display mt-6 text-bone">
            <span className="hero-rise hero-rise-1 block">
              BUILD YOUR
              <br className="sm:hidden" /> STRENGTH.
            </span>
            <span className="hero-rise hero-rise-2 mt-1 block text-gold">
              TRANSFORM
              <br className="sm:hidden" /> YOUR LIFE.
            </span>
          </h1>

          <p className="hero-rise hero-rise-3 mt-7 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            Your fitness journey starts here. Train with purpose, build confidence and
            achieve your goals at Gentleman Gym.
          </p>

          <div className="hero-rise hero-rise-4 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/membership" size="lg" icon={ArrowUpRight}>
              Join Our Gym
            </Button>
            <Button href="/facilities" variant="outline" size="lg" icon={ArrowDown}>
              Explore Facilities
            </Button>
          </div>

          <a
            href="/contact"
            className="hero-rise hero-rise-5 mt-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-gold"
          >
            <MapPin className="size-4 text-gold" strokeWidth={1.8} aria-hidden="true" />
            {business.address.line1}, {business.address.line2}
          </a>
        </div>

        <div
          className="absolute right-8 top-1/2 hidden -translate-y-1/2 rotate-90 text-[9px] font-medium uppercase tracking-[0.45em] text-white/30 xl:block"
          aria-hidden="true"
        >
          Strength · Discipline · Consistency
        </div>
      </div>

      <div className="relative hidden w-full border-t border-white/10 bg-ink/35 backdrop-blur-[2px] md:block">
        <div className="shell grid grid-cols-3">
          {highlights.map(({ label, detail, icon: Icon }, index) => (
            <div
              key={label}
              className={
                index > 0
                  ? 'flex items-center gap-3.5 border-l border-white/10 py-5 pl-6'
                  : 'flex items-center gap-3.5 py-5 pr-6'
              }
            >
              <Icon
                className="size-5 shrink-0 text-gold"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bone">
                  {label}
                </p>
                <p className="mt-1 text-[11px] text-white/55">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
