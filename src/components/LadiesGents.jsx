import { ArrowRight, Info } from 'lucide-react'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const audiences = [
  {
    label: 'For Gents',
    title: 'BUILD. ENDURE. ACHIEVE.',
    description:
      'Build strength, improve endurance and work towards your personal fitness goals.',
    image: '/images/gents.jpg',
    alt: 'Male member training his arms with a cable machine at Gentleman Gym',
    tags: ['Strength', 'Endurance', 'Confidence'],
  },
  {
    label: 'For Ladies',
    title: 'STRONGER. FITTER. YOU.',
    description:
      'Feel stronger, improve fitness and train confidently in a supportive environment.',
    image: '/images/ladies.jpg',
    alt: 'Female member performing a barbell squat in the gym',
    tags: ['Strength', 'Fitness', 'Confidence'],
  },
]

export default function LadiesGents() {
  return (
    <section id="ladies-gents" className="section-pad bg-ink">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Ladies & Gents Fitness"
              title={
                <>
                  TRAIN SIDE <span className="text-gold">BY SIDE.</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-md text-[15px] leading-relaxed text-mist lg:ml-auto">
              Gentleman Gym is a multi-gym for ladies and gents. The same professional
              environment, the same trainer guidance and the same supportive energy — with
              training shaped around your goals.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-16 lg:gap-5">
          {audiences.map((audience, index) => (
            <Reveal key={audience.label} delay={index * 120}>
              <article className="group relative overflow-hidden border border-white/10">
                <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]">
                  <img
                    src={audience.image}
                    alt={audience.alt}
                    width="1400"
                    height="1050"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-ink/50 to-transparent"
                    aria-hidden="true"
                  />

                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6">
                    <span className="inline-flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
                      <span className="h-px w-6 bg-gold" aria-hidden="true" />
                      {audience.label}
                    </span>
                    <span className="font-display text-xs tracking-[0.14em] text-white/40">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <h3 className="display max-w-sm text-[30px] leading-none text-bone sm:text-[34px]">
                      {audience.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                      {audience.description}
                    </p>

                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Training focus">
                      {audience.tags.map((tag) => (
                        <li
                          key={tag}
                          className="border border-white/15 bg-ink/30 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white/60 backdrop-blur-sm"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>

                    <a
                      href="/contact"
                      className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-soft"
                    >
                      Start your training
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-7 flex max-w-3xl items-start gap-2 text-xs leading-relaxed text-white/50">
          <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          Call the gym to confirm current timings, trainer availability and membership
          options for ladies and gents.
        </p>
      </div>
    </section>
  )
}
