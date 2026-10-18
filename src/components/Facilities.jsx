import { ArrowUpRight, Info } from 'lucide-react'
import { facilities } from '../data/site'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

export default function Facilities() {
  return (
    <section id="facilities" className="section-pad relative bg-coal">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Gym Facilities"
              title={
                <>
                  TRAIN WITH THE <span className="text-gold">RIGHT TOOLS.</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={100} className="lg:pb-1">
            <p className="max-w-md text-[15px] leading-relaxed text-mist lg:ml-auto">
              From strength and free weights to cardio and one-to-one coaching, there is a
              way to train that fits your goals. Start with what feels right and build from
              there.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/55 lg:ml-auto">
              Not sure where to begin? A trainer can help you find your starting point.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-5">
          {facilities.map((facility, index) => (
            <Reveal key={facility.title} delay={(index % 3) * 90}>
              <a
                href="/contact"
                aria-label={`Enquire about ${facility.title} at Gentleman Gym`}
                className="group relative block overflow-hidden border border-white/10 bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={facility.image}
                    alt={facility.alt}
                    width="1000"
                    height="1250"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-gold/0 transition-colors duration-500 group-hover:bg-gold/[0.06]"
                    aria-hidden="true"
                  />

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
                    <span className="font-display text-xs tracking-[0.14em] text-white/50">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="grid size-9 translate-y-1 place-items-center border border-white/20 bg-ink/40 text-bone opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:border-gold/50 group-hover:text-gold group-hover:opacity-100">
                      <ArrowUpRight className="size-4" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <span
                      className="mb-3 block h-px w-8 bg-gold transition-all duration-500 group-hover:w-16"
                      aria-hidden="true"
                    />
                    <h3 className="display text-[25px] leading-none text-bone">
                      {facility.title}
                    </h3>
                    <p className="mt-2.5 max-w-xs text-[13px] leading-relaxed text-white/60 transition-colors duration-300 group-hover:text-white/80">
                      {facility.description}
                    </p>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 flex max-w-3xl items-start gap-2 text-xs leading-relaxed text-white/50">
          <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          Images are representative of a professional multi-gym environment. Call the gym
          for the current equipment, training areas and timings.
        </p>
      </div>
    </section>
  )
}
