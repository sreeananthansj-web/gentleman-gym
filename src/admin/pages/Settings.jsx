import { useState } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { supabaseUrl } from '../../services/supabase'
import { changePassword, listAdmins } from '../../services/authService'
import { formatDate } from '../../utils/format'
import { useAuth } from '../auth/AuthContext'
import { Badge, Btn, Card, Field, PageHeader, Spinner } from '../components/ui'
import useLoader from '../components/useLoader'
import { useToast } from '../components/useToast'

const MIN_LENGTH = 12

export default function Settings() {
  const { profile } = useAuth()
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const admins = useLoader(listAdmins)

  const submit = async (event) => {
    event.preventDefault()
    const e = {}
    if (!current) e.current = 'Enter your current password.'
    if (next.length < MIN_LENGTH) e.next = `Use at least ${MIN_LENGTH} characters.`
    else if (next === current) e.next = 'Choose a password different from the current one.'
    if (confirm !== next) e.confirm = 'The two passwords do not match.'
    setErrors(e)
    if (Object.keys(e).length) return
    setSaving(true)
    try {
      await changePassword(profile.email, current, next)
      toast.success('Password changed.')
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  let host = ''
  try { host = new URL(supabaseUrl).host } catch { host = supabaseUrl }

  return (
    <>
      <PageHeader title="Settings" description="Your account and security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="display text-2xl leading-none">Account</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Email</dt><dd className="mt-1 break-all text-bone">{profile.email}</dd></div>
            <div><dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Role</dt><dd className="mt-1"><Badge tone="new">{profile.role === 'super_admin' ? 'Super admin' : 'Admin'}</Badge></dd></div>
            <div><dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Connected project</dt><dd className="mt-1 break-all text-mist">{host}</dd></div>
          </dl>
          <p className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/45">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold" strokeWidth={1.7} aria-hidden="true" />
            New administrators are added by the project owner in Supabase (see SETUP.md). They cannot be created from this website.
          </p>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="display text-2xl leading-none">Change password</h2>
          <form noValidate onSubmit={submit} className="mt-5 space-y-4">
            <input type="text" autoComplete="username" value={profile.email} readOnly hidden />
            <Field label="Current password" htmlFor="pw-current" error={errors.current}>
              <input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} aria-invalid={errors.current ? 'true' : undefined} className="field field-sm" />
            </Field>
            <Field label="New password" htmlFor="pw-next" error={errors.next} hint={`At least ${MIN_LENGTH} characters. A passphrase works well.`}>
              <input id="pw-next" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} aria-invalid={errors.next ? 'true' : undefined} className="field field-sm" />
            </Field>
            <Field label="Confirm new password" htmlFor="pw-confirm" error={errors.confirm}>
              <input id="pw-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={errors.confirm ? 'true' : undefined} className="field field-sm" />
            </Field>
            <Btn type="submit" icon={KeyRound} loading={saving}>Update password</Btn>
          </form>
        </Card>

        {profile.role === 'super_admin' && (
          <Card className="p-5 sm:p-6 lg:col-span-2">
            <h2 className="display text-2xl leading-none">Administrators</h2>
            {admins.loading && !admins.data ? <Spinner /> : admins.error ? (
              <p className="mt-4 text-sm text-[#f0b3a7]">{admins.error}</p>
            ) : (
              <ul className="mt-4 divide-y divide-white/10 border border-white/10">
                {(admins.data ?? []).map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5 text-sm">
                    <span className="break-all text-bone">{a.email}</span>
                    <span className="flex items-center gap-3 text-xs text-mist">
                      Added {formatDate(a.created_at)}
                      <Badge tone={a.role === 'super_admin' ? 'new' : 'none'}>{a.role === 'super_admin' ? 'Super admin' : 'Admin'}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </>
  )
}
