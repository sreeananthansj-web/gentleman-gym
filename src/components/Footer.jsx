import { ArrowUp, ArrowUpRight, MapPin, MessageCircle, Phone } from 'lucide-react'
import { business, navLinks } from '../data/site'
import { directionsHref, telHref, whatsappHref } from '../lib/links'
import Logo from './ui/Logo'

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {

  return (
    <footer className="relative border-t border-white/10 bg-coal">
      <div className="shell">
        <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_0.9fr_0.9fr_1fr] lg:gap-10 lg:py-16">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist">
              A professional multi-gym and fitness centre for ladies and gents in
              Thellukuzhi, Perumkidavila P.O., Kerala. Train with purpose and become part
              of a supportive fitness community.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="border border-white/10 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white/55">
                Ladies &amp; Gents
              </span>
              <span className="border border-white/10 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white/55">
                Certified Trainers
              </span>
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-[9px] font-semibold uppercase tracking-[0.26em] text-gold">
              Explore
            </h2>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-bone"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[9px] font-semibold uppercase tracking-[0.26em] text-gold">
              Contact
            </h2>
            <ul className="mt-5 space-y-3.5">
              {business.phones.map((phone) => (
                <li key={phone.digits}>
                  <a
                    href={telHref(phone.digits)}
                    className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-bone"
                  >
                    <Phone className="size-3.5 text-gold/70" strokeWidth={1.8} aria-hidden="true" />
                    {phone.display}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-bone"
                >
                  <MessageCircle
                    className="size-3.5 text-gold/70"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  WhatsApp enquiry
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[9px] font-semibold uppercase tracking-[0.26em] text-gold">
              Legal
            </h2>
            <ul className="mt-5 space-y-3">
              <li><a href="/privacy" className="text-sm text-white/60 transition-colors hover:text-bone">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm text-white/60 transition-colors hover:text-bone">Terms and Conditions</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-[9px] font-semibold uppercase tracking-[0.26em] text-gold">
              Visit
            </h2>
            <address className="mt-5 not-italic">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-white/60">
                <MapPin
                  className="mt-0.5 size-3.5 shrink-0 text-gold/70"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>
                  {business.address.line1},
                  <br />
                  {business.address.line2},
                  <br />
                  {business.address.region}
                </span>
              </p>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:text-gold-soft"
              >
                Get directions
                <ArrowUpRight className="size-3" strokeWidth={1.8} aria-hidden="true" />
              </a>
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-white/50">
            © {CURRENT_YEAR} Gentleman Gym. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">
              Thellukuzhi · Perumkidavila · Kerala
            </p>
            <a
              href="/"
              aria-label="Back to top"
              className="group grid size-9 place-items-center border border-white/10 text-white/40 transition-colors hover:border-gold/50 hover:text-gold"
            >
              <ArrowUp
                className="size-4 transition-transform group-hover:-translate-y-0.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
