import {
  ArrowUpRight,
  Check,
  Info,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import { business } from '../data/site'
import useRemoteContent from '../hooks/useRemoteContent'
import { listPublicPlans } from '../services/membershipService'
import { directionsHref, telHref, whatsappHref } from '../lib/links'
import Button from './ui/Button'
import Reveal from './ui/Reveal'

// No built-in plans: the gym shares prices directly, so nothing is shown until an admin publishes a plan.
const NO_PLANS = []

const helpTopics = [
  { label: 'Membership options', detail: 'Ask about current plans' },
  { label: 'Training plans', detail: 'Find your starting point' },
  { label: 'Visits & timings', detail: 'Confirm before you visit' },
]

export default function Membership() {
  const { items: plans } = useRemoteContent('membership-plans', listPublicPlans, NO_PLANS)

  return (
    <section
      id="membership"
      className="relative isolate overflow-hidden bg-ink py-24 sm:py-28 lg:py-36"
    >
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/membership.jpg"
          alt=""
          width="1920"
          height="1100"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/92 to-ink/60"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70"
          aria-hidden="true"
        />
      </div>

      <div className="shell relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20">
        <Reveal>
          <p className="eyebrow">Membership &amp; Enquiry</p>
          <h2 className="display mt-5 text-[clamp(2.5rem,5.5vw,4.9rem)] leading-[0.94] text-bone">
            YOUR FITNESS JOURNEY
            <br />
            <span className="text-gold">STARTS TODAY.</span>
          </h2>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/70">
            Ready to get started? Contact Gentleman Gym to learn about membership options
            and find the right training plan for you.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href={telHref(business.phones[0].digits)} size="md" icon={Phone}>
              Call Now
            </Button>
            <Button
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="md"
              icon={MessageCircle}
            >
              Enquire on WhatsApp
            </Button>
            <Button
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="dark"
              size="md"
              icon={MapPin}
            >
              Get Directions
            </Button>
          </div>

          <p className="mt-6 flex max-w-lg items-start gap-2 text-xs leading-relaxed text-white/55">
            <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            Membership prices, packages and timings are shared directly by the gym. Call or
            message for the latest information.
          </p>
        </Reveal>

        <Reveal delay={140}>
          <div className="border border-white/12 bg-ink/80 p-6 backdrop-blur-md sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-gold">
                Start with a conversation
              </p>
              <ArrowUpRight
                className="size-4 text-white/25"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </div>
            <h3 className="mt-3 font-display text-[24px] uppercase leading-tight text-bone">
              What we can help with
            </h3>

            <ul className="mt-6">
              {helpTopics.map((topic, index) => (
                <li
                  key={topic.label}
                  className={
                    index === helpTopics.length - 1
                      ? 'flex items-start justify-between gap-4 py-4'
                      : 'flex items-start justify-between gap-4 border-b border-white/10 py-4'
                  }
                >
                  <div>
                    <p className="text-sm font-medium text-bone">{topic.label}</p>
                    <p className="mt-1 text-xs text-white/55">{topic.detail}</p>
                  </div>
                  <span className="mt-1 font-display text-[10px] text-white/20">
                    0{index + 1}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-2 border-t border-gold/20 pt-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/50">
                Call the gym
              </p>
              <div className="mt-3 space-y-2">
                {business.phones.map((phone) => (
                  <a
                    key={phone.digits}
                    href={telHref(phone.digits)}
                    className="group flex items-center justify-between border border-white/10 px-4 py-3 transition-colors hover:border-gold/50 hover:bg-gold/[0.04]"
                  >
                    <span className="text-sm font-medium tracking-wide text-bone transition-colors group-hover:text-gold">
                      {phone.display}
                    </span>
                    <Phone
                      className="size-3.5 text-white/30 transition-colors group-hover:text-gold"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {plans.length > 0 && (
        <div className="shell relative mt-16 lg:mt-24">
          <Reveal>
            <p className="eyebrow">Membership plans</p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <li
                  key={plan.id}
                  className={`flex flex-col border bg-ink/80 p-6 backdrop-blur-md sm:p-7 ${plan.featured ? 'border-gold/60' : 'border-white/12'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-[24px] uppercase leading-tight text-bone">{plan.name}</h3>
                    {plan.featured && (
                      <span className="shrink-0 border border-gold/40 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-gold">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-4 font-display text-3xl text-gold">
                    {plan.priceLabel ?? <span className="text-xl text-white/70">Ask the gym</span>}
                  </p>
                  {plan.duration && (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                      {plan.duration}
                    </p>
                  )}
                  {plan.description && (
                    <p className="mt-4 text-sm leading-relaxed text-white/70">{plan.description}</p>
                  )}
                  {plan.features.length > 0 && (
                    <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-[13px] leading-snug text-bone/90">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-gold" strokeWidth={2} aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto pt-7">
                    <Button
                      href={whatsappHref(`Hi Gentleman Gym, I'd like to know more about the ${plan.name} membership plan.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant={plan.featured ? 'primary' : 'outline'}
                      size="sm"
                      icon={MessageCircle}
                      className="w-full"
                    >
                      Ask about this plan
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      )}
    </section>
  )
}
