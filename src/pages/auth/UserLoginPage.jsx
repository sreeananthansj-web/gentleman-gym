import { useEffect, useState } from 'react'
import { ArrowLeft, LoaderCircle, LogIn } from 'lucide-react'
import { AuthNotice, AuthShell, FormField, PasswordInput } from '../../components/auth/AuthShell'
import { useUserAuth } from '../../context/UserAuthContext'
import { navigate } from '../../lib/navigate'
import { isValidEmail } from '../../services/userAuthService'

function safeNextPath() {
  const next = new URLSearchParams(window.location.search).get('next') ?? ''
  if (next === '/dashboard') return next
  return '/dashboard'
}

export default function UserLoginPage() {
  const auth = useUserAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    document.title = 'Member Login · Gentleman Gym'
    if (auth.status === 'ready') {
      navigate(safeNextPath(), { replace: true })
    }
  }, [auth.status])

  const resetDone = new URLSearchParams(window.location.search).get('reset') === '1'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy) return

    const nextErrors = {}
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Enter your password.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      document.getElementById(`login-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }

    setBusy(true)
    setError('')
    try {
      await auth.login(email, password)
      navigate(safeNextPath(), { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in.')
      setPassword('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Member access"
      title="Member login"
      subtitle="Sign in to access your Gentleman Gym profile and account settings."
      footer={
        <div className="space-y-3">
          <p>
            Don&apos;t have an account?{' '}
            <a href="/register" className="font-semibold text-gold transition-colors hover:text-gold-soft">
              Create one
            </a>
          </p>
          <p>
            <a href="/" className="inline-flex items-center gap-1.5 text-white/45 transition-colors hover:text-bone">
              <ArrowLeft className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              Back to Gentleman Gym
            </a>
          </p>
        </div>
      }
    >
      {auth.status === 'unconfigured' ? (
        <AuthNotice tone="error">
          Member sign-in is unavailable because Supabase environment variables are not configured.
        </AuthNotice>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          {resetDone && !error && (
            <AuthNotice tone="success">
              Your password has been updated. Sign in with your new password.
            </AuthNotice>
          )}
          <AuthNotice tone="error">{error}</AuthNotice>

          <FormField label="Email address" htmlFor="login-email" error={fieldErrors.email} required>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={fieldErrors.email ? 'true' : undefined}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              className="field"
              placeholder="you@example.com"
            />
          </FormField>

          <FormField label="Password" htmlFor="login-password" error={fieldErrors.password} required>
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              placeholder="Enter your password"
            />
          </FormField>

          <div className="flex items-center justify-end">
            <a
              href="/forgot-password"
              className="text-xs font-medium text-gold transition-colors hover:text-gold-soft"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={busy || auth.status === 'loading'}
            className="inline-flex w-full items-center justify-center gap-2.5 border border-gold bg-gold px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:border-gold-soft hover:bg-gold-soft disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogIn className="size-4" strokeWidth={1.8} aria-hidden="true" />
            )}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
