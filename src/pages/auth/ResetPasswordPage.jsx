import { useEffect, useState } from 'react'
import { ArrowLeft, KeyRound, LoaderCircle } from 'lucide-react'
import { AuthNotice, AuthShell, FormField, PasswordInput } from '../../components/auth/AuthShell'
import { useUserAuth } from '../../context/UserAuthContext'
import { navigate } from '../../lib/navigate'
import {
  USER_PASSWORD_MIN_LENGTH,
  resetPasswordWithRecovery,
} from '../../services/userAuthService'

function getUrlRecoveryError() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const searchParams = new URLSearchParams(window.location.search)
  return (
    hashParams.get('error_description') ||
    searchParams.get('error_description') ||
    hashParams.get('error') ||
    searchParams.get('error') ||
    ''
  )
}

export default function ResetPasswordPage() {
  const auth = useUserAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [urlError] = useState(getUrlRecoveryError)

  useEffect(() => {
    document.title = 'Reset Password · Gentleman Gym'
    let meta = document.querySelector('meta[name="robots"]')
    const previousRobots = meta?.getAttribute('content')
    if (meta) meta.setAttribute('content', 'noindex, nofollow')
    return () => {
      if (meta && previousRobots) meta.setAttribute('content', previousRobots)
    }
  }, [])

  const canReset = !urlError && (auth.recoveryMode || auth.status === 'ready')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy || !canReset) return

    const nextErrors = {}
    if (password.length < USER_PASSWORD_MIN_LENGTH) {
      nextErrors.password = `Use at least ${USER_PASSWORD_MIN_LENGTH} characters.`
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      document.getElementById(`reset-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }

    setBusy(true)
    setError('')
    try {
      await resetPasswordWithRecovery(password)
      auth.clearRecoveryMode()
      await auth.logout().catch(() => {})
      navigate('/login?reset=1', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not update your password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Account security"
      title="Set new password"
      subtitle="Choose a new password for your Gentleman Gym account."
      footer={
        <p>
          <a href="/login" className="inline-flex items-center gap-1.5 text-white/45 transition-colors hover:text-bone">
            <ArrowLeft className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            Back to sign in
          </a>
        </p>
      }
    >
      {auth.status === 'unconfigured' ? (
        <AuthNotice tone="error">
          Password reset is unavailable because Supabase environment variables are not configured.
        </AuthNotice>
      ) : auth.status === 'loading' ? (
        <div role="status" className="flex items-center justify-center gap-3 py-8 text-sm text-mist">
          <LoaderCircle className="size-5 animate-spin text-gold" aria-hidden="true" />
          <span>Verifying your reset link…</span>
        </div>
      ) : !canReset ? (
        <div className="space-y-5">
          <AuthNotice tone="error">
            {urlError
              ? urlError
              : 'This password reset link is missing or has expired. Please request a new reset link.'}
          </AuthNotice>
          <a
            href="/forgot-password"
            className="inline-flex w-full items-center justify-center border border-gold bg-gold px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:border-gold-soft hover:bg-gold-soft"
          >
            Request new reset link
          </a>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <AuthNotice tone="error">{error}</AuthNotice>

          <FormField
            label="New Password"
            htmlFor="reset-password"
            error={fieldErrors.password}
            hint={`Minimum ${USER_PASSWORD_MIN_LENGTH} characters`}
            required
          >
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              placeholder="Enter new password"
            />
          </FormField>

          <FormField
            label="Confirm New Password"
            htmlFor="reset-confirmPassword"
            error={fieldErrors.confirmPassword}
            required
          >
            <PasswordInput
              id="reset-confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              placeholder="Re-enter new password"
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
              <KeyRound className="size-4" strokeWidth={1.8} aria-hidden="true" />
            )}
            {busy ? 'Updating password…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
