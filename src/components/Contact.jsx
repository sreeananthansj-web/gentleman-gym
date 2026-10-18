import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  Info,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react'
import { business, fitnessGoals } from '../data/site'
import {
  buildEnquiryMessage,
  directionsHref,
  normalisePhone,
  telHref,
  whatsappHref,
  DEFAULT_WHATSAPP_MESSAGE,
} from '../lib/links'
import Button from './ui/Button'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const initialForm = { name: '', phone: '', goal: '', message: '' }

function validate(values) {
  const errors = {}

  if (values.name.trim().length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).'
  } else if (values.name.trim().length > 80) {
    errors.name = 'Please keep your name under 80 characters.'
  }

  if (!normalisePhone(values.phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number.'
  }

  if (!values.goal) {
    errors.goal = 'Please choose a fitness goal.'
  }

  if (values.message.length > 600) {
    errors.message = 'Please keep your message under 600 characters.'
  }

  return errors
}

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [status, setStatus] = useState(null)

  const errorCount = useMemo(
    () => Object.keys(errors).filter((key) => errors[key]).length,
    [errors],
  )

  const updateField = (field) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatus(null)
  }

  const validateField = (field) => () => {
    const fieldErrors = validate(form)
    setErrors((current) => ({ ...current, [field]: fieldErrors[field] }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitAttempted(true)

    const nextErrors = validate(form)
    setErrors(nextErrors)

    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      document.getElementById(`field-${firstError}`)?.focus()
      return
    }

    const message = buildEnquiryMessage(form)
    const url = whatsappHref(message, business.phones[0].digits)

    // Open synchronously so the click is still treated as a user gesture.
    window.open(url, '_blank', 'noopener,noreferrer')
    setStatus({ state: 'success', url })
    window.requestAnimationFrame(() => {
      document
        .getElementById('enquiry-status')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const fieldDescribedBy = (field, hintId) =>
    [errors[field] ? `${field}-error` : null, hintId].filter(Boolean).join(' ') ||
    undefined

  return (
    <section id="contact" className="section-pad relative bg-coal">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Contact"
              title={
                <>
                  COME SEE THE FLOOR <span className="text-gold">FOR YOURSELF.</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-md text-[15px] leading-relaxed text-mist lg:ml-auto">
              Visit Gentleman Gym at Thellukuzhi, Perumkidavila P.O., or call ahead with any
              questions. We are happy to help you find the right way to start.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
          <Reveal className="flex flex-col">
            <div className="border border-white/10 bg-ink/50">
              <div className="flex items-start gap-4 border-b border-white/10 p-5 sm:p-6">
                <span className="grid size-10 shrink-0 place-items-center border border-gold/30 bg-gold/[0.05] text-gold">
                  <MapPin className="size-4" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/50">
                    Location
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-bone/90">
                    {business.address.line1}, {business.address.line2}
                    <br />
                    {business.address.region}
                  </p>
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:text-gold-soft"
                  >
                    Get directions
                    <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="border-b border-white/10 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center border border-gold/30 bg-gold/[0.05] text-gold">
                    <Phone className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/50">
                      Call us
                    </p>
                    <div className="mt-2 space-y-2">
                      {business.phones.map((phone) => (
                        <div
                          key={phone.digits}
                          className="flex flex-wrap items-center justify-between gap-2"
                        >
                          <a
                            href={telHref(phone.digits)}
                            className="font-display text-xl tracking-wide text-bone transition-colors hover:text-gold"
                          >
                            {phone.display}
                          </a>
                          <a
                            href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE, phone.digits)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Message Gentleman Gym on WhatsApp at ${phone.display}`}
                            className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-gold"
                          >
                            <MessageCircle className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                            WhatsApp
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center border border-gold/30 bg-gold/[0.05] text-gold">
                    <MessageCircle className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/50">
                      WhatsApp enquiry
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                      Send a message and we will get back to you.
                    </p>
                  </div>
                </div>
                <Button
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  variant="outline"
                  icon={MessageCircle}
                  className="shrink-0"
                >
                  Enquire Now
                </Button>
              </div>
            </div>

            {/* Map area: replace this block with the gym's verified Google Maps
                embed (iframe) or a static map once the exact location pin is confirmed. */}
            <div className="map-grid relative mt-4 flex min-h-[250px] flex-1 flex-col items-center justify-center overflow-hidden border border-white/10 px-6 py-10 text-center">
              <div className="relative grid place-items-center" aria-hidden="true">
                <span className="pulse-ring absolute size-16 rounded-full border border-gold/30" />
                <span className="relative grid size-11 place-items-center rounded-full border border-gold/50 bg-ink text-gold">
                  <MapPin className="size-5" strokeWidth={1.7} />
                </span>
              </div>
              <p className="display mt-5 text-lg uppercase text-bone">
                Thellukuzhi, Perumkidavila P.O.
              </p>
              <p className="mt-1.5 text-xs text-white/40">
                Open the location below for live directions and the exact pin.
              </p>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold hover:text-gold"
              >
                Open in Google Maps
                <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              </a>
              <span className="absolute bottom-3 right-3 text-[8px] uppercase tracking-[0.2em] text-white/20">
                Kerala, India
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-white/10 bg-ink p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="display text-[30px] leading-none text-bone">
                    SEND AN ENQUIRY
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist">
                    Share your details and we will prepare a WhatsApp message for you to
                    review and send.
                  </p>
                </div>
                <MessageCircle
                  className="mt-1 size-5 shrink-0 text-gold/60"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>

              <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-5">
                {submitAttempted && errorCount > 0 && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 border border-[#d9614d]/40 bg-[#d9614d]/[0.07] p-3.5 text-xs leading-relaxed text-[#f0b3a7]"
                  >
                    <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                    Please check the highlighted fields and try again.
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="field-name"
                      className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/60"
                    >
                      Full name <span className="text-gold">*</span>
                    </label>
                    <input
                      id="field-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={updateField('name')}
                      onBlur={validateField('name')}
                      aria-invalid={errors.name ? 'true' : undefined}
                      aria-describedby={fieldDescribedBy('name')}
                      className="field mt-2"
                      maxLength={80}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1.5 text-[11px] leading-snug text-[#e89a8b]">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="field-phone"
                      className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/60"
                    >
                      Phone number <span className="text-gold">*</span>
                    </label>
                    <input
                      id="field-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={updateField('phone')}
                      onBlur={validateField('phone')}
                      aria-invalid={errors.phone ? 'true' : undefined}
                      aria-describedby={fieldDescribedBy('phone')}
                      className="field mt-2"
                      maxLength={16}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="mt-1.5 text-[11px] leading-snug text-[#e89a8b]">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="field-goal"
                    className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/60"
                  >
                    Fitness goal <span className="text-gold">*</span>
                  </label>
                  <select
                    id="field-goal"
                    name="goal"
                    value={form.goal}
                    onChange={updateField('goal')}
                    onBlur={validateField('goal')}
                    aria-invalid={errors.goal ? 'true' : undefined}
                    aria-describedby={fieldDescribedBy('goal')}
                    className="field field-select mt-2"
                  >
                    <option value="" disabled>
                      Select your fitness goal
                    </option>
                    {fitnessGoals.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                  {errors.goal && (
                    <p id="goal-error" className="mt-1.5 text-[11px] leading-snug text-[#e89a8b]">
                      {errors.goal}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="field-message"
                      className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/60"
                    >
                      Message <span className="normal-case tracking-normal text-white/25">(optional)</span>
                    </label>
                    <span className="text-[10px] tabular-nums text-white/25">
                      {form.message.length}/600
                    </span>
                  </div>
                  <textarea
                    id="field-message"
                    name="message"
                    rows={4}
                    placeholder="Anything you'd like us to know?"
                    value={form.message}
                    onChange={updateField('message')}
                    onBlur={validateField('message')}
                    aria-invalid={errors.message ? 'true' : undefined}
                    aria-describedby={fieldDescribedBy('message', 'message-hint')}
                    className="field mt-2 resize-y"
                    maxLength={600}
                  />
                  <p id="message-hint" className="mt-1.5 text-[11px] text-white/50">
                    No spam. Just a reply from the gym.
                  </p>
                  {errors.message && (
                    <p id="message-error" className="mt-1.5 text-[11px] leading-snug text-[#e89a8b]">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div id="enquiry-status" aria-live="polite" role="status">
                  {status?.state === 'success' && (
                    <div className="flex items-start gap-3 border border-[#3f7a58]/50 bg-[#0e1a13] p-4">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-[#6fc794]"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-[13px] leading-relaxed text-bone">
                          Your enquiry is ready in WhatsApp. Review the message and press
                          send to reach Gentleman Gym.
                        </p>
                        <a
                          href={status.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8fd9ae] underline underline-offset-4 transition-colors hover:text-bone"
                        >
                          Open WhatsApp again
                          <ArrowUpRight className="size-3" strokeWidth={1.8} aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" size="lg" icon={Send} className="w-full">
                  Prepare Enquiry
                </Button>

                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-white/50">
                  <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  This form does not send data to a server. It opens WhatsApp with your
                  enquiry filled in — nothing is sent until you press send there.
                </p>

              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-white/50">
                <span>Prefer to talk?</span>
                <a
                  href={telHref(business.phones[0].digits)}
                  className="inline-flex items-center gap-1.5 font-medium text-bone transition-colors hover:text-gold"
                >
                  <Phone className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  {business.phones[0].display}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
