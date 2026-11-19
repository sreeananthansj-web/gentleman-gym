const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date)
}

export function formatPrice(price, currency = 'INR') {
  if (price === null || price === undefined || price === '') return null
  const amount = Number(price)
  if (Number.isNaN(amount)) return null
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

export function formatDuration(value, unit) {
  if (!value || !unit) return ''
  return `${value} ${unit}${Number(value) === 1 ? '' : 's'}`
}

/** yyyy-mm-dd in the browser's local time (used for <input type="date"> values). */
export function toDateInput(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function addDuration(startIso, value, unit) {
  const date = new Date(`${startIso}T00:00:00`)
  const n = Number(value) || 0
  if (unit === 'day') date.setDate(date.getDate() + n)
  else if (unit === 'week') date.setDate(date.getDate() + n * 7)
  else if (unit === 'year') date.setFullYear(date.getFullYear() + n)
  else date.setMonth(date.getMonth() + n)
  return toDateInput(date)
}

export function monthLabel(yyyyMm) {
  const [year, month] = yyyyMm.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'short' })
}
