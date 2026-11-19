import { useState } from 'react'
import { FolderCog, Images, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { clearRemoteContentCache } from '../../hooks/useRemoteContent'
import {
  deleteCategory, deleteGalleryImage, listCategories, listGallery, saveCategory,
  updateGalleryImage, uploadGalleryImages,
} from '../../services/galleryService'
import { moveItem, persistOrder } from '../../services/serviceUtils'
import ConfirmDialog from '../components/ConfirmDialog'
import ImagePicker from '../components/ImagePicker'
import Modal from '../components/Modal'
import OrderButtons from '../components/OrderButtons'
import { Badge, Btn, Card, EmptyState, ErrorState, Field, IconBtn, PageHeader, Spinner, Toggle } from '../components/ui'
import useLoader from '../components/useLoader'
import { useToast } from '../components/useToast'

export default function Gallery() {
  const toast = useToast()
  const images = useLoader(listGallery)
  const cats = useLoader(listCategories)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [managing, setManaging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [filter, setFilter] = useState('')

  const all = images.data ?? []
  const categories = cats.data ?? []
  const rows = filter ? all.filter((r) => (filter === 'none' ? !r.category_id : r.category_id === filter)) : all

  const refresh = () => { clearRemoteContentCache(); images.reload() }

  const move = async (visibleIndex, delta) => {
    // Reordering is applied to the full list so display_order stays consistent.
    const item = rows[visibleIndex]
    const target = rows[visibleIndex + delta]
    if (!item || !target) return
    const from = all.findIndex((r) => r.id === item.id)
    const to = all.findIndex((r) => r.id === target.id)
    const next = moveItem(all, from, to - from)
    setReordering(true)
    try {
      await persistOrder('gallery', next)
      images.setData(next.map((row, i) => ({ ...row, display_order: i + 1 })))
      clearRemoteContentCache()
    } catch (err) {
      toast.error(err.message)
      images.reload()
    } finally {
      setReordering(false)
    }
  }

  const toggle = async (row, value) => {
    images.setData((list) => list.map((r) => (r.id === row.id ? { ...r, is_active: value } : r)))
    try {
      await updateGalleryImage(row.id, { title: row.title, description: row.description, categoryId: row.category_id, isActive: value })
      clearRemoteContentCache()
    } catch (err) {
      toast.error(err.message)
      images.reload()
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await deleteGalleryImage(toDelete)
      toast.success('Image deleted.')
      setToDelete(null)
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Images shown in the website gallery, in the order listed here."
        actions={<>
          <Btn variant="outline" icon={FolderCog} onClick={() => setManaging(true)}>Categories</Btn>
          <Btn icon={Upload} onClick={() => setUploading(true)}>Upload images</Btn>
        </>}
      />

      {categories.length > 0 && all.length > 0 && (
        <div className="mb-5 max-w-xs">
          <label htmlFor="gal-filter" className="sr-only">Filter by category</label>
          <select id="gal-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="field field-sm field-select">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="none">Uncategorised</option>
          </select>
        </div>
      )}

      {images.loading && !images.data ? <Card><Spinner /></Card> : images.error && !images.data ? <Card><ErrorState message={images.error} onRetry={images.reload} /></Card> : rows.length === 0 ? (
        <Card><EmptyState icon={Images} title={filter ? 'No images in this category' : 'No images yet'} description="Upload photos to show them on the website." action={<Btn icon={Plus} onClick={() => setUploading(true)}>Upload images</Btn>} /></Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, index) => (
            <li key={row.id}>
              <Card className="flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[4/3] bg-ink">
                  <img src={row.image_url} alt={row.description || row.title} loading="lazy" className="h-full w-full object-cover" />
                  {!row.is_active && <Badge tone="inactive" className="absolute left-2 top-2 bg-ink/90">Hidden</Badge>}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="truncate font-medium text-bone">{row.title}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-gold">{row.category?.name ?? 'Uncategorised'}</p>
                  {row.description && <p className="mt-2 line-clamp-2 text-xs text-mist">{row.description}</p>}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <OrderButtons index={index} total={rows.length} onMove={move} disabled={reordering} />
                    <div className="flex items-center gap-1.5">
                      <Toggle checked={row.is_active} onChange={(v) => toggle(row, v)} label={`Show ${row.title} on website`} />
                      <IconBtn label={`Edit ${row.title}`} icon={Pencil} onClick={() => setEditing(row)} />
                      <IconBtn label={`Delete ${row.title}`} icon={Trash2} variant="danger" onClick={() => setToDelete(row)} />
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {uploading && <UploadForm categories={categories} onClose={() => setUploading(false)} onDone={() => { setUploading(false); refresh() }} />}
      {editing && <EditForm key={editing.id} image={editing} categories={categories} onClose={() => setEditing(null)} onDone={() => { setEditing(null); refresh(); toast.success('Image saved.') }} />}
      {managing && <CategoryManager categories={categories} onClose={() => { setManaging(false); cats.reload(); refresh() }} onChanged={cats.reload} />}

      <ConfirmDialog open={Boolean(toDelete)} title="Delete image?" message={toDelete ? `Delete "${toDelete.title}" from the gallery? The uploaded file is removed too. This cannot be undone.` : ''} busy={busy} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  )
}

function CategorySelect({ id, value, onChange, categories }) {
  return (
    <select id={id} value={value} onChange={onChange} className="field field-sm field-select">
      <option value="">Uncategorised</option>
      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select>
  )
}

function UploadForm({ categories, onClose, onDone }) {
  const toast = useToast()
  const [files, setFiles] = useState([])
  const [imageError, setImageError] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [progress, setProgress] = useState(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (files.length === 0) { setImageError('Choose at least one image.'); return }
    setSaving(true)
    try {
      const created = await uploadGalleryImages({ files, title, description, categoryId, isActive }, (n, total) => setProgress(`${n} of ${total}`))
      toast.success(created.length === 1 ? 'Image uploaded.' : `${created.length} images uploaded.`)
      onDone()
    } catch (err) {
      toast.error(err.message)
      setSaving(false)
      setProgress(null)
    }
  }

  return (
    <Modal open size="lg" title="Upload images" onClose={onClose} busy={saving}
      footer={<><Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn><Btn type="submit" form="upload-form" loading={saving} icon={Upload}>{saving ? `Uploading ${progress ?? ''}` : 'Upload'}</Btn></>}>
      <form id="upload-form" noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ImagePicker multiple files={files} onChange={setFiles} error={imageError} onError={setImageError} />
        </div>
        <Field label="Title" htmlFor="up-title" hint={files.length > 1 ? 'Multiple files: titles come from the file names.' : 'Optional; defaults to the file name.'}>
          <input id="up-title" value={title} maxLength={120} disabled={files.length > 1} onChange={(e) => setTitle(e.target.value)} className="field field-sm" />
        </Field>
        <Field label="Category" htmlFor="up-cat"><CategorySelect id="up-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} categories={categories} /></Field>
        <Field label="Description (used as the image's alt text)" htmlFor="up-desc" className="sm:col-span-2">
          <textarea id="up-desc" rows={2} value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} className="field field-sm resize-y" />
        </Field>
        <div className="flex items-center justify-between gap-4 border border-white/10 p-3.5 sm:col-span-2">
          <p className="text-sm text-bone">Show on website</p>
          <Toggle checked={isActive} onChange={setIsActive} label="Show on website" />
        </div>
      </form>
    </Modal>
  )
}

function EditForm({ image, categories, onClose, onDone }) {
  const toast = useToast()
  const [files, setFiles] = useState([])
  const [imageError, setImageError] = useState(null)
  const [title, setTitle] = useState(image.title)
  const [description, setDescription] = useState(image.description ?? '')
  const [categoryId, setCategoryId] = useState(image.category_id ?? '')
  const [isActive, setIsActive] = useState(image.is_active)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!title.trim()) { setError('Enter a title.'); return }
    if (imageError) return
    setSaving(true)
    try {
      await updateGalleryImage(image.id, { title, description, categoryId, isActive, imageFile: files[0] })
      onDone()
    } catch (err) {
      toast.error(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal open size="lg" title="Edit image" onClose={onClose} busy={saving}
      footer={<><Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn><Btn type="submit" form="edit-image-form" loading={saving}>Save</Btn></>}>
      <form id="edit-image-form" noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><ImagePicker files={files} onChange={setFiles} currentUrl={image.image_url} error={imageError} onError={setImageError} /></div>
        <Field label="Title" htmlFor="ed-title" required error={error}>
          <input id="ed-title" data-autofocus value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} aria-invalid={error ? 'true' : undefined} className="field field-sm" />
        </Field>
        <Field label="Category" htmlFor="ed-cat"><CategorySelect id="ed-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} categories={categories} /></Field>
        <Field label="Description (used as alt text)" htmlFor="ed-desc" className="sm:col-span-2">
          <textarea id="ed-desc" rows={2} value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} className="field field-sm resize-y" />
        </Field>
        <div className="flex items-center justify-between gap-4 border border-white/10 p-3.5 sm:col-span-2">
          <p className="text-sm text-bone">Show on website</p>
          <Toggle checked={isActive} onChange={setIsActive} label="Show on website" />
        </div>
      </form>
    </Modal>
  )
}

function CategoryManager({ categories, onClose, onChanged }) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [renaming, setRenaming] = useState(null) // { id, name }
  const [busy, setBusy] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const run = async (fn, success) => {
    setBusy(true)
    try {
      await fn()
      if (success) toast.success(success)
      onChanged()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const add = (event) => {
    event.preventDefault()
    if (!name.trim()) return
    run(async () => { await saveCategory({ name }); setName('') }, 'Category added.')
  }
  const rename = (event) => {
    event.preventDefault()
    if (!renaming.name.trim()) return
    run(async () => { await saveCategory(renaming); setRenaming(null) }, 'Category renamed.')
  }

  return (
    <Modal open title="Gallery categories" onClose={onClose} busy={busy} footer={<Btn onClick={onClose} disabled={busy}>Done</Btn>}>
      <form onSubmit={add} className="flex gap-3" noValidate>
        <label htmlFor="cat-new" className="sr-only">New category name</label>
        <input id="cat-new" data-autofocus value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="field field-sm" />
        <Btn type="submit" icon={Plus} disabled={busy || !name.trim()}>Add</Btn>
      </form>
      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-mist">No categories yet.</p>
      ) : (
        <ul className="mt-5 divide-y divide-white/10 border border-white/10">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-2 p-3">
              {renaming?.id === c.id ? (
                <form onSubmit={rename} className="flex flex-1 gap-2" noValidate>
                  <label htmlFor={`cat-${c.id}`} className="sr-only">Category name</label>
                  <input id={`cat-${c.id}`} data-autofocus value={renaming.name} maxLength={60} onChange={(e) => setRenaming({ ...renaming, name: e.target.value })} className="field field-sm" />
                  <Btn type="submit" size="sm" disabled={busy}>Save</Btn>
                  <Btn size="sm" variant="outline" onClick={() => setRenaming(null)}>Cancel</Btn>
                </form>
              ) : (
                <>
                  <span className="flex-1 truncate text-sm text-bone">{c.name}</span>
                  <IconBtn label={`Rename ${c.name}`} icon={Pencil} onClick={() => setRenaming({ id: c.id, name: c.name })} />
                  <IconBtn label={`Delete ${c.name}`} icon={Trash2} variant="danger" onClick={() => setToDelete(c)} />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={Boolean(toDelete)} title="Delete category?" message={toDelete ? `Delete "${toDelete.name}"? Images in it become uncategorised; they are not deleted.` : ''} busy={busy} confirmLabel="Delete"
        onConfirm={() => run(async () => { await deleteCategory(toDelete.id); setToDelete(null) }, 'Category deleted.')} onCancel={() => setToDelete(null)} />
    </Modal>
  )
}
