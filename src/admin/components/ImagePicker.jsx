import { useEffect, useId, useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { ALLOWED_IMAGE_TYPES, validateImageFile } from '../../services/storageService'

/**
 * File input with live preview and client-side validation (type + 5 MB).
 * `value` is the chosen File(s); `currentUrl` shows the existing image when editing.
 */
export default function ImagePicker({ multiple = false, files, onChange, currentUrl, error, onError }) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  const handle = (event) => {
    const picked = [...(event.target.files ?? [])]
    if (picked.length === 0) return
    const problem = picked.map(validateImageFile).find(Boolean)
    if (problem) {
      onError?.(problem)
      onChange([])
      event.target.value = ''
      return
    }
    onError?.(null)
    onChange(multiple ? picked : picked.slice(0, 1))
  }

  const shown = previews.length > 0 ? previews : currentUrl ? [currentUrl] : []

  return (
    <div>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-[#0b0b0b] px-4 py-6 text-center transition-colors hover:border-gold/60 focus-within:border-gold"
      >
        <ImagePlus className="size-6 text-gold" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-sm text-bone">{multiple ? 'Choose images' : currentUrl ? 'Replace image' : 'Choose an image'}</span>
        <span className="text-[11px] text-white/45">JPEG, PNG or WebP · up to 5 MB each</span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple={multiple}
          accept={Object.keys(ALLOWED_IMAGE_TYPES).join(',')}
          onChange={handle}
          className="sr-only"
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
      </label>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-[11px] text-[#e89a8b]">
          {error}
        </p>
      )}
      {shown.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {shown.map((url, index) => (
            <li key={url} className="aspect-square overflow-hidden border border-white/10 bg-ink">
              <img src={url} alt={files[index]?.name ?? 'Current image'} className="h-full w-full object-cover" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
