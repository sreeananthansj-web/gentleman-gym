import { requireSupabase } from './supabase'
import { unwrap } from '../utils/errors'

/** Next free display_order value for a table (max + 1). */
export async function nextDisplayOrder(table) {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb.from(table).select('display_order').order('display_order', { ascending: false }).limit(1),
  )
  return (rows?.[0]?.display_order ?? 0) + 1
}

/**
 * Persist a new ordering. `rows` is the full list in its new visual order;
 * only rows whose position changed are written.
 */
export async function persistOrder(table, rows) {
  const sb = requireSupabase()
  const changes = rows
    .map((row, index) => ({ id: row.id, order: index + 1, current: row.display_order }))
    .filter((item) => item.current !== item.order)

  const results = await Promise.all(
    changes.map((item) => sb.from(table).update({ display_order: item.order }).eq('id', item.id)),
  )
  const failed = results.find((result) => result.error)
  if (failed) unwrap(failed)
}

/** Return a copy of `rows` with the item at `index` moved by `delta` (-1 up, +1 down). */
export function moveItem(rows, index, delta) {
  const target = index + delta
  if (target < 0 || target >= rows.length) return rows
  const next = [...rows]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

/** Escape user text for use inside a PostgREST `or()` ilike filter. */
export function sanitizeSearch(value) {
  return String(value ?? '')
    .replace(/[,()"'\\%_*:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
}
