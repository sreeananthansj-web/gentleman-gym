import { useEffect, useState } from 'react'
import {
  CreditCard,
  Dumbbell,
  ExternalLink,
  CircleHelp,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
} from 'lucide-react'
import Logo from '../../components/ui/Logo'
import { cx } from '../../lib/cx'
import { navigate } from '../../lib/navigate'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../components/useToast'

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Trainers', href: '/admin/trainers', icon: Dumbbell },
  { label: 'Gallery', href: '/admin/gallery', icon: Images },
  { label: 'Membership', href: '/admin/membership', icon: CreditCard },
  { label: 'FAQs', href: '/admin/faqs', icon: CircleHelp },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ path, children }) {
  const { profile, logout } = useAuth()
  const toast = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [path])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => event.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await logout()
      navigate('/admin/login', { replace: true })
    } catch (error) {
      toast.error(error.message || 'Could not sign out.')
      setSigningOut(false)
    }
  }

  const current = NAV_ITEMS.find((item) => path === item.href)

  return (
    <div className="min-h-screen bg-ink text-bone">
      <a href="#admin-main" className="skip-link">Skip to content</a>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/10 bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          className="grid size-10 place-items-center border border-white/15 text-bone transition-colors hover:border-gold hover:text-gold"
        >
          <Menu className="size-5" strokeWidth={1.7} aria-hidden="true" />
        </button>
        <p className="display truncate text-xl leading-none">{current?.label ?? 'Admin'}</p>
        <span className="size-10" aria-hidden="true" />
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/75 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Admin navigation"
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-coal transition-[transform,visibility] duration-300 lg:w-64 lg:translate-x-0 lg:visible',
          menuOpen ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <Logo href="/admin/dashboard" compact />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
            className="grid size-9 place-items-center text-white/50 hover:text-gold lg:hidden"
          >
            <X className="size-5" strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.26em] text-white/35">Manage</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = path === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'flex items-center gap-3 border-l-2 px-3 py-2.5 text-[13px] font-medium transition-colors',
                      active
                        ? 'border-gold bg-gold/[0.08] text-gold'
                        : 'border-transparent text-mist hover:bg-white/[0.04] hover:text-bone',
                    )}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 min-w-0 px-1">
            <p className="truncate text-xs font-medium text-bone" title={profile?.email}>{profile?.email}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-gold">
              {profile?.role === 'super_admin' ? 'Super admin' : 'Admin'}
            </p>
          </div>
          <div className="grid gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:border-gold hover:text-gold"
            >
              <ExternalLink className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              View website
            </a>
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-mist transition-colors hover:border-[#d9614d]/60 hover:text-[#f0b3a7] disabled:opacity-50"
            >
              <LogOut className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </aside>

      <main id="admin-main" className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</div>
      </main>
    </div>
  )
}
