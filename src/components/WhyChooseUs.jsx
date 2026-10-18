import {
  ArrowRight,
  BadgeCheck,
  Dumbbell,
  HeartHandshake,
  MapPin,
  Target,
  Users,
} from 'lucide-react'
import { benefits } from '../data/site'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const icons = {
  Dumbbell,
  Users,
  BadgeCheck,
  Target,
  HeartHandshake,
  MapPin,
}

export default function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="section-pad bg-ink">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <SectionHeading
                eyebrow="Why Choose Us"
                title={
                  <>
                    THE DETAILS MAKE <span className="text-gold">THE DIFFERENCE.</span>
                  </>
                }
                description="A professional gym should feel focused, welcoming and easy to come back to. These are the things we build every session around."
              />

              <div className="mt-8 border-l-2 border-gold/60 pl-5">
                <p className="text-sm leading-relaxed text-mist">
                  Not sure where to start? Ask about a walkthrough of the gym and the
                  training options available.
                </p>
                <a
                  href="/contact"
                  className="group mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-soft"
                >
                  Plan your first visit
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </a>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            {benefits.map((benefit, index) => {
              const Icon = icons[benefit.icon] ?? Dumbbell
              return (
                <Reveal
                  key={benefit.title}
                  delay={(index % 2) * 90}
                  className="group relative bg-ink p-6 transition-colors duration-300 hover:bg-charcoal lg:p-7"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center border border-white/12 text-gold transition-colors duration-300 group-hover:border-gold/50 group-hover:bg-gold/[0.06]">
                      <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="font-display text-xs tracking-[0.16em] text-white/20">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-[19px] uppercase leading-tight tracking-[0.01em] text-bone">
                    {benefit.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-mist">
                    {benefit.description}
                  </p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
