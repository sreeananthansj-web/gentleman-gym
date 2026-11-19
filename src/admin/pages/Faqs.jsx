import { useState } from 'react'
import { CircleHelp, Pencil, Plus, Trash2 } from 'lucide-react'
import { clearRemoteContentCache } from '../../hooks/useRemoteContent'
import { deleteFaq, listFaqs, saveFaq, setFaqActive } from '../../services/faqService'
import { moveItem, persistOrder } from '../../services/serviceUtils'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import OrderButtons from '../components/OrderButtons'
import { Badge, Btn, Card, EmptyState, ErrorState, Field, IconBtn, PageHeader, Spinner, Toggle } from '../components/ui'
import useLoader from '../components/useLoader'
import { useToast } from '../components/useToast'

const BLANK = { question: '', answer: '', is_active: true }

export default function Faqs() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useLoader(listFaqs)
  const [editing, setEditing] = useState(null) // null | BLANK-like object (with id when editing)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const [reordering, setReordering] = useState(false)

  const rows = data ?? []

  const move = async (index, delta) => {
    const next = moveItem(rows, index, delta)
    if (next === rows) return
    setReordering(true)
    try {
      await persistOrder('faqs', next)
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
      await setFaqActive(row.id, value)
      clearRemoteContentCache()
    } catch (err) {
      toast.error(err.message)
      reload()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await deleteFaq(toDelete.id)
      clearRemoteContentCache()
      toast.success('FAQ deleted.')
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
        title="FAQs"
        description="Questions shown in the FAQ section of the website, in the order listed here."
        actions={<Btn icon={Plus} onClick={() => setEditing({ ...BLANK })}>Add FAQ</Btn>}
      />

      <Card>
        {loading && !data ? <Spinner /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : rows.length === 0 ? (
          <EmptyState icon={CircleHelp} title="No FAQs yet" description="Add your first question. Visitors will see it on the website." action={<Btn icon={Plus} onClick={() => setEditing({ ...BLANK })}>Add FAQ</Btn>} />
        ) : (
          <ul className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <li key={row.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
                <OrderButtons index={index} total={rows.length} onMove={move} disabled={reordering} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-bone">{row.question}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-mist">{row.answer}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {!row.is_active && <Badge tone="inactive">Hidden</Badge>}
                  <Toggle checked={row.is_active} onChange={(v) => toggle(row, v)} label={`Show "${row.question}" on website`} />
                  <IconBtn label={`Edit ${row.question}`} icon={Pencil} onClick={() => setEditing(row)} />
                  <IconBtn label={`Delete ${row.question}`} icon={Trash2} variant="danger" onClick={() => setToDelete(row)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editing && (
        <FaqForm
          key={editing.id ?? 'new'}
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); clearRemoteContentCache(); toast.success('FAQ saved.'); reload() }}
        />
      )}

      <ConfirmDialog open={Boolean(toDelete)} title="Delete FAQ?" message={toDelete ? `Delete "${toDelete.question}"? This cannot be undone.` : ''} busy={busy} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  )
}

function FaqForm({ initial, onClose, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState({ question: initial.question, answer: initial.answer, is_active: initial.is_active })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (values.question.trim().length < 3) next.question = 'Enter the question (at least 3 characters).'
    if (values.question.length > 300) next.question = 'Keep the question under 300 characters.'
    if (!values.answer.trim()) next.answer = 'Enter the answer.'
    if (values.answer.length > 2000) next.answer = 'Keep the answer under 2000 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await saveFaq({ id: initial.id, ...values })
      onSaved()
    } catch (err) {
      toast.error(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      title={initial.id ? 'Edit FAQ' : 'Add FAQ'}
      onClose={onClose}
      busy={saving}
      footer={
        <>
          <Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn>
          <Btn type="submit" form="faq-form" loading={saving}>Save FAQ</Btn>
        </>
      }
    >
      <form id="faq-form" noValidate onSubmit={submit} className="space-y-5">
        <Field label="Question" htmlFor="faq-question" required error={errors.question}>
          <input id="faq-question" data-autofocus value={values.question} maxLength={300} onChange={(e) => setValues({ ...values, question: e.target.value })} aria-invalid={errors.question ? 'true' : undefined} className="field field-sm" />
        </Field>
        <Field label="Answer" htmlFor="faq-answer" required error={errors.answer}>
          <textarea id="faq-answer" rows={6} value={values.answer} maxLength={2000} onChange={(e) => setValues({ ...values, answer: e.target.value })} aria-invalid={errors.answer ? 'true' : undefined} className="field field-sm resize-y" />
        </Field>
        <div className="flex items-center justify-between gap-4 border border-white/10 p-3.5">
          <div>
            <p className="text-sm text-bone">Show on website</p>
            <p className="text-[11px] text-white/45">Hidden FAQs stay saved but visitors cannot see them.</p>
          </div>
          <Toggle checked={values.is_active} onChange={(v) => setValues({ ...values, is_active: v })} label="Show on website" />
        </div>
      </form>
    </Modal>
  )
}
