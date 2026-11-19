import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqs } from '../data/site'
import useRemoteContent from '../hooks/useRemoteContent'
import { listPublicFaqs } from '../services/faqService'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

export default function FAQ() {
  const [open, setOpen] = useState(0)
  const { items: questions, status } = useRemoteContent('faqs', listPublicFaqs, faqs)

  return (
    <section id="faq" className="section-pad bg-ink">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Good to know" title={<>GOT QUESTIONS? <span className="text-gold">WE CAN HELP.</span></>} /></Reveal>
        <div className="mx-auto mt-10 max-w-4xl border-t border-white/10" aria-busy={status === 'loading'}>
          {status === 'loading' && (
            <div role="status" aria-label="Loading questions" className="space-y-px">
              {[0, 1, 2, 3].map((n) => <div key={n} className="h-[62px] animate-pulse border-b border-white/10 bg-white/[0.02]" />)}
            </div>
          )}
          {status !== 'loading' && questions.length === 0 && (
            <p className="border-b border-white/10 py-8 text-sm leading-relaxed text-mist">
              Our questions and answers will appear here soon. In the meantime, call or WhatsApp the gym and we will be happy to help.
            </p>
          )}
          {questions.map((item, index) => {
            const expanded = open === index
            const answerId = `faq-answer-${index}`
            return <div key={item.id ?? item.q} className="border-b border-white/10">
              <h3>
                <button type="button" aria-expanded={expanded} aria-controls={answerId} onClick={() => setOpen(expanded ? -1 : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-semibold text-bone sm:text-base">
                  {item.q}<ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-gold transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </h3>
              {expanded && <div id={answerId} className="max-w-3xl whitespace-pre-line pb-5 pr-8 text-sm leading-relaxed text-mist">{item.a}</div>}
            </div>
          })}
        </div>
      </div>
    </section>
  )
}
