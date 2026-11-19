import { requireSupabase } from './supabase'
import { unwrap } from '../utils/errors'
import { nextDisplayOrder } from './serviceUtils'

const COLUMNS = 'id, question, answer, display_order, is_active, created_at'

/** Public site: active FAQs shaped like the static list ({ q, a }). */
export async function listPublicFaqs() {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb.from('faqs').select(COLUMNS).eq('is_active', true).order('display_order', { ascending: true }),
  )
  return (rows ?? []).map((row) => ({ id: row.id, q: row.question, a: row.answer }))
}

export async function listFaqs() {
  const sb = requireSupabase()
  return (
    unwrap(
      await sb.from('faqs').select(COLUMNS).order('display_order', { ascending: true }),
      'Could not load FAQs.',
    ) ?? []
  )
}

export async function saveFaq({ id, question, answer, is_active }) {
  const sb = requireSupabase()
  const payload = { question: question.trim(), answer: answer.trim(), is_active: Boolean(is_active) }
  if (id) {
    return unwrap(
      await sb.from('faqs').update(payload).eq('id', id).select(COLUMNS).single(),
      'Could not save the FAQ.',
    )
  }
  payload.display_order = await nextDisplayOrder('faqs')
  return unwrap(await sb.from('faqs').insert(payload).select(COLUMNS).single(), 'Could not add the FAQ.')
}

export async function setFaqActive(id, isActive) {
  const sb = requireSupabase()
  unwrap(await sb.from('faqs').update({ is_active: isActive }).eq('id', id).select('id').single())
}

export async function deleteFaq(id) {
  const sb = requireSupabase()
  const rows = unwrap(await sb.from('faqs').delete().eq('id', id).select('id'), 'Could not delete the FAQ.')
  if (!rows?.length) throw new Error('The FAQ could not be deleted.')
}
