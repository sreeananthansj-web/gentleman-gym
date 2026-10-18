import { ArrowRight, Check } from 'lucide-react'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const highlights = [
  'Fitness facilities for ladies and gents',
  'Professional gym equipment',
  'Certified trainer guidance',
  'Beginner-friendly support',
  'A motivating training environment',
]

export default function About() {
  return (
    <section id="about" className="section-pad relative overflow-hidden bg-ink">
      <div className="shell relative grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-md pb-12 pr-8 sm:pr-12 lg:max-w-none">
          <div className="relative">
            <div
              className="absolute -left-3 -top-3 h-full w-full border border-gold/25"
              aria-hidden="true"
            />
            <img
              src="/images/about-main.jpg"
              alt="Rows of dumbbells along the training floor at Gentleman Gym"
              width="1000"
              height="1250"
              loading="lazy"
              decoding="async"
              className="relative aspect-[4/5] w-full object-cover"
            />
            <div
              className="absolute inset-0 ring-1 ring-inset ring-white/10"
              aria-hidden="true"
            />
            <div className="absolute left-4 top-4 border border-white/15 bg-ink/80 px-4 py-3 backdrop-blur-md sm:left-6 sm:top-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-gold">
                Ladies &amp; Gents
              </p>
              <p className="mt-1.5 font-display text-lg uppercase leading-none text-bone">
                One community
              </p>
            </div>
          </div>

          <img
            src="/images/about-detail.jpg"
            alt="A member training with dumbbells in the gym"
            width="640"
            height="800"
            loading="lazy"
            decoding="async"
            className="absolute bottom-0 right-0 w-36 border-[6px] border-ink object-cover sm:w-48 lg:w-52"
          />
        </Reveal>

        <Reveal delay={120}>
          <SectionHeading
            eyebrow="About Gentleman Gym"
            title={
              <>
                MORE THAN A GYM.
                <br />
                <span className="text-gold">YOUR FITNESS COMMUNITY.</span>
              </>
            }
            description="A professional multi-gym for ladies and gents in Thellukuzhi, Perumkidavila P.O. — built for people who want to train with purpose and stay consistent."
          />

          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-mist">
            <p>
              Gentleman Gym brings professional gym facilities and a supportive training
              environment together. Whether you are lifting for the first time or getting
              back into a routine, you will find the equipment, guidance and encouragement
              to keep moving forward.
            </p>
            <p>
              Every member gets the same focus: quality training, clear direction and
              steady progress at a pace that fits real life.
            </p>
          </div>

          <ul className="mt-8 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-bone/85">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-gold/10">
                  <Check className="size-3 text-gold" strokeWidth={2.5} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href="/facilities"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-soft"
            >
              Explore the facilities
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
            <a
              href="/contact"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-bone"
            >
              Talk to the team
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
