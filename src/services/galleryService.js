import { requireSupabase } from './supabase'
import { unwrap } from '../utils/errors'
import { nextDisplayOrder } from './serviceUtils'
import { BUCKETS, removeImage, uploadImage } from './storageService'

const COLUMNS =
  'id, title, description, image_url, image_path, category_id, display_order, is_active, created_at, category:gallery_categories(id, name)'

/** Public site: active images in display order, shaped like the static data in data/site.js. */
export async function listPublicGallery() {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb
      .from('gallery')
      .select(COLUMNS)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  )
  return (rows ?? []).map((row) => ({
    id: row.id,
    image: row.image_url,
    alt: row.description || row.title,
    title: row.title,
    category: row.category?.name ?? '',
  }))
}

export async function listGallery() {
  const sb = requireSupabase()
  return (
    unwrap(
      await sb.from('gallery').select(COLUMNS).order('display_order', { ascending: true }),
      'Could not load gallery images.',
    ) ?? []
  )
}

export async function listCategories() {
  const sb = requireSupabase()
  return (
    unwrap(
      await sb
        .from('gallery_categories')
        .select('id, name, display_order')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true }),
      'Could not load categories.',
    ) ?? []
  )
}

/** Upload one or more new images. Returns the created rows. */
export async function uploadGalleryImages({ files, title, description, categoryId, isActive = true }, onProgress) {
  const sb = requireSupabase()
  const created = []
  let order = await nextDisplayOrder('gallery')

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    onProgress?.(index + 1, files.length)
    const uploaded = await uploadImage(BUCKETS.gallery, file)
    const fallbackTitle = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Gallery image'
    try {
      const row = unwrap(
        await sb
          .from('gallery')
          .insert({
            title: (files.length === 1 && title?.trim() ? title.trim() : fallbackTitle).slice(0, 120),
            description: description?.trim() || null,
            image_url: uploaded.url,
            image_path: uploaded.path,
            category_id: categoryId || null,
            display_order: order,
            is_active: isActive,
          })
          .select(COLUMNS)
          .single(),
        'Could not save the image details.',
      )
      created.push(row)
      order += 1
    } catch (error) {
      await removeImage(BUCKETS.gallery, uploaded.path)
      throw error
    }
  }
  return created
}

/** Edit details; `imageFile` optionally replaces the picture. */
export async function updateGalleryImage(id, { title, description, categoryId, isActive, imageFile }) {
  const sb = requireSupabase()
  const payload = {
    title: title.trim(),
    description: description?.trim() || null,
    category_id: categoryId || null,
    is_active: Boolean(isActive),
  }
  let uploaded = null
  if (imageFile) {
    uploaded = await uploadImage(BUCKETS.gallery, imageFile)
    payload.image_url = uploaded.url
    payload.image_path = uploaded.path
  }
  try {
    const previous = unwrap(await sb.from('gallery').select('image_path').eq('id', id).maybeSingle())
    const saved = unwrap(
      await sb.from('gallery').update(payload).eq('id', id).select(COLUMNS).single(),
      'Could not save the image.',
    )
    if (uploaded && previous?.image_path) await removeImage(BUCKETS.gallery, previous.image_path)
    return saved
  } catch (error) {
    if (uploaded) await removeImage(BUCKETS.gallery, uploaded.path)
    throw error
  }
}

export async function deleteGalleryImage(item) {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb.from('gallery').delete().eq('id', item.id).select('id'),
    'Could not delete the image.',
  )
  if (!rows?.length) throw new Error('The image could not be deleted.')
  await removeImage(BUCKETS.gallery, item.image_path)
}

export async function saveCategory({ id, name }) {
  const sb = requireSupabase()
  const clean = name.trim()
  if (id) {
    return unwrap(
      await sb.from('gallery_categories').update({ name: clean }).eq('id', id).select('id, name, display_order').single(),
      'Could not rename the category.',
    )
  }
  return unwrap(
    await sb
      .from('gallery_categories')
      .insert({ name: clean, display_order: await nextDisplayOrder('gallery_categories') })
      .select('id, name, display_order')
      .single(),
    'Could not add the category.',
  )
}

export async function deleteCategory(id) {
  const sb = requireSupabase()
  const rows = unwrap(
    await sb.from('gallery_categories').delete().eq('id', id).select('id'),
    'Could not delete the category.',
  )
  if (!rows?.length) throw new Error('The category could not be deleted.')
}
