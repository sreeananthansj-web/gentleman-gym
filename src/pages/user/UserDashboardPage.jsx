import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Calendar,
  Check,
  KeyRound,
  LoaderCircle,
  LogOut,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  TriangleAlert,
  User,
} from 'lucide-react'
import { AuthNotice, FormField, PasswordInput } from '../../components/auth/AuthShell'
import Logo from '../../components/ui/Logo'
import { useUserAuth } from '../../context/UserAuthContext'
import { navigate } from '../../lib/navigate'
import {
  USER_PASSWORD_MIN_LENGTH,
  changeUserPassword,
  normaliseUserPhone,
} from '../../services/userAuthService'
import { formatDate } from '../../utils/format'

export default function UserDashboardPage() {
  const auth = useUserAuth()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileErrors, setProfileErrors] = useState({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileStatus, setProfileStatus] = useState(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwErrors, setPwErrors] = useState({})
  const [pwSaving, setPwSaving] = useState(false)
  const [pwStatus, setPwStatus] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    document.title = 'Member Dashboard · Gentleman Gym'
    let meta = document.querySelector('meta[name="robots"]')
    const previousRobots = meta?.getAttribute('content')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')
    return () => {
      if (previousRobots) meta.setAttribute('content', previousRobots)
    }
  }, [])

  useEffect(() => {
    if (auth.status === 'signedOut') {
      navigate('/login?next=/dashboard', { replace: true })
    }
  }, [auth.status])

  const startEditing = () => {
    if (auth.status !== 'ready') return
    setFullName(auth.profile.full_name)
    setPhone(auth.profile.phone)
    setProfileErrors({})
    setProfileStatus(null)
    setEditing(true)
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    if (profileSaving) return

    const nextErrors = {}
    const trimmed = fullName.trim()
    if (trimmed.length < 2 || trimmed.length > 80) {
      nextErrors.fullName = 'Enter your full name (2–80 characters).'
    }
    if (!normaliseUserPhone(phone)) {
      nextErrors.phone = 'Enter a valid 10-digit Indian mobile number (or include country code).'
    }

    setProfileErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setProfileSaving(true)
    setProfileStatus(null)
    try {
      await auth.updateProfile({ fullName: trimmed, phone })
      setEditing(false)
      setProfileStatus({ tone: 'success', text: 'Your profile has been updated.' })
    } catch (err) {
      setProfileStatus({ tone: 'error', text: err.message || 'Could not update profile.' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    if (pwSaving || auth.status !== 'ready') return

    const nextErrors = {}
    if (!currentPassword) nextErrors.current = 'Enter your current password.'
    if (newPassword.length < USER_PASSWORD_MIN_LENGTH) {
      nextErrors.next = `Use at least ${USER_PASSWORD_MIN_LENGTH} characters.`
    } else if (newPassword === currentPassword) {
      nextErrors.next = 'Choose a password different from your current password.'
    }
    if (confirmPassword !== newPassword) {
      nextErrors.confirm = 'The two passwords do not match.'
    }

    setPwErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setPwSaving(true)
    setPwStatus(null)
    try {
      await changeUserPassword(auth.profile.email, currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwStatus({ tone: 'success', text: 'Your password has been changed.' })
    } catch (err) {
      setPwStatus({ tone: 'error', text: err.message || 'Could not update password.' })
    } finally {
      setPwSaving(false)
    }
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await auth.logout()
      navigate('/', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  if (auth.status === 'loading' || auth.status === 'signedOut') {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-5 text-bone">
        <div role="status" className="flex items-center gap-3 text-sm text-mist">
          <LoaderCircle className="size-5 animate-spin text-gold" aria-hidden="true" />
          <span>{auth.status === 'signedOut' ? 'Redirecting to login…' : 'Loading your dashboard…'}</span>
        </div>
      </main>
    )
  }

  if (auth.status === 'unconfigured') {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-5 text-bone">
        <div className="w-full max-w-md border border-white/12 bg-coal p-8 text-center">
          <p className="display text-3xl">Service unavailable</p>
          <p className="mt-3 text-sm text-mist">
            Supabase environment variables are not configured for this environment.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex border border-gold/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold hover:bg-gold hover:text-ink"
          >
            Back to website
          </a>
        </div>
      </main>
    )
  }

  if (auth.status === 'error') {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-5 text-bone">
        <div role="alert" className="w-full max-w-md border border-white/12 bg-coal p-8 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center border border-[#d9614d]/40 bg-[#d9614d]/10 text-[#f0b3a7]">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>
          <p className="display text-2xl">Could not load dashboard</p>
          <p className="mt-2 text-sm text-mist">{auth.message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={auth.retry}
              className="border border-gold bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink hover:bg-gold-soft"
            >
              Try again
            </button>
            <a
              href="/"
              className="border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-bone hover:border-gold hover:text-gold"
            >
              Home
            </a>
          </div>
        </div>
      </main>
    )
  }

  const { profile, session } = auth
  const emailConfirmed = Boolean(session?.user?.email_confirmed_at)

  return (
    <div className="min-h-screen bg-ink text-bone">
      <header className="border-b border-white/10 bg-coal/95 backdrop-blur-md">
        <div className="shell flex h-[74px] items-center justify-between gap-4">
          <Logo href="/" />
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden items-center gap-1.5 border border-white/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold hover:text-gold sm:inline-flex"
            >
              View Website
              <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 border border-gold/50 bg-gold/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
            >
              {loggingOut ? (
                <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              )}
              {loggingOut ? 'Signing out…' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <main className="shell py-10 sm:py-14">
        <div className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Member dashboard</p>
            <h1 className="display mt-4 text-4xl leading-none text-bone sm:text-5xl">
              Welcome, <span className="text-gold">{profile.full_name}</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
              Manage your Gentleman Gym member profile, contact details, and password settings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
              <ShieldCheck className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              Member Account
            </span>
            <a
              href="/membership"
              className="inline-flex items-center gap-1.5 border border-white/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold hover:text-gold"
            >
              Membership Plans
              <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Information & Edit Profile */}
          <section className="border border-white/12 bg-coal p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                  Profile
                </p>
                <h2 className="display mt-2 text-2xl leading-none text-bone sm:text-3xl">
                  Your details
                </h2>
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold hover:text-gold"
                >
                  <Pencil className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  Edit Profile
                </button>
              )}
            </div>

            {profileStatus && (
              <div className="mt-5">
                <AuthNotice tone={profileStatus.tone}>{profileStatus.text}</AuthNotice>
              </div>
            )}

            {editing ? (
              <form noValidate onSubmit={handleProfileSave} className="mt-6 space-y-5">
                <FormField
                  label="Full Name"
                  htmlFor="dash-fullName"
                  error={profileErrors.fullName}
                  required
                >
                  <input
                    id="dash-fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    aria-invalid={profileErrors.fullName ? 'true' : undefined}
                    className="field"
                  />
                </FormField>

                <FormField
                  label="Phone Number"
                  htmlFor="dash-phone"
                  error={profileErrors.phone}
                  hint="10-digit mobile number or +country code"
                  required
                >
                  <input
                    id="dash-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={profileErrors.phone ? 'true' : undefined}
                    className="field"
                  />
                </FormField>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="inline-flex items-center gap-2 border border-gold bg-gold px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-soft disabled:opacity-50"
                  >
                    {profileSaving ? (
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Check className="size-4" strokeWidth={2} aria-hidden="true" />
                    )}
                    {profileSaving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    disabled={profileSaving}
                    className="border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist transition-colors hover:border-white/40 hover:text-bone"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="mt-6 divide-y divide-white/10 border-t border-white/10">
                <div className="flex items-start gap-3.5 py-4">
                  <User className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.8} aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                      Full Name
                    </dt>
                    <dd className="mt-1 break-words text-sm text-bone">{profile.full_name}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 py-4">
                  <Mail className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.8} aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                      Email Address
                    </dt>
                    <dd className="mt-1 break-all text-sm text-bone">{profile.email}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 py-4">
                  <Phone className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.8} aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                      Phone Number
                    </dt>
                    <dd className="mt-1 text-sm text-bone">{profile.phone}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 py-4">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.8} aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                      Member Since
                    </dt>
                    <dd className="mt-1 text-sm text-mist">{formatDate(profile.created_at)}</dd>
                  </div>
                </div>
              </dl>
            )}
          </section>

          {/* Account Settings */}
          <section className="border border-white/12 bg-coal p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
              Account settings
            </p>
            <h2 className="display mt-2 text-2xl leading-none text-bone sm:text-3xl">
              Security &amp; password
            </h2>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-ink/70 px-4 py-3 text-xs">
              <span className="text-mist">Email verification status</span>
              <span
                className={
                  emailConfirmed
                    ? 'border border-[#3f7a58]/60 bg-[#3f7a58]/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7fd0a1]'
                    : 'border border-gold/50 bg-gold/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-gold'
                }
              >
                {emailConfirmed ? 'Verified' : 'Pending'}
              </span>
            </div>

            {pwStatus && (
              <div className="mt-5">
                <AuthNotice tone={pwStatus.tone}>{pwStatus.text}</AuthNotice>
              </div>
            )}

            <form noValidate onSubmit={handlePasswordChange} className="mt-6 space-y-4">
              <input type="text" autoComplete="username" value={profile.email} readOnly hidden />

              <FormField
                label="Current Password"
                htmlFor="dash-pw-current"
                error={pwErrors.current}
                required
              >
                <PasswordInput
                  id="dash-pw-current"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  error={pwErrors.current}
                  placeholder="Enter current password"
                />
              </FormField>

              <FormField
                label="New Password"
                htmlFor="dash-pw-next"
                error={pwErrors.next}
                hint={`Minimum ${USER_PASSWORD_MIN_LENGTH} characters`}
                required
              >
                <PasswordInput
                  id="dash-pw-next"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={pwErrors.next}
                  placeholder="Enter new password"
                />
              </FormField>

              <FormField
                label="Confirm New Password"
                htmlFor="dash-pw-confirm"
                error={pwErrors.confirm}
                required
              >
                <PasswordInput
                  id="dash-pw-confirm"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={pwErrors.confirm}
                  placeholder="Re-enter new password"
                />
              </FormField>

              <button
                type="submit"
                disabled={pwSaving}
                className="inline-flex items-center gap-2 border border-gold bg-gold px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-soft disabled:opacity-50"
              >
                {pwSaving ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <KeyRound className="size-4" strokeWidth={1.8} aria-hidden="true" />
                )}
                {pwSaving ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
