import { useState } from 'react'
import { CreditCard, Pencil, Plus, Trash2 } from 'lucide-react'
import { clearRemoteContentCache } from '../../hooks/useRemoteContent'
import { DURATION_UNITS, deletePlan, listPlans, savePlan, setPlanActive } from '../../services/membershipService'
import { moveItem, persistOrder } from '../../services/serviceUtils'
import { formatDuration, formatPrice } from '../../utils/format'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import OrderButtons from '../components/OrderButtons'
import { Badge, Btn, Card, EmptyState, ErrorState, Field, IconBtn, PageHeader, Spinner, Toggle } from '../components/ui'
import useLoader from '../components/useLoader'
import { useToast } from '../components/useToast'

const BLANK = { name: '', description: '', price: '', duration_value: 1, duration_unit: 'month', features: [], is_featured: false, is_active: true }

export default function Membership() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useLoader(listPlans)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const [reordering, setReordering] = useState(false)
  const rows = data ?? []

  const move = async (index, delta) => {
    const next = moveItem(rows, index, delta)
    if (next === rows) return
    setReordering(true)
    try {
      await persistOrder('membership_plans', next)
      setData(next.map((row, i) => ({ ...row, display_order: i + 1 })))
      clearRemoteContentCache()
    } catch (err) {
      toast.error(err.message)
      reload()
    } finally {
      setReordering(false)
    }
  }

  const toggle = async (row, value) => {
    setData((list) => list.map((r) => (r.id === row.id ? { ...r, is_active: value } : r)))
    try {
      await setPlanActive(row.id, value)
      clearRemoteContentCache()
    } catch (err) {
      toast.error(err.message)
      reload()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await deletePlan(toDelete.id)
      clearRemoteContentCache()
      toast.success('Plan deleted.')
      setToDelete(null)
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
        title="Membership plans"
        description="Active plans appear in the Membership section of the website. Leave the price empty to show “Ask the gym”."
        actions={<Btn icon={Plus} onClick={() => setEditing({ ...BLANK })}>Add plan</Btn>}
      />

      <Card>
        {loading && !data ? <Spinner /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : rows.length === 0 ? (
          <EmptyState icon={CreditCard} title="No plans yet" description="Plans you add and activate will appear on the website. Nothing is shown there until you do." action={<Btn icon={Plus} onClick={() => setEditing({ ...BLANK })}>Add plan</Btn>} />
        ) : (
          <ul className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <li key={row.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <OrderButtons index={index} total={rows.length} onMove={move} disabled={reordering} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-bone">{row.name}</p>
                    {row.is_featured && <Badge tone="new">Featured</Badge>}
                    {!row.is_active && <Badge tone="inactive">Hidden</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-gold">
                    {formatPrice(row.price, row.currency) ?? <span className="text-mist">No price set</span>}
                    <span className="text-mist"> · {formatDuration(row.duration_value, row.duration_unit)}</span>
                  </p>
                  {row.description && <p className="mt-1.5 line-clamp-2 text-sm text-mist">{row.description}</p>}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Toggle checked={row.is_active} onChange={(v) => toggle(row, v)} label={`Activate ${row.name}`} />
                  <IconBtn label={`Edit ${row.name}`} icon={Pencil} onClick={() => setEditing({ ...row, price: row.price ?? '', features: row.features ?? [] })} />
                  <IconBtn label={`Delete ${row.name}`} icon={Trash2} variant="danger" onClick={() => setToDelete(row)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editing && (
        <PlanForm key={editing.id ?? 'new'} initial={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); clearRemoteContentCache(); toast.success('Plan saved.'); reload() }} />
      )}
      <ConfirmDialog open={Boolean(toDelete)} title="Delete plan?" message={toDelete ? `Delete the "${toDelete.name}" plan? Existing member history keeps the plan name.` : ''} busy={busy} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  )
}

function PlanForm({ initial, onClose, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState({
    name: initial.name, description: initial.description, price: String(initial.price ?? ''),
    duration_value: String(initial.duration_value), duration_unit: initial.duration_unit,
    features: (initial.features ?? []).join('\n'), is_featured: initial.is_featured, is_active: initial.is_active,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setValues({ ...values, [key]: e.target.value })

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!values.name.trim()) next.name = 'Enter a plan name.'
    if (values.price !== '' && (Number.isNaN(Number(values.price)) || Number(values.price) < 0)) next.price = 'Enter a valid price, or leave it empty.'
    const dv = Number(values.duration_value)
    if (!Number.isInteger(dv) || dv < 1 || dv > 1000) next.duration_value = 'Enter a whole number of 1 or more.'
    if (values.description.length > 600) next.description = 'Keep the description under 600 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await savePlan({ id: initial.id, ...values })
      onSaved()
    } catch (err) {
      toast.error(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal open size="lg" title={initial.id ? 'Edit plan' : 'Add plan'} onClose={onClose} busy={saving}
      footer={<><Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn><Btn type="submit" form="plan-form" loading={saving}>Save plan</Btn></>}>
      <form id="plan-form" noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <Field label="Plan name" htmlFor="pl-name" required error={errors.name} className="sm:col-span-2">
          <input id="pl-name" data-autofocus value={values.name} maxLength={80} onChange={set('name')} aria-invalid={errors.name ? 'true' : undefined} className="field field-sm" />
        </Field>
        <Field label="Price (₹)" htmlFor="pl-price" error={errors.price} hint="Optional. Empty shows “Ask the gym”.">
          <input id="pl-price" inputMode="decimal" value={values.price} onChange={set('price')} aria-invalid={errors.price ? 'true' : undefined} className="field field-sm" />
        </Field>
        <div className="grid grid-cols-[1fr_1.4fr] gap-3">
          <Field label="Duration" htmlFor="pl-dur" error={errors.duration_value}>
            <input id="pl-dur" inputMode="numeric" value={values.duration_value} onChange={set('duration_value')} aria-invalid={errors.duration_value ? 'true' : undefined} className="field field-sm" />
          </Field>
          <Field label="Unit" htmlFor="pl-unit">
            <select id="pl-unit" value={values.duration_unit} onChange={set('duration_unit')} className="field field-sm field-select">
              {DURATION_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description" htmlFor="pl-desc" error={errors.description} className="sm:col-span-2">
          <textarea id="pl-desc" rows={3} value={values.description} maxLength={600} onChange={set('description')} className="field field-sm resize-y" />
        </Field>
        <Field label="What's included" htmlFor="pl-feat" hint="One item per line (up to 20)." className="sm:col-span-2">
          <textarea id="pl-feat" rows={4} value={values.features} onChange={set('features')} className="field field-sm resize-y" />
        </Field>
        <div className="flex items-center justify-between gap-4 border border-white/10 p-3.5">
          <p className="text-sm text-bone">Featured</p>
          <Toggle checked={values.is_featured} onChange={(v) => setValues({ ...values, is_featured: v })} label="Featured plan" />
        </div>
        <div className="flex items-center justify-between gap-4 border border-white/10 p-3.5">
          <p className="text-sm text-bone">Active on website</p>
          <Toggle checked={values.is_active} onChange={(v) => setValues({ ...values, is_active: v })} label="Active on website" />
        </div>
      </form>
    </Modal>
  )
}
