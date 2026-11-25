import { useEffect, useState } from 'react'
import { ArrowLeft, LoaderCircle, UserPlus } from 'lucide-react'
import { AuthNotice, AuthShell, FormField, PasswordInput } from '../../components/auth/AuthShell'
import { useUserAuth } from '../../context/UserAuthContext'
import { navigate } from '../../lib/navigate'
import {
  USER_PASSWORD_MIN_LENGTH,
  isValidEmail,
  normaliseUserPhone,
} from '../../services/userAuthService'

export default function UserRegisterPage() {
  const auth = useUserAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    document.title = 'Register · Gentleman Gym'
    if (auth.status === 'ready') {
      navigate('/dashboard', { replace: true })
    }
  }, [auth.status])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy) return

    const nextErrors = {}
    const trimmedName = fullName.trim()
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      nextErrors.fullName = 'Enter your full name (2–80 characters).'
    }
    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!normaliseUserPhone(phone)) {
      nextErrors.phone = 'Enter a valid 10-digit Indian mobile number (or include country code).'
    }
    if (password.length < USER_PASSWORD_MIN_LENGTH) {
      nextErrors.password = `Use at least ${USER_PASSWORD_MIN_LENGTH} characters.`
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const firstKey = Object.keys(nextErrors)[0]
      document.getElementById(`reg-${firstKey}`)?.focus()
      return
    }

    setBusy(true)
    setError('')
    setConfirmationMessage('')
    try {
      const result = await auth.register({
        fullName: trimmedName,
        email,
        phone,
        password,
      })

      if (result.needsEmailConfirmation) {
        setConfirmationMessage(
          `Account created for ${email.trim()}. Please check your inbox and click the confirmation link before signing in.`,
        )
        setPassword('')
        setConfirmPassword('')
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Could not create your account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Join Gentleman Gym"
      title="Create account"
      subtitle="Register your member account to manage your profile and stay connected."
      footer={
        <div className="space-y-3">
          <p>
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-gold transition-colors hover:text-gold-soft">
              Sign in
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
          Registration is unavailable because Supabase environment variables are not configured.
        </AuthNotice>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <AuthNotice tone="success">{confirmationMessage}</AuthNotice>
          <AuthNotice tone="error">{error}</AuthNotice>

          <FormField label="Full Name" htmlFor="reg-fullName" error={fieldErrors.fullName} required>
            <input
              id="reg-fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={fieldErrors.fullName ? 'true' : undefined}
              aria-describedby={fieldErrors.fullName ? 'reg-fullName-error' : undefined}
              className="field"
              placeholder="Your full name"
            />
          </FormField>

          <FormField label="Email Address" htmlFor="reg-email" error={fieldErrors.email} required>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={fieldErrors.email ? 'true' : undefined}
              aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
              className="field"
              placeholder="you@example.com"
            />
          </FormField>

          <FormField
            label="Phone Number"
            htmlFor="reg-phone"
            error={fieldErrors.phone}
            hint="10-digit mobile number or +country code"
            required
          >
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={fieldErrors.phone ? 'true' : undefined}
              aria-describedby={fieldErrors.phone ? 'reg-phone-error' : undefined}
              className="field"
              placeholder="98959 79950"
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="reg-password"
            error={fieldErrors.password}
            hint={`Minimum ${USER_PASSWORD_MIN_LENGTH} characters`}
            required
          >
            <PasswordInput
              id="reg-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              placeholder="Create a strong password"
            />
          </FormField>

          <FormField
            label="Confirm Password"
            htmlFor="reg-confirmPassword"
            error={fieldErrors.confirmPassword}
            required
          >
            <PasswordInput
              id="reg-confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              placeholder="Re-enter your password"
            />
          </FormField>

          <button
            type="submit"
            disabled={busy || auth.status === 'loading'}
            className="mt-2 inline-flex w-full items-center justify-center gap-2.5 border border-gold bg-gold px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:border-gold-soft hover:bg-gold-soft disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus className="size-4" strokeWidth={1.8} aria-hidden="true" />
            )}
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
