import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/** True when the key is a privileged one that must never ship in browser code. */
function looksLikeSecretKey(key) {
  if (key.startsWith('sb_secret_')) return true
  const parts = key.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload?.role === 'service_role'
  } catch {
    return false
  }
}

const keyIsUnsafe = anonKey !== '' && looksLikeSecretKey(anonKey)

if (keyIsUnsafe) {
  // Refuse to start rather than leak a privileged key into the browser bundle.
  console.error(
    '[Gentleman Gym] VITE_SUPABASE_ANON_KEY contains a service_role / secret key. ' +
      'Use the public anon (publishable) key instead and rotate the exposed key.',
  )
}

export const isSupabaseConfigured =
  !keyIsUnsafe && /^https?:\/\//.test(url) && anonKey.length > 20

export const supabaseUrl = url

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null

/** Returns the client or throws a readable error when env vars are missing. */
export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    )
  }
  return supabase
}
