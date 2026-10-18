import { ArrowRight, ArrowUpRight, Info, Phone } from 'lucide-react'
import { business, trainers } from '../data/site'
import { telHref } from '../lib/links'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'
import Button from './ui/Button'

export default function Trainers() {
  return (
    <section id="trainers" className="section-pad relative bg-coal">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Meet Your Trainer"
              title={
                <>
                  TRAIN SMARTER WITH{' '}
                  <span className="text-gold">PROFESSIONAL GUIDANCE.</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-md text-[15px] leading-relaxed text-mist lg:ml-auto">
              Good training is more than effort. Certified trainers help you use proper
              technique, follow a workout plan and progress consistently — without
              guessing what to do next.
            </p>
            <a
              href="/contact"
              className="group mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-soft lg:float-right"
            >
              Book a trainer consultation
              <ArrowUpRight
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
          </Reveal>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-[0.9fr_1.1fr] sm:items-stretch lg:mt-16 lg:gap-10">
          {trainers.map((trainer, index) => (
            <Reveal key={trainer.title} delay={index * 100}>
              <article className="group grid h-full overflow-hidden border border-white/10 bg-ink sm:grid-cols-[0.85fr_1.15fr]">
                <div className="relative min-h-[300px] aspect-[4/5] overflow-hidden sm:aspect-auto">
                  <img
                    src={trainer.image}
                    alt={trainer.alt}
                    width="800"
                    height="1000"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover grayscale-[30%] transition-all duration-[900ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/20"
                    aria-hidden="true"
                  />
                  <span className="absolute left-5 top-5 border border-gold/40 bg-ink/75 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-gold backdrop-blur-sm">
                    Head Trainer
                  </span>
                </div>

                <div className="relative p-6">
                  <span
                    className="absolute right-6 top-0 h-px w-10 -translate-y-1/2 bg-gold/40"
                    aria-hidden="true"
                  />
                  <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/50">
                    GENTLEMAN GYM · HEAD COACH
                  </p>
                  <h3 className="display mt-2.5 text-[23px] leading-none text-bone">
                    {trainer.name}
                  </h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold">{trainer.title}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-mist">
                    {trainer.description}
                  </p>
                  <a
                    href="/contact"
                    className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-soft"
                  >
                    Ask about coaching
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-col gap-6 border border-white/10 bg-ink/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-2xl items-start gap-3">
            <Info
              className="mt-0.5 size-4 shrink-0 text-gold"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-white/55">
              Meet our featured head trainer and ask about personal coaching, bodybuilding preparation and training plans. Contact the gym to discuss your goals and the guidance available.
            </p>
          </div>
          <Button
            href={telHref(business.phones[0].digits)}
            variant="outline"
            size="sm"
            icon={Phone}
            className="shrink-0"
          >
            Call The Gym
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
