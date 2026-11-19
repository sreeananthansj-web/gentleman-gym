import { requireSupabase } from './supabase'
import { ServiceError } from '../utils/errors'

export async function signInWithPassword(email, password) {
  const sb = requireSupabase()
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
  if (error) {
    // Deliberately vague: never reveal whether the email exists.
    if (error.status === 429 || /rate limit/i.test(error.message)) {
      throw new Error('Too many attempts. Please wait a few minutes and try again.')
    }
    if (/failed to fetch|network/i.test(error.message)) {
      throw new ServiceError(error)
    }
    throw new Error('Invalid email or password.')
  }
  return data
}

export async function signOut() {
  const sb = requireSupabase()
  const { error } = await sb.auth.signOut()
  if (error) throw new ServiceError(error, 'Could not sign out.')
}

export async function getSession() {
  const sb = requireSupabase()
  const { data, error } = await sb.auth.getSession()
  if (error) throw new ServiceError(error)
  return data.session
}

export function onAuthChange(callback) {
  const sb = requireSupabase()
  const { data } = sb.auth.onAuthStateChange((event, session) => callback(event, session))
  return () => data.subscription.unsubscribe()
}

/** Admin row for the signed-in user (RLS only ever returns the caller's own row, or all rows for super admins). */
export async function getAdminProfile(userId) {
  const sb = requireSupabase()
  const { data, error } = await sb
    .from('admin_profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new ServiceError(error)
  return data && data.is_active ? data : null
}

export async function listAdmins() {
  const sb = requireSupabase()
  const { data, error } = await sb
    .from('admin_profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: true })
  if (error) throw new ServiceError(error)
  return data ?? []
}

/** Re-checks the current password, then sets the new one. */
export async function changePassword(email, currentPassword, newPassword) {
  const sb = requireSupabase()
  const check = await sb.auth.signInWithPassword({ email, password: currentPassword })
  if (check.error) throw new Error('Your current password is not correct.')
  const { error } = await sb.auth.updateUser({ password: newPassword })
  if (error) throw new ServiceError(error, 'Could not change the password.')
}
