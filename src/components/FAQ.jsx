import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const questions = [
  { q: 'Where is Gentleman Gym located?', a: 'We are located at Thellukuzhi, Perumkidavila P.O., Kerala. Use the Get Directions link in the Contact section to open Google Maps.' },
  { q: 'Can ladies and gents join?', a: 'Gentleman Gym welcomes ladies and gents. Please contact the gym to confirm the current training arrangements and timings that suit you.' },
  { q: 'Do you offer personal training?', a: 'Personal fitness training and workout guidance are among the services featured on this website. Contact the gym to discuss availability and the right option for your goals.' },
  { q: 'How much does membership cost?', a: 'Membership prices and available plans can change. Call or WhatsApp the gym for the latest fees and membership options.' },
  { q: 'Can beginners join?', a: 'Yes, you can contact the team to discuss your experience level and goals before starting. If you have a medical concern, check with a qualified healthcare professional before beginning a new exercise programme.' },
  { q: 'How do I enquire or book a visit?', a: 'Use the enquiry form to prepare a WhatsApp message, or call 9895979950 or 9895100630. The enquiry form opens WhatsApp; it does not submit information to a website server.' },
]

export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="section-pad bg-ink">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Good to know" title={<>GOT QUESTIONS? <span className="text-gold">WE CAN HELP.</span></>} /></Reveal>
        <div className="mx-auto mt-10 max-w-4xl border-t border-white/10">
          {questions.map((item, index) => {
            const expanded = open === index
            const answerId = `faq-answer-${index}`
            return <div key={item.q} className="border-b border-white/10">
              <h3>
                <button type="button" aria-expanded={expanded} aria-controls={answerId} onClick={() => setOpen(expanded ? -1 : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-semibold text-bone sm:text-base">
                  {item.q}<ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-gold transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </h3>
              {expanded && <div id={answerId} className="max-w-3xl pb-5 pr-8 text-sm leading-relaxed text-mist">{item.a}</div>}
            </div>
          })}
        </div>
      </div>
    </section>
  )
}
