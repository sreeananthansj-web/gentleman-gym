import { useEffect, useState } from 'react'
import { ArrowLeft, LoaderCircle, Mail } from 'lucide-react'
import { AuthNotice, AuthShell, FormField } from '../../components/auth/AuthShell'
import { useUserAuth } from '../../context/UserAuthContext'
import { isValidEmail, sendPasswordReset } from '../../services/userAuthService'

export default function ForgotPasswordPage() {
  const auth = useUserAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    document.title = 'Forgot Password · Gentleman Gym'
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy) return

    if (!isValidEmail(email)) {
      setFieldError('Enter a valid email address.')
      document.getElementById('forgot-email')?.focus()
      return
    }

    setFieldError('')
    setError('')
    setBusy(true)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not send reset email.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot password"
      subtitle="Enter the email address linked to your account and we will send you a password reset link."
      footer={
        <div className="space-y-3">
          <p>
            Remembered your password?{' '}
            <a href="/login" className="font-semibold text-gold transition-colors hover:text-gold-soft">
              Back to sign in
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
          Password recovery is unavailable because Supabase environment variables are not configured.
        </AuthNotice>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          {sent && (
            <AuthNotice tone="success">
              If an account exists for <strong className="text-bone">{email.trim()}</strong>, a password
              reset link has been sent. Check your inbox and spam folder.
            </AuthNotice>
          )}
          <AuthNotice tone="error">{error}</AuthNotice>

          <FormField label="Email address" htmlFor="forgot-email" error={fieldError} required>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={fieldError ? 'true' : undefined}
              aria-describedby={fieldError ? 'forgot-email-error' : undefined}
              className="field"
              placeholder="you@example.com"
            />
          </FormField>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2.5 border border-gold bg-gold px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:border-gold-soft hover:bg-gold-soft disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Mail className="size-4" strokeWidth={1.8} aria-hidden="true" />
            )}
            {busy ? 'Sending link…' : sent ? 'Resend reset link' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
