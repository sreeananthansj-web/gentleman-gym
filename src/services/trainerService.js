import { requireSupabase } from './supabase'
import { unwrap } from '../utils/errors'
import { nextDisplayOrder } from './serviceUtils'
import { BUCKETS, removeImage, uploadImage } from './storageService'

const COLUMNS =
  'id, name, title, description, image_url, image_path, image_alt, display_order, is_active, created_at'

/** Public site: active trainers in display order, shaped like the static data in data/site.js. */
export async function listPublicTrainers() {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb
      .from('trainers')
      .select(COLUMNS)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  )
  return (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    title: row.title,
    description: row.description,
    image: row.image_url,
    alt: row.image_alt || `${row.name}, ${row.title} at Gentleman Gym`,
  }))
}

export async function listTrainers() {
  const sb = requireSupabase()
  return (
    unwrap(
      await sb.from('trainers').select(COLUMNS).order('display_order', { ascending: true }),
      'Could not load trainers.',
    ) ?? []
  )
}

/** `imageFile` is optional; when given it is uploaded and replaces the previous storage image. */
export async function saveTrainer({ id, imageFile, ...values }) {
  const sb = requireSupabase()
  const payload = {
    name: values.name.trim(),
    title: values.title.trim(),
    description: values.description.trim(),
    image_alt: values.image_alt?.trim() || null,
    is_active: Boolean(values.is_active),
  }

  let uploaded = null
  if (imageFile) {
    uploaded = await uploadImage(BUCKETS.trainers, imageFile)
    payload.image_url = uploaded.url
    payload.image_path = uploaded.path
  }

  try {
    if (id) {
      const previous = unwrap(
        await sb.from('trainers').select('image_path').eq('id', id).maybeSingle(),
      )
      const saved = unwrap(
        await sb.from('trainers').update(payload).eq('id', id).select(COLUMNS).single(),
        'Could not save the trainer.',
      )
      if (uploaded && previous?.image_path) await removeImage(BUCKETS.trainers, previous.image_path)
      return saved
    }
    payload.display_order = await nextDisplayOrder('trainers')
    return unwrap(
      await sb.from('trainers').insert(payload).select(COLUMNS).single(),
      'Could not add the trainer.',
    )
  } catch (error) {
    if (uploaded) await removeImage(BUCKETS.trainers, uploaded.path)
    throw error
  }
}

export async function deleteTrainer(trainer) {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb.from('trainers').delete().eq('id', trainer.id).select('id'),
    'Could not delete the trainer.',
  )
  if (!rows?.length) throw new Error('The trainer could not be deleted.')
  await removeImage(BUCKETS.trainers, trainer.image_path)
}

export async function setTrainerActive(id, isActive) {
  const sb = requireSupabase()
  unwrap(await sb.from('trainers').update({ is_active: isActive }).eq('id', id).select('id').single())
}
