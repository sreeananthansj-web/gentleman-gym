import { useState } from 'react'
import { Dumbbell, Pencil, Plus, Trash2 } from 'lucide-react'
import { clearRemoteContentCache } from '../../hooks/useRemoteContent'
import { moveItem, persistOrder } from '../../services/serviceUtils'
import { deleteTrainer, listTrainers, saveTrainer, setTrainerActive } from '../../services/trainerService'
import ConfirmDialog from '../components/ConfirmDialog'
import ImagePicker from '../components/ImagePicker'
import Modal from '../components/Modal'
import OrderButtons from '../components/OrderButtons'
import { Badge, Btn, Card, EmptyState, ErrorState, Field, IconBtn, PageHeader, Spinner, Toggle } from '../components/ui'
import useLoader from '../components/useLoader'
import { useToast } from '../components/useToast'

const BLANK = { name: '', title: '', description: '', image_alt: '', is_active: true, image_url: null }

export default function Trainers() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useLoader(listTrainers)
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
      await persistOrder('trainers', next)
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
      await setTrainerActive(row.id, value)
      clearRemoteContentCache()
    } catch (err) {
      toast.error(err.message)
      reload()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await deleteTrainer(toDelete)
      clearRemoteContentCache()
      toast.success('Trainer deleted.')
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
        title="Trainers"
        description="Trainer profiles shown on the website. The first active trainer is labelled Head Trainer."
        actions={<Btn icon={Plus} onClick={() => setEditing({ ...BLANK })}>Add trainer</Btn>}
      />

      {loading && !data ? <Card><Spinner /></Card> : error && !data ? <Card><ErrorState message={error} onRetry={reload} /></Card> : rows.length === 0 ? (
        <Card><EmptyState icon={Dumbbell} title="No trainers yet" description="Add a trainer to show them on the website." action={<Btn icon={Plus} onClick={() => setEditing({ ...BLANK })}>Add trainer</Btn>} /></Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((row, index) => (
            <li key={row.id}>
              <Card className="flex h-full flex-col sm:flex-row">
                <div className="aspect-[4/5] w-full shrink-0 overflow-hidden bg-ink sm:w-40">
                  {row.image_url ? (
                    <img src={row.image_url} alt={row.image_alt || row.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-white/20"><Dumbbell className="size-8" strokeWidth={1.3} aria-hidden="true" /></div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="display truncate text-2xl leading-none text-bone">{row.name}</h2>
                      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">{row.title}</p>
                    </div>
                    {!row.is_active && <Badge tone="inactive">Hidden</Badge>}
                  </div>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-mist">{row.description}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                    <OrderButtons index={index} total={rows.length} onMove={move} disabled={reordering} />
                    <div className="flex items-center gap-1.5">
                      <Toggle checked={row.is_active} onChange={(v) => toggle(row, v)} label={`Show ${row.name} on website`} />
                      <IconBtn label={`Edit ${row.name}`} icon={Pencil} onClick={() => setEditing(row)} />
                      <IconBtn label={`Delete ${row.name}`} icon={Trash2} variant="danger" onClick={() => setToDelete(row)} />
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <TrainerForm
          key={editing.id ?? 'new'}
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); clearRemoteContentCache(); toast.success('Trainer saved.'); reload() }}
        />
      )}

      <ConfirmDialog open={Boolean(toDelete)} title="Delete trainer?" message={toDelete ? `Remove ${toDelete.name} from the website and delete their photo? This cannot be undone.` : ''} busy={busy} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  )
}

function TrainerForm({ initial, onClose, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState({
    name: initial.name, title: initial.title, description: initial.description,
    image_alt: initial.image_alt ?? '', is_active: initial.is_active,
  })
  const [files, setFiles] = useState([])
  const [imageError, setImageError] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setValues({ ...values, [key]: e.target.value })

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!values.name.trim()) next.name = 'Enter the trainer name.'
    if (!values.title.trim()) next.title = 'Enter a title or specialty.'
    if (values.description.length > 1000) next.description = 'Keep the description under 1000 characters.'
    setErrors(next)
    if (Object.keys(next).length || imageError) return
    setSaving(true)
    try {
      await saveTrainer({ id: initial.id, imageFile: files[0], ...values })
      onSaved()
    } catch (err) {
      toast.error(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      size="lg"
      title={initial.id ? 'Edit trainer' : 'Add trainer'}
      onClose={onClose}
      busy={saving}
      footer={
        <>
          <Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn>
          <Btn type="submit" form="trainer-form" loading={saving}>{saving ? 'Saving…' : 'Save trainer'}</Btn>
        </>
      }
    >
      <form id="trainer-form" noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="tr-name" required error={errors.name}>
          <input id="tr-name" data-autofocus value={values.name} maxLength={80} onChange={set('name')} aria-invalid={errors.name ? 'true' : undefined} className="field field-sm" />
        </Field>
        <Field label="Title / specialty" htmlFor="tr-title" required error={errors.title}>
          <input id="tr-title" value={values.title} maxLength={120} onChange={set('title')} aria-invalid={errors.title ? 'true' : undefined} className="field field-sm" />
        </Field>
        <Field label="About" htmlFor="tr-desc" error={errors.description} className="sm:col-span-2" hint="Shown on the website. Only add details the trainer has confirmed.">
          <textarea id="tr-desc" rows={4} value={values.description} maxLength={1000} onChange={set('description')} className="field field-sm resize-y" />
        </Field>
        <div className="sm:col-span-2">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Profile picture</p>
          <ImagePicker files={files} onChange={setFiles} currentUrl={initial.image_url} error={imageError} onError={setImageError} />
        </div>
        <Field label="Photo description (for screen readers)" htmlFor="tr-alt" className="sm:col-span-2">
          <input id="tr-alt" value={values.image_alt} maxLength={200} onChange={set('image_alt')} className="field field-sm" placeholder="e.g. Trainer demonstrating a deadlift" />
        </Field>
        <div className="flex items-center justify-between gap-4 border border-white/10 p-3.5 sm:col-span-2">
          <p className="text-sm text-bone">Show on website</p>
          <Toggle checked={values.is_active} onChange={(v) => setValues({ ...values, is_active: v })} label="Show on website" />
        </div>
      </form>
    </Modal>
  )
}
