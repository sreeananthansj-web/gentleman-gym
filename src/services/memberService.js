import { requireSupabase } from './supabase'
import { ServiceError, unwrap } from '../utils/errors'
import { sanitizeSearch } from './serviceUtils'
import { toDateInput } from '../utils/format'

export const MEMBER_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'none', label: 'No membership' },
]

const COLUMNS =
  'id, full_name, phone, email, joined_on, membership_status, current_plan_id, membership_start, membership_end, notes, created_at, plan:membership_plans(id, name)'

/** A stored "active" membership whose end date has passed is shown as expired. */
export function effectiveStatus(member) {
  if (member.membership_status === 'active' && member.membership_end && member.membership_end < toDateInput()) {
    return 'expired'
  }
  return member.membership_status
}

export async function listMembers({ page = 1, pageSize = 10, search = '', status = '' } = {}) {
  const sb = requireSupabase()
  const today = toDateInput()
  let query = sb.from('members').select(COLUMNS, { count: 'exact' })

  if (status === 'active') {
    query = query.eq('membership_status', 'active').or(`membership_end.is.null,membership_end.gte.${today}`)
  } else if (status === 'expired') {
    query = query.or(
      `membership_status.eq.expired,and(membership_status.eq.active,membership_end.lt.${today})`,
    )
  } else if (status) {
    query = query.eq('membership_status', status)
  }

  const term = sanitizeSearch(search)
  if (term) {
    const clauses = [`full_name.ilike.%${term}%`, `email.ilike.%${term}%`]
    const digits = term.replace(/\D/g, '')
    if (digits.length >= 3) clauses.push(`phone.ilike.%${digits}%`)
    query = query.or(clauses.join(','))
  }

  const from = (page - 1) * pageSize
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(from, from + pageSize - 1)
  if (error) throw new ServiceError(error, 'Could not load members.')
  return { rows: data ?? [], count: count ?? 0 }
}

export async function saveMember({ id, ...values }) {
  const sb = requireSupabase()
  const payload = {
    full_name: values.full_name.trim(),
    phone: values.phone.replace(/[^\d+]/g, ''),
    email: values.email?.trim() || null,
    joined_on: values.joined_on || toDateInput(),
    membership_status: values.membership_status,
    notes: values.notes?.trim() || null,
  }
  if (id) {
    return unwrap(
      await sb.from('members').update(payload).eq('id', id).select(COLUMNS).single(),
      'Could not save the member.',
    )
  }
  return unwrap(await sb.from('members').insert(payload).select(COLUMNS).single(), 'Could not add the member.')
}

export async function deleteMember(id) {
  const sb = requireSupabase()
  const rows = unwrap(await sb.from('members').delete().eq('id', id).select('id'), 'Could not delete the member.')
  if (!rows?.length) throw new Error('The member could not be deleted.')
}

export async function listMemberHistory(memberId) {
  const sb = requireSupabase()
  return (
    unwrap(
      await sb
        .from('member_memberships')
        .select('id, plan_id, plan_name, start_date, end_date, status, notes, created_at')
        .eq('member_id', memberId)
        .order('start_date', { ascending: false }),
      'Could not load membership history.',
    ) ?? []
  )
}

export async function addMembershipPeriod({ memberId, planId, planName, startDate, endDate, notes }) {
  const sb = requireSupabase()
  const { error } = await sb.rpc('add_member_membership', {
    p_member_id: memberId,
    p_plan_id: planId || null,
    p_plan_name: planName || null,
    p_start: startDate,
    p_end: endDate,
    p_notes: notes || null,
  })
  if (error) {
    if (/plan_required/.test(error.message)) throw new Error('Choose a plan or type a plan name.')
    if (/invalid_dates/.test(error.message)) throw new Error('The end date must be on or after the start date.')
    throw new ServiceError(error, 'Could not add the membership.')
  }
}

export async function setMembershipStatus(memberId, status) {
  const sb = requireSupabase()
  unwrap(
    await sb.from('members').update({ membership_status: status }).eq('id', memberId).select('id').single(),
    'Could not update the membership status.',
  )
}
