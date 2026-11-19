const COUNTRY_CODE = '91'

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi Gentleman Gym, I'd like to know more about membership and training options."

export const telHref = (number) => `tel:+${COUNTRY_CODE}${number.replace(/\D/g, '')}`

export const whatsappHref = (
  message = DEFAULT_WHATSAPP_MESSAGE,
  number = '9895979950',
) =>
  `https://wa.me/${COUNTRY_CODE}${number.replace(/\D/g, '')}?text=${encodeURIComponent(
    message,
  )}`

export const directionsHref =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Gentleman Gym, Thellukuzhi, Perumkidavila, Kerala')

/** Normalise Indian mobile input to a 10-digit number, or return null. */
export function normalisePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  const local =
    digits.length === 12 && digits.startsWith(COUNTRY_CODE)
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith('0')
        ? digits.slice(1)
        : digits

  return /^[6-9]\d{9}$/.test(local) ? local : null
}

export function buildEnquiryMessage({ name, phone, goal, message }) {
  const lines = [
    'Hi Gentleman Gym, I would like to enquire about membership.',
    '',
    `Name: ${name.trim()}`,
    `Phone: ${phone.trim()}`,
    `Fitness goal: ${goal}`,
  ]

  if (message.trim()) {
    lines.push('', `Message: ${message.trim()}`)
  }

  return lines.join('\n')
}
