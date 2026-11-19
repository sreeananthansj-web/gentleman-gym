import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '../services/supabase'

const CACHE_MS = 60_000
const cache = new Map()

function load(key, fetcher) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.promise
  const promise = fetcher()
  cache.set(key, { at: Date.now(), promise })
  // Never cache failures, so the next visit retries.
  promise.catch(() => cache.delete(key))
  return promise
}

/** Forget cached public content (called by the admin panel after edits). */
export function clearRemoteContentCache() {
  cache.clear()
}

/**
 * Loads public website content from Supabase.
 *
 * status:
 *  - 'loading'  request in flight
 *  - 'ready'    loaded; `items` may legitimately be empty (admin removed everything)
 *  - 'fallback' Supabase is not configured, or the request failed; `items` is the built-in content
 *               so the website never ends up blank
 */
export default function useRemoteContent(key, fetcher, fallback) {
  const [state, setState] = useState(() =>
    isSupabaseConfigured
      ? { status: 'loading', items: [] }
      : { status: 'fallback', items: fallback },
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let cancelled = false
    load(key, fetcher)
      .then((items) => {
        if (!cancelled) setState({ status: 'ready', items })
      })
      .catch((error) => {
        console.warn(`[Gentleman Gym] Could not load "${key}" from Supabase, using built-in content.`, error)
        if (!cancelled) setState({ status: 'fallback', items: fallback })
      })
    return () => {
      cancelled = true
    }
  }, [key, fetcher, fallback])

  return state
}
