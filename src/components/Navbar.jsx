import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, LayoutDashboard, LogIn, LogOut, MapPin, Menu, MessageCircle, Phone, UserPlus, X } from 'lucide-react'
import { useUserAuth } from '../context/UserAuthContext'
import { business, navLinks } from '../data/site'
import { cx } from '../lib/cx'
import { telHref, whatsappHref } from '../lib/links'
import { navigate } from '../lib/navigate'
import Button from './ui/Button'
import Logo from './ui/Logo'


export default function Navbar({ currentPath: propPath }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const auth = useUserAuth()
  const isLoggedIn = auth.status === 'ready'
  const currentPath = propPath ?? (window.location.pathname.replace(/\/$/, '') || '/')
  const active = navLinks.find((link) => link.href === currentPath)?.id || 'home'
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await auth.logout()
      setOpen(false)
      navigate('/', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = (event) => {
      if (event.matches) setOpen(false)
    }

    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const menu = menuRef.current
    const focusable = menu?.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    focusable?.[0]?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const closeMenu = () => {
    setOpen(false)
    if (open) {
      window.requestAnimationFrame(() => toggleRef.current?.focus())
    }
  }

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled || open
            ? 'border-b border-white/10 bg-ink/95 backdrop-blur-md'
            : 'border-b border-transparent bg-gradient-to-b from-ink/90 via-ink/45 to-transparent',
        )}
      >
        {/* Utility strip — desktop only, tucks away on scroll */}
      <div
        className={cx(
          'hidden overflow-hidden transition-all duration-500 lg:block',
          scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100',
        )}
      >
        <div className="shell flex h-10 items-center justify-between border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-white/55">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 transition-colors hover:text-gold"
          >
            <MapPin className="size-3 text-gold" strokeWidth={2} aria-hidden="true" />
            {business.address.full}
          </a>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-gold" aria-hidden="true" />
              Ladies &amp; Gents welcome
            </span>
            <span className="h-3 w-px bg-white/15" aria-hidden="true" />
            {business.phones.map((phone) => (
              <a
                key={phone.digits}
                href={telHref(phone.digits)}
                className="transition-colors hover:text-gold"
              >
                {phone.display}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="shell flex h-[74px] items-center justify-between gap-4 lg:h-20">
        <Logo onClick={closeMenu} />

        <nav aria-label="Primary" className="hidden items-center gap-4 lg:flex xl:gap-6">
          {navLinks.map((link) => {
            const isActive = active === link.id
            return (
              <a
                key={link.id}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'group relative whitespace-nowrap py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 xl:text-[11px] xl:tracking-[0.18em]',
                  isActive ? 'text-gold' : 'text-white/70 hover:text-bone',
                )}
              >
                {link.label}
                <span
                  className={cx(
                    'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-300',
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                  aria-hidden="true"
                />
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            {isLoggedIn ? (
              <>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 border border-gold/50 bg-gold/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-ink"
                >
                  <LayoutDashboard className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  Dashboard
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-bone transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
                >
                  <LogOut className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  {loggingOut ? 'Signing out…' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 transition-colors hover:text-gold"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="border border-white/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-bone transition-colors hover:border-gold hover:text-gold"
                >
                  Register
                </a>
              </>
            )}
            <Button href="/membership" size="sm" icon={ArrowUpRight} className="px-3.5 py-2 xl:px-5 xl:py-2.5">
              Join Now
            </Button>
          </div>

          <a
            href="/membership"
            onClick={closeMenu}
            className="hidden items-center gap-1.5 bg-gold px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-soft min-[360px]:inline-flex lg:hidden"
          >
            Join
            <ArrowUpRight className="size-3" strokeWidth={2} aria-hidden="true" />
          </a>

          <a
            href={telHref(business.phones[0].digits)}
            onClick={closeMenu}
            aria-label={`Call Gentleman Gym on ${business.phones[0].display}`}
            className="hidden size-10 place-items-center border border-white/15 text-bone transition-colors hover:border-gold hover:text-gold sm:grid lg:hidden"
          >
            <Phone className="size-4" strokeWidth={1.8} aria-hidden="true" />
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            className="grid size-10 place-items-center border border-white/15 text-bone transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold lg:hidden"
          >
            {open ? (
              <X className="size-5" strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Menu className="size-5" strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      </header>

      {/* Mobile / tablet navigation */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="region"
        aria-label="Site menu"
        inert={!open}
        aria-hidden={!open}
        className={cx(
          'fixed inset-0 z-[45] overflow-y-auto bg-ink/95 backdrop-blur-xl transition-all duration-300 lg:hidden',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-3 opacity-0',
        )}
      >
        <div className="shell flex min-h-[100svh] flex-col pb-8 pt-24">
          <p className="eyebrow mb-4">Menu</p>
          <nav aria-label="Mobile" className="border-t border-white/10">
            {navLinks.map((link, index) => (
              <a
                key={link.id}
                href={link.href}
                onClick={closeMenu}
                aria-current={active === link.id ? 'page' : undefined}
                className={cx(
                  'group flex items-center justify-between border-b border-white/10 py-4 transition-colors',
                  active === link.id ? 'text-gold' : 'text-bone hover:text-gold',
                )}
              >
                <span className="display text-[26px] leading-none">{link.label}</span>
                <span className="flex items-center gap-3">
                  <span
                    className="text-[10px] tabular-nums tracking-[0.2em] text-white/30"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                  <ArrowUpRight
                    className="size-4 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
              </a>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              Member account
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {isLoggedIn ? (
                <>
                  <Button
                    href="/dashboard"
                    onClick={closeMenu}
                    variant="outline"
                    size="sm"
                    icon={LayoutDashboard}
                    iconPosition="left"
                  >
                    Dashboard
                  </Button>
                  <Button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    variant="dark"
                    size="sm"
                    icon={LogOut}
                    iconPosition="left"
                  >
                    {loggingOut ? 'Signing out…' : 'Logout'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    href="/login"
                    onClick={closeMenu}
                    variant="outline"
                    size="sm"
                    icon={LogIn}
                    iconPosition="left"
                  >
                    Login
                  </Button>
                  <Button
                    href="/register"
                    onClick={closeMenu}
                    variant="dark"
                    size="sm"
                    icon={UserPlus}
                    iconPosition="left"
                  >
                    Register
                  </Button>
                </>
              )}
            </div>

            <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-white/40">
              Ready to start?
            </p>
            <Button
              href="/membership"
              onClick={closeMenu}
              size="md"
              icon={ArrowUpRight}
              className="mt-3 w-full"
            >
              Join Now
            </Button>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <Button
                href={telHref(business.phones[0].digits)}
                onClick={closeMenu}
                variant="outline"
                size="sm"
                icon={Phone}
              >
                Call Now
              </Button>
              <Button
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                variant="outline"
                size="sm"
                icon={MessageCircle}
              >
                WhatsApp
              </Button>
            </div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-white/40">
              Visit us
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {business.address.full}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}