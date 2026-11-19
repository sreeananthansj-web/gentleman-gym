import { requireSupabase } from './supabase'
import { unwrap } from '../utils/errors'
import { formatDuration, formatPrice } from '../utils/format'
import { nextDisplayOrder } from './serviceUtils'

export const DURATION_UNITS = [
  { value: 'day', label: 'Day(s)' },
  { value: 'week', label: 'Week(s)' },
  { value: 'month', label: 'Month(s)' },
  { value: 'year', label: 'Year(s)' },
]

const COLUMNS =
  'id, name, description, price, currency, duration_value, duration_unit, features, is_featured, is_active, display_order, created_at'

/** Public site: active plans. `priceLabel` is null when the gym has not published a price. */
export async function listPublicPlans() {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb
      .from('membership_plans')
      .select(COLUMNS)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  )
  return (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    priceLabel: formatPrice(row.price, row.currency),
    duration: formatDuration(row.duration_value, row.duration_unit),
    features: row.features ?? [],
    featured: row.is_featured,
  }))
}

export async function listPlans() {
  const sb = requireSupabase()
  return (
    unwrap(
      await sb.from('membership_plans').select(COLUMNS).order('display_order', { ascending: true }),
      'Could not load membership plans.',
    ) ?? []
  )
}

export async function savePlan({ id, ...values }) {
  const sb = requireSupabase()
  const price = values.price === '' || values.price === null || values.price === undefined ? null : Number(values.price)
  const payload = {
    name: values.name.trim(),
    description: values.description.trim(),
    price,
    currency: 'INR',
    duration_value: Number(values.duration_value),
    duration_unit: values.duration_unit,
    features: values.features
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 20),
    is_featured: Boolean(values.is_featured),
    is_active: Boolean(values.is_active),
  }
  if (id) {
    return unwrap(
      await sb.from('membership_plans').update(payload).eq('id', id).select(COLUMNS).single(),
      'Could not save the plan.',
    )
  }
  payload.display_order = await nextDisplayOrder('membership_plans')
  return unwrap(
    await sb.from('membership_plans').insert(payload).select(COLUMNS).single(),
    'Could not add the plan.',
  )
}

export async function setPlanActive(id, isActive) {
  const sb = requireSupabase()
  unwrap(await sb.from('membership_plans').update({ is_active: isActive }).eq('id', id).select('id').single())
}

export async function deletePlan(id) {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb.from('membership_plans').delete().eq('id', id).select('id'),
    'Could not delete the plan.',
  )
  if (!rows?.length) throw new Error('The plan could not be deleted.')
}
