import { requireSupabase } from './supabase'
import { ServiceError, unwrap } from '../utils/errors'
import { sanitizeSearch } from './serviceUtils'

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'converted', label: 'Converted' },
  { value: 'not_interested', label: 'Not Interested' },
]

export const statusLabel = (value) =>
  ENQUIRY_STATUSES.find((status) => status.value === value)?.label ?? value

const COLUMNS =
  'id, full_name, phone, fitness_goal, message, status, admin_notes, source, created_at, updated_at'

const SUBMIT_ERRORS = {
  invalid_name: 'Please enter a valid name (2–80 characters).',
  invalid_phone: 'Enter a valid 10-digit Indian mobile number.',
  invalid_goal: 'Please choose a fitness goal.',
  invalid_message: 'Please keep your message under 600 characters.',
  rate_limited:
    'We have received several enquiries from you recently. Please call the gym instead, or try again in a little while.',
}

export class EnquiryError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'EnquiryError'
    this.code = code
  }
}

/** Public: save an enquiry through the validated, rate-limited database function. */
export async function submitEnquiry({ name, phone, goal, message = '', website = '' }) {
  const sb = requireSupabase()
  const { data, error } = await sb.rpc('submit_enquiry', {
    p_full_name: name,
    p_phone: phone,
    p_fitness_goal: goal,
    p_message: message.trim() || null,
    p_website: website,
  })
  if (error) throw new ServiceError(error, 'We could not save your enquiry right now.')
  if (!data?.ok) {
    const code = data?.error ?? 'unknown'
    throw new EnquiryError(code, SUBMIT_ERRORS[code] ?? 'We could not save your enquiry right now.')
  }
  return true
}

/** Admin: paginated, filtered list. Returns { rows, count }. */
export async function listEnquiries({
  page = 1,
  pageSize = 10,
  search = '',
  goal = '',
  status = '',
  sort = 'newest',
} = {}) {
  const sb = requireSupabase()
  let query = sb.from('enquiries').select(COLUMNS, { count: 'exact' })

  if (status) query = query.eq('status', status)
  if (goal) query = query.eq('fitness_goal', goal)

  const term = sanitizeSearch(search)
  if (term) {
    const clauses = [`full_name.ilike.%${term}%`]
    const digits = term.replace(/\D/g, '')
    if (digits.length >= 3) clauses.push(`phone.ilike.%${digits}%`)
    query = query.or(clauses.join(','))
  }

  const from = (page - 1) * pageSize
  query = query
    .order('created_at', { ascending: sort === 'oldest' })
    .order('id', { ascending: true })
    .range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new ServiceError(error, 'Could not load enquiries.')
  return { rows: data ?? [], count: count ?? 0 }
}

export async function updateEnquiry(id, { status, admin_notes }) {
  const sb = requireSupabase()
  const patch = {}
  if (status !== undefined) patch.status = status
  if (admin_notes !== undefined) patch.admin_notes = admin_notes?.trim() ? admin_notes.trim() : null
  return unwrap(
    await sb.from('enquiries').update(patch).eq('id', id).select(COLUMNS).single(),
    'Could not update the enquiry.',
  )
}

export async function deleteEnquiry(id) {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb.from('enquiries').delete().eq('id', id).select('id'),
    'Could not delete the enquiry.',
  )
  if (!rows?.length) throw new Error('The enquiry could not be deleted (it may already be gone).')
}

/** Admin: dashboard numbers straight from the database. */
export async function getEnquiryStats() {
  const sb = requireSupabase()
  return unwrap(await sb.rpc('admin_enquiry_stats'), 'Could not load statistics.')
}
