import { useEffect, useState } from 'react'
import { MessageCircle, Phone, Search, Trash2, Inbox } from 'lucide-react'
import { fitnessGoals } from '../../data/site'
import { whatsappHref } from '../../lib/links'
import {
  ENQUIRY_STATUSES,
  deleteEnquiry,
  listEnquiries,
  updateEnquiry,
} from '../../services/enquiryService'
import { formatDateTime } from '../../utils/format'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import {
  Btn,
  Card,
  EmptyState,
  EnquiryStatusBadge,
  ErrorState,
  Field,
  PageHeader,
  Pagination,
  Spinner,
} from '../components/ui'
import useLoader from '../components/useLoader'
import { useToast } from '../components/useToast'

const PAGE_SIZE = 10

function useDebounced(value, ms = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(t)
  }, [value, ms])
  return debounced
}

export default function Enquiries() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [goal, setGoal] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const debouncedSearch = useDebounced(search)

  const { data, loading, error, reload } = useLoader(
    () => listEnquiries({ page, pageSize: PAGE_SIZE, search: debouncedSearch, goal, status, sort }),
    [page, debouncedSearch, goal, status, sort],
  )

  const changeFilter = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  // If the last row of the last page was removed, step back a page.
  useEffect(() => {
    if (data && data.rows.length === 0 && page > 1) setPage((p) => p - 1)
  }, [data, page])

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteEnquiry(toDelete.id)
      toast.success('Enquiry deleted.')
      setToDelete(null)
      setSelected(null)
      reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const rows = data?.rows ?? []
  const filtered = Boolean(debouncedSearch || goal || status)

  return (
    <>
      <PageHeader title="Enquiries" description="Everything sent through the website contact form." />

      <Card>
        <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr]">
          <div className="relative">
            <label htmlFor="enq-search" className="sr-only">Search by name or phone number</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" strokeWidth={1.7} aria-hidden="true" />
            <input id="enq-search" type="search" value={search} onChange={changeFilter(setSearch)} placeholder="Search name or phone" className="field field-sm pl-10" />
          </div>
          <div>
            <label htmlFor="enq-goal" className="sr-only">Filter by fitness goal</label>
            <select id="enq-goal" value={goal} onChange={changeFilter(setGoal)} className="field field-sm field-select">
              <option value="">All fitness goals</option>
              {fitnessGoals.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="enq-status" className="sr-only">Filter by status</label>
            <select id="enq-status" value={status} onChange={changeFilter(setStatus)} className="field field-sm field-select">
              <option value="">All statuses</option>
              {ENQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="enq-sort" className="sr-only">Sort order</label>
            <select id="enq-sort" value={sort} onChange={changeFilter(setSort)} className="field field-sm field-select">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {loading && !data ? (
          <Spinner />
        ) : error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={filtered ? 'No matching enquiries' : 'No enquiries yet'}
            description={filtered ? 'Try a different search or clear the filters.' : 'New enquiries from the website will show up here.'}
            action={filtered && <Btn variant="outline" size="sm" onClick={() => { setSearch(''); setGoal(''); setStatus(''); setPage(1) }}>Clear filters</Btn>}
          />
        ) : (
          <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={loading}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">Customer enquiries</caption>
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-white/45">
                    <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Goal</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Received</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.07]">
                  {rows.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-4 py-3.5">
                        <button type="button" onClick={() => setSelected(row)} className="text-left focus-visible:outline-2 focus-visible:outline-gold">
                          <span className="block font-medium text-bone hover:text-gold">{row.full_name}</span>
                          <span className="block text-xs text-mist">{row.phone}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-mist">{row.fitness_goal}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-mist">{formatDateTime(row.created_at)}</td>
                      <td className="px-4 py-3.5"><EnquiryStatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.count} onPage={setPage} />
          </div>
        )}
      </Card>

      <EnquiryDetail
        enquiry={selected}
        onClose={() => setSelected(null)}
        onSaved={(row) => { setSelected(row); reload() }}
        onDelete={() => setToDelete(selected)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete enquiry?"
        message={toDelete ? `This permanently deletes the enquiry from ${toDelete.full_name}. This cannot be undone.` : ''}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}

function EnquiryDetail({ enquiry, onClose, onSaved, onDelete }) {
  const toast = useToast()
  const [status, setStatus] = useState('new')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (enquiry) {
      setStatus(enquiry.status)
      setNotes(enquiry.admin_notes ?? '')
    }
  }, [enquiry])

  if (!enquiry) return null
  const dirty = status !== enquiry.status || notes.trim() !== (enquiry.admin_notes ?? '')

  const save = async () => {
    setSaving(true)
    try {
      const row = await updateEnquiry(enquiry.id, { status, admin_notes: notes })
      toast.success('Enquiry updated.')
      onSaved(row)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const detail = (label, value) => (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</dt>
      <dd className="mt-1 text-sm text-bone">{value}</dd>
    </div>
  )

  return (
    <Modal
      open
      size="lg"
      title={enquiry.full_name}
      onClose={onClose}
      busy={saving}
      footer={
        <>
          <Btn variant="danger" icon={Trash2} onClick={onDelete} disabled={saving} className="sm:mr-auto">Delete</Btn>
          <Btn variant="outline" onClick={onClose} disabled={saving}>Close</Btn>
          <Btn onClick={save} loading={saving} disabled={!dirty}>Save changes</Btn>
        </>
      }
    >
      <dl className="grid gap-5 sm:grid-cols-2">
        {detail('Phone', <a href={`tel:+91${enquiry.phone}`} className="hover:text-gold">{enquiry.phone}</a>)}
        {detail('Fitness goal', enquiry.fitness_goal)}
        {detail('Received', formatDateTime(enquiry.created_at))}
        {detail('Current status', <EnquiryStatusBadge status={enquiry.status} />)}
        <div className="sm:col-span-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Message</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-bone">
            {enquiry.message || <span className="text-white/40">No message left.</span>}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-3">
        <Btn variant="outline" size="sm" icon={Phone} onClick={() => { window.location.href = `tel:+91${enquiry.phone}` }}>Call</Btn>
        <Btn
          variant="outline"
          size="sm"
          icon={MessageCircle}
          onClick={() => window.open(whatsappHref(`Hi ${enquiry.full_name}, thank you for your enquiry at Gentleman Gym.`, enquiry.phone), '_blank', 'noopener,noreferrer')}
        >
          WhatsApp
        </Btn>
      </div>

      <div className="mt-7 grid gap-5 border-t border-white/10 pt-6">
        <Field label="Status" htmlFor="detail-status">
          <select id="detail-status" value={status} onChange={(e) => setStatus(e.target.value)} className="field field-sm field-select">
            {ENQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Internal notes" htmlFor="detail-notes" hint="Only visible to administrators.">
          <textarea id="detail-notes" rows={4} maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)} className="field field-sm resize-y" placeholder="e.g. Called on Monday, will visit on Saturday" />
        </Field>
      </div>
    </Modal>
  )
}
