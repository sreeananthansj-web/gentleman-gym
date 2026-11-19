import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, LoaderCircle, LogIn, ShieldAlert } from 'lucide-react'
import Logo from '../../components/ui/Logo'
import { useAuth } from '../auth/AuthContext'
import { Field } from '../components/ui'

const MAX_ATTEMPTS = 5
const LOCK_SECONDS = 30

export default function Login() {
  const { login, reason } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [lockedFor, setLockedFor] = useState(0)
  const failures = useRef(0)

  useEffect(() => {
    if (lockedFor <= 0) return undefined
    const timer = window.setTimeout(() => setLockedFor((n) => n - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [lockedFor])

  const submit = async (event) => {
    event.preventDefault()
    if (busy || lockedFor > 0) return

    const nextErrors = {}
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Enter your admin email address.'
    if (!password) nextErrors.password = 'Enter your password.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      document.getElementById(`login-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }

    setBusy(true)
    setError('')
    try {
      await login(email, password)
      // On success the status flips to "ready" and AdminApp redirects; a non-admin gets `reason`.
      setPassword('')
      setBusy(false)
    } catch (err) {
      failures.current += 1
      setError(err.message)
      if (failures.current >= MAX_ATTEMPTS) {
        failures.current = 0
        setLockedFor(LOCK_SECONDS)
      }
      setPassword('')
      setBusy(false)
    }
  }

  const message = error || (reason === 'unauthorized' ? 'This account does not have administrator access.' : '')

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-5 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-gold/[0.06] blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo href="/" />
        </div>

        <div className="border border-white/12 bg-coal p-7 sm:p-9">
          <p className="eyebrow">Staff only</p>
          <h1 className="display mt-4 text-4xl leading-none text-bone">Admin sign in</h1>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Sign in to manage enquiries, trainers, gallery, plans and FAQs.
          </p>

          <form noValidate onSubmit={submit} className="mt-7 space-y-5">
            {message && (
              <div role="alert" className="flex items-start gap-2.5 border border-[#d9614d]/40 bg-[#d9614d]/[0.07] p-3.5 text-xs leading-relaxed text-[#f0b3a7]">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                {message}
              </div>
            )}
            {lockedFor > 0 && (
              <p role="status" className="text-xs text-gold">
                Too many failed attempts. You can try again in {lockedFor}s.
              </p>
            )}

            <Field label="Email" htmlFor="login-email" error={fieldErrors.email}>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={fieldErrors.email ? 'true' : undefined}
                aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                className="field"
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Password" htmlFor="login-password" error={fieldErrors.password}>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={fieldErrors.password ? 'true' : undefined}
                  aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                  className="field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-white/45 transition-colors hover:text-gold"
                >
                  {showPassword ? <EyeOff className="size-4" strokeWidth={1.7} aria-hidden="true" /> : <Eye className="size-4" strokeWidth={1.7} aria-hidden="true" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={busy || lockedFor > 0}
              className="inline-flex w-full items-center justify-center gap-2.5 border border-gold bg-gold px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:border-gold-soft hover:bg-gold-soft disabled:pointer-events-none disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" strokeWidth={1.8} aria-hidden="true" />}
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/40">
          Accounts are created by the gym owner. There is no public registration.
        </p>
      </div>
    </main>
  )
}
