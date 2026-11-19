import { useEffect, useState } from 'react'
import { Pencil, Plus, Search, Trash2, UserPlus, Users } from 'lucide-react'
import { MEMBER_STATUSES, addMembershipPeriod, deleteMember, effectiveStatus, listMemberHistory, listMembers, saveMember, setMembershipStatus } from '../../services/memberService'
import { listPlans } from '../../services/membershipService'
import { addDuration, formatDate, toDateInput } from '../../utils/format'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { Badge, Btn, Card, EmptyState, ErrorState, Field, IconBtn, PageHeader, Pagination, Spinner } from '../components/ui'
import useLoader from '../components/useLoader'
import { useToast } from '../components/useToast'

const PAGE_SIZE = 10
const statusText = (v) => MEMBER_STATUSES.find((s) => s.value === v)?.label ?? v

export default function Members() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => { setDebounced(search); setPage(1) }, 350)
    return () => window.clearTimeout(t)
  }, [search])

  const { data, loading, error, reload } = useLoader(
    () => listMembers({ page, pageSize: PAGE_SIZE, search: debounced, status }),
    [page, debounced, status],
  )
  const rows = data?.rows ?? []
  const filtered = Boolean(debounced || status)

  useEffect(() => {
    if (data && data.rows.length === 0 && page > 1) setPage((p) => p - 1)
  }, [data, page])

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await deleteMember(toDelete.id)
      toast.success('Member deleted.')
      setToDelete(null)
      setViewing(null)
      reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Members"
        description="Keep track of members and their membership periods. Members are added here by staff; the website has no sign-up."
        actions={<Btn icon={UserPlus} onClick={() => setEditing({})}>Add member</Btn>}
      />

      <Card>
        <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-[1.6fr_1fr]">
          <div className="relative">
            <label htmlFor="mem-search" className="sr-only">Search members</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" strokeWidth={1.7} aria-hidden="true" />
            <input id="mem-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone or email" className="field field-sm pl-10" />
          </div>
          <div>
            <label htmlFor="mem-status" className="sr-only">Filter by membership status</label>
            <select id="mem-status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="field field-sm field-select">
              <option value="">All statuses</option>
              {MEMBER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {loading && !data ? <Spinner /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : rows.length === 0 ? (
          <EmptyState icon={Users} title={filtered ? 'No matching members' : 'No members yet'} description={filtered ? 'Try a different search or filter.' : 'Add a member to start tracking memberships.'}
            action={!filtered && <Btn icon={UserPlus} onClick={() => setEditing({})}>Add member</Btn>} />
        ) : (
          <div className={loading ? 'opacity-60' : ''} aria-busy={loading}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">Members</caption>
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-white/45">
                    <th scope="col" className="px-4 py-3 font-semibold">Member</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Plan</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Ends</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.07]">
                  {rows.map((m) => {
                    const st = effectiveStatus(m)
                    return (
                      <tr key={m.id} className="hover:bg-white/[0.03]">
                        <td className="px-4 py-3.5">
                          <button type="button" onClick={() => setViewing(m)} className="text-left focus-visible:outline-2 focus-visible:outline-gold">
                            <span className="block font-medium text-bone hover:text-gold">{m.full_name}</span>
                            <span className="block text-xs text-mist">{m.phone}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-mist">{m.plan?.name ?? '—'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-xs text-mist">{formatDate(m.membership_end)}</td>
                        <td className="px-4 py-3.5"><Badge tone={st}>{statusText(st)}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.count} onPage={setPage} />
          </div>
        )}
      </Card>

      {editing && <MemberForm key={editing.id ?? 'new'} initial={editing} onClose={() => setEditing(null)}
        onSaved={(saved) => { setEditing(null); toast.success('Member saved.'); reload(); if (viewing) setViewing(saved) }} />}

      {viewing && <MemberDetail member={viewing} onClose={() => setViewing(null)} onEdit={() => setEditing(viewing)} onDelete={() => setToDelete(viewing)} onChanged={(m) => { if (m) setViewing(m); reload() }} />}

      <ConfirmDialog open={Boolean(toDelete)} title="Delete member?" message={toDelete ? `Delete ${toDelete.full_name} and their membership history? This cannot be undone.` : ''} busy={busy} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  )
}

function MemberForm({ initial, onClose, onSaved }) {
  const toast = useToast()
  const [v, setV] = useState({
    full_name: initial.full_name ?? '', phone: initial.phone ?? '', email: initial.email ?? '',
    joined_on: initial.joined_on ?? toDateInput(), membership_status: initial.membership_status ?? 'none', notes: initial.notes ?? '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  const submit = async (event) => {
    event.preventDefault()
    const e = {}
    if (v.full_name.trim().length < 2) e.full_name = 'Enter the member’s name.'
    if (!/^\+?[0-9]{7,15}$/.test(v.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid phone number (7–15 digits).'
    if (v.email && !/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'Enter a valid email or leave it empty.'
    setErrors(e)
    if (Object.keys(e).length) return
    setSaving(true)
    try {
      onSaved(await saveMember({ id: initial.id, ...v, phone: v.phone.replace(/[\s-]/g, '') }))
    } catch (err) {
      toast.error(err.code === '23505' ? 'A member with this phone number already exists.' : err.message)
      setSaving(false)
    }
  }

  return (
    <Modal open size="lg" title={initial.id ? 'Edit member' : 'Add member'} onClose={onClose} busy={saving}
      footer={<><Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn><Btn type="submit" form="member-form" loading={saving}>Save member</Btn></>}>
      <form id="member-form" noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="m-name" required error={errors.full_name}><input id="m-name" data-autofocus value={v.full_name} maxLength={80} onChange={set('full_name')} aria-invalid={errors.full_name ? 'true' : undefined} className="field field-sm" /></Field>
        <Field label="Phone" htmlFor="m-phone" required error={errors.phone}><input id="m-phone" inputMode="tel" value={v.phone} onChange={set('phone')} aria-invalid={errors.phone ? 'true' : undefined} className="field field-sm" /></Field>
        <Field label="Email" htmlFor="m-email" error={errors.email}><input id="m-email" type="email" value={v.email} onChange={set('email')} className="field field-sm" /></Field>
        <Field label="Joined on" htmlFor="m-joined"><input id="m-joined" type="date" value={v.joined_on} onChange={set('joined_on')} className="field field-sm" /></Field>
        <Field label="Membership status" htmlFor="m-status" className="sm:col-span-2">
          <select id="m-status" value={v.membership_status} onChange={set('membership_status')} className="field field-sm field-select">
            {MEMBER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Notes" htmlFor="m-notes" className="sm:col-span-2"><textarea id="m-notes" rows={3} maxLength={4000} value={v.notes} onChange={set('notes')} className="field field-sm resize-y" /></Field>
      </form>
    </Modal>
  )
}

function MemberDetail({ member, onClose, onEdit, onDelete, onChanged }) {
  const toast = useToast()
  const history = useLoader(() => listMemberHistory(member.id), [member.id])
  const plans = useLoader(listPlans)
  const [adding, setAdding] = useState(false)
  const st = effectiveStatus(member)

  const changeStatus = async (value) => {
    try {
      await setMembershipStatus(member.id, value)
      toast.success('Status updated.')
      onChanged({ ...member, membership_status: value })
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <Modal open size="lg" title={member.full_name} onClose={onClose}
        footer={<><Btn variant="danger" icon={Trash2} onClick={onDelete} className="sm:mr-auto">Delete</Btn><Btn variant="outline" icon={Pencil} onClick={onEdit}>Edit details</Btn><Btn onClick={onClose}>Close</Btn></>}>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div><dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Phone</dt><dd className="mt-1 text-sm text-bone">{member.phone}</dd></div>
          <div><dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Email</dt><dd className="mt-1 break-all text-sm text-bone">{member.email || '—'}</dd></div>
          <div><dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Joined</dt><dd className="mt-1 text-sm text-bone">{formatDate(member.joined_on)}</dd></div>
          <div><dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Current membership</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2 text-sm text-bone"><Badge tone={st}>{statusText(st)}</Badge>{member.plan?.name} {member.membership_end && <span className="text-mist">until {formatDate(member.membership_end)}</span>}</dd></div>
          {member.notes && <div className="sm:col-span-2"><dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-mist">{member.notes}</dd></div>}
        </dl>

        <div className="mt-5 max-w-xs">
          <Field label="Set membership status" htmlFor="md-status">
            <select id="md-status" value={member.membership_status} onChange={(e) => changeStatus(e.target.value)} className="field field-sm field-select">
              {MEMBER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="mt-7 border-t border-white/10 pt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="display text-xl leading-none">Membership history</h3>
            <Btn size="sm" icon={Plus} onClick={() => setAdding(true)}>Add period</Btn>
          </div>
          {history.loading && !history.data ? <Spinner className="py-6" /> : history.error ? <p className="text-sm text-[#f0b3a7]">{history.error}</p> : (history.data ?? []).length === 0 ? (
            <p className="text-sm text-mist">No membership periods recorded yet.</p>
          ) : (
            <ul className="divide-y divide-white/10 border border-white/10">
              {history.data.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 p-3.5 text-sm">
                  <div><p className="text-bone">{h.plan_name}</p>{h.notes && <p className="text-xs text-mist">{h.notes}</p>}</div>
                  <p className="text-xs text-mist">{formatDate(h.start_date)} → {formatDate(h.end_date)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      {adding && <PeriodForm member={member} plans={plans.data ?? []} onClose={() => setAdding(false)}
        onSaved={() => { setAdding(false); toast.success('Membership added.'); history.reload(); onChanged() }} />}
    </>
  )
}

function PeriodForm({ member, plans, onClose, onSaved }) {
  const toast = useToast()
  const [planId, setPlanId] = useState('')
  const [planName, setPlanName] = useState('')
  const [start, setStart] = useState(toDateInput())
  const [end, setEnd] = useState(addDuration(toDateInput(), 1, 'month'))
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const pickPlan = (id) => {
    setPlanId(id)
    const plan = plans.find((p) => p.id === id)
    if (plan) setEnd(addDuration(start, plan.duration_value, plan.duration_unit))
  }
  const changeStart = (value) => {
    setStart(value)
    const plan = plans.find((p) => p.id === planId)
    if (plan && value) setEnd(addDuration(value, plan.duration_value, plan.duration_unit))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!planId && !planName.trim()) { setError('Choose a plan or type a plan name.'); return }
    if (!start || !end || end < start) { setError('The end date must be on or after the start date.'); return }
    setError('')
    setSaving(true)
    try {
      await addMembershipPeriod({ memberId: member.id, planId, planName, startDate: start, endDate: end, notes })
      onSaved()
    } catch (err) {
      toast.error(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal open title="Add membership period" onClose={onClose} busy={saving}
      footer={<><Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn><Btn type="submit" form="period-form" loading={saving}>Add period</Btn></>}>
      <form id="period-form" noValidate onSubmit={submit} className="space-y-5">
        {error && <p role="alert" className="text-xs text-[#e89a8b]">{error}</p>}
        <Field label="Plan" htmlFor="pf-plan">
          <select id="pf-plan" data-autofocus value={planId} onChange={(e) => pickPlan(e.target.value)} className="field field-sm field-select">
            <option value="">Custom (type a name below)</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        {!planId && <Field label="Plan name" htmlFor="pf-name"><input id="pf-name" value={planName} maxLength={80} onChange={(e) => setPlanName(e.target.value)} className="field field-sm" /></Field>}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Starts" htmlFor="pf-start"><input id="pf-start" type="date" value={start} onChange={(e) => changeStart(e.target.value)} className="field field-sm" /></Field>
          <Field label="Ends" htmlFor="pf-end"><input id="pf-end" type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className="field field-sm" /></Field>
        </div>
        <Field label="Notes" htmlFor="pf-notes"><textarea id="pf-notes" rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} className="field field-sm resize-y" /></Field>
        <p className="text-[11px] text-white/45">This also sets the member's current status to Active.</p>
      </form>
    </Modal>
  )
}
