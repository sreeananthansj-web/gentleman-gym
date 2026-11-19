import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { whatsappHref } from '../../lib/links'

export default function WhatsAppFloat() {
  // Hidden while the hero, membership or contact section is on screen: each
  // already provides prominent WhatsApp actions, and the float would cover them.
  const [blocked, setBlocked] = useState(true)

  useEffect(() => {
    const targets = ['home', 'membership', 'contact']
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (!targets.length || typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => setBlocked(false))
      return () => window.cancelAnimationFrame(frame)
    }

    const visibility = new Map(targets.map((target) => [target.id, false]))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.isIntersecting)
        })
        setBlocked([...visibility.values()].some(Boolean))
      },
      { threshold: 0.06 },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <aside aria-label="Quick WhatsApp contact">
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Enquire with Gentleman Gym on WhatsApp"
        className={`group fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 transition-all duration-300 sm:bottom-7 sm:right-7 ${
          blocked
            ? 'pointer-events-none translate-y-3 opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <span className="pointer-events-none hidden translate-x-2 border border-white/10 bg-ink px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
          Chat on WhatsApp
        </span>
        <span className="relative grid size-12 place-items-center rounded-full bg-[#25D366] text-[#062a14] shadow-[0_12px_35px_-8px_rgba(37,211,102,0.55)] transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 sm:size-14">
          <span
            className="pulse-ring absolute inset-0 rounded-full border border-[#25D366]/50"
            aria-hidden="true"
          />
          <MessageCircle className="relative size-5" strokeWidth={2} aria-hidden="true" />
        </span>
      </a>
    </aside>
  )
}
