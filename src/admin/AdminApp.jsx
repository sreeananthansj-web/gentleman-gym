import { useEffect } from 'react'
import { navigate } from '../lib/navigate'
import AuthProvider from './auth/AuthProvider'
import { useAuth } from './auth/AuthContext'
import ToastProvider from './components/Toast'
import { ErrorState, Spinner } from './components/ui'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Enquiries from './pages/Enquiries'
import Faqs from './pages/Faqs'
import Gallery from './pages/Gallery'
import Login from './pages/Login'
import Members from './pages/Members'
import Membership from './pages/Membership'
import Settings from './pages/Settings'
import SetupNeeded from './pages/SetupNeeded'
import Trainers from './pages/Trainers'

const ROUTES = {
  '/admin/dashboard': { title: 'Dashboard', Page: Dashboard },
  '/admin/enquiries': { title: 'Enquiries', Page: Enquiries },
  '/admin/members': { title: 'Members', Page: Members },
  '/admin/trainers': { title: 'Trainers', Page: Trainers },
  '/admin/gallery': { title: 'Gallery', Page: Gallery },
  '/admin/membership': { title: 'Membership', Page: Membership },
  '/admin/faqs': { title: 'FAQs', Page: Faqs },
  '/admin/settings': { title: 'Settings', Page: Settings },
}

/** Only allow redirects back into the admin area (prevents open redirects). */
function safeNext() {
  const next = new URLSearchParams(window.location.search).get('next') ?? ''
  if (/^\/admin\/[a-z-]+$/.test(next) && next !== '/admin/login' && ROUTES[next]) return next
  return '/admin/dashboard'
}

function useAdminHead(title) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${title} · Gentleman Gym Admin`
    let meta = document.querySelector('meta[name="robots"]')
    const previousRobots = meta?.getAttribute('content')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')
    return () => {
      document.title = previousTitle
      if (previousRobots) meta.setAttribute('content', previousRobots)
    }
  }, [title])
}

function FullScreenSpinner({ label }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink text-bone">
      <Spinner label={label} />
    </div>
  )
}

function NotFoundPanel() {
  return (
    <div className="py-16 text-center">
      <p className="display text-7xl text-gold">404</p>
      <p className="mt-3 text-sm text-mist">That admin page does not exist.</p>
      <a href="/admin/dashboard" className="mt-6 inline-flex border border-gold/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold hover:bg-gold hover:text-ink">
        Go to dashboard
      </a>
    </div>
  )
}

function AdminRoutes({ path }) {
  const auth = useAuth()
  const route = ROUTES[path]
  const isLogin = path === '/admin/login'
  useAdminHead(isLogin ? 'Sign in' : (route?.title ?? 'Admin'))

  // Decide whether the current URL must be rewritten.
  let redirect = null
  if (auth.status === 'ready') {
    if (path === '/admin' || isLogin) redirect = isLogin ? safeNext() : '/admin/dashboard'
  } else if (auth.status === 'signedOut') {
    if (!isLogin) {
      redirect =
        path === '/admin' || !route
          ? '/admin/login'
          : `/admin/login?next=${encodeURIComponent(path)}`
    }
  }

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect])

  if (auth.status === 'unconfigured') return <SetupNeeded />
  if (auth.status === 'loading') return <FullScreenSpinner label="Checking your session…" />
  if (auth.status === 'error') {
    return (
      <div className="grid min-h-screen place-items-center bg-ink text-bone">
        <ErrorState message={auth.message} onRetry={auth.retry} />
      </div>
    )
  }
  if (redirect) return <FullScreenSpinner label="Redirecting…" />
  if (auth.status === 'signedOut') return <Login />

  // status === 'ready'
  const Page = route?.Page
  return (
    <AdminLayout path={path}>
      {Page ? <Page /> : <NotFoundPanel />}
    </AdminLayout>
  )
}

export default function AdminApp({ path }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminRoutes path={path} />
      </AuthProvider>
    </ToastProvider>
  )
}
