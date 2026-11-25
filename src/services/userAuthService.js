import { normalisePhone } from '../lib/links'
import { ServiceError, unwrap } from '../utils/errors'
import { requireSupabase } from './supabase'

const PROFILE_COLUMNS = 'id, full_name, email, phone, role, created_at, updated_at'

export const USER_PASSWORD_MIN_LENGTH = 8

/** Validate email format. */
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())
}

/** Normalise Indian 10-digit mobile or international +phone (7-15 digits); returns null if invalid. */
export function normaliseUserPhone(value) {
  const indian = normalisePhone(value)
  if (indian) return indian

  const cleaned = String(value ?? '').trim().replace(/[\s\-().]/g, '')
  if (/^\+[1-9]\d{6,14}$/.test(cleaned)) return cleaned
  return null
}

function mapAuthError(error, fallback) {
  const msg = String(error?.message ?? '')
  if (error?.status === 429 || /rate limit|too many requests/i.test(msg)) {
    return new Error('Too many attempts. Please wait a few minutes and try again.')
  }
  if (/failed to fetch|network|load failed/i.test(msg)) {
    return new ServiceError(error)
  }
  if (/already registered|user already exists/i.test(msg)) {
    return new Error('An account with this email already exists. Try signing in instead.')
  }
  if (/email not confirmed/i.test(msg)) {
    return new Error('Please confirm your email address using the link we sent before signing in.')
  }
  if (/invalid login credentials/i.test(msg)) {
    return new Error('Invalid email or password.')
  }
  if (/same_password|should be different/i.test(msg)) {
    return new Error('Your new password must be different from your current password.')
  }
  if (/weak_password|at least/i.test(msg)) {
    return new Error(`Password must be at least ${USER_PASSWORD_MIN_LENGTH} characters.`)
  }
  return new ServiceError(error, fallback)
}

/** Check whether the signed-in user belongs to admin_profiles (RLS only returns own row). */
export async function hasAdminProfile(userId) {
  const sb = requireSupabase()
  const { data, error } = await sb
    .from('admin_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  if (error) return false
  return Boolean(data?.id)
}

/** Fetch the signed-in member's profile from user_profiles. */
export async function getUserProfile(userId) {
  const sb = requireSupabase()
  const { data, error } = await sb
    .from('user_profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new ServiceError(error, 'Could not load your profile.')
  return data ?? null
}

/** Read profile, or create it once from signup metadata if the trigger was not installed yet. */
export async function ensureUserProfile(user, fallbackFields = {}) {
  if (!user?.id) return null
  const existing = await getUserProfile(user.id)
  if (existing) return existing

  // Never create a member profile for an administrator account.
  if (await hasAdminProfile(user.id)) return null

  const meta = user.user_metadata ?? {}
  const fullName = String(fallbackFields.fullName ?? meta.full_name ?? '').trim()
  const rawPhone = fallbackFields.phone ?? meta.phone ?? ''
  const phone = normaliseUserPhone(rawPhone)
  const email = String(user.email ?? fallbackFields.email ?? '').trim()

  if (fullName.length < 2 || !phone || !email) return null

  const sb = requireSupabase()
  const { data, error } = await sb
    .from('user_profiles')
    .insert({
      id: user.id,
      full_name: fullName.slice(0, 80),
      email,
      phone,
    })
    .select(PROFILE_COLUMNS)
    .single()

  if (error) {
    // Handle race with auth trigger cleanly.
    if (error.code === '23505') return getUserProfile(user.id)
    throw new ServiceError(error, 'Could not save your profile.')
  }
  return data
}

export async function registerUser({ fullName, email, phone, password }) {
  const cleanName = fullName.trim()
  const cleanEmail = email.trim()
  const cleanPhone = normaliseUserPhone(phone)
  if (cleanName.length < 2 || cleanName.length > 80) {
    throw new Error('Enter your full name (2–80 characters).')
  }
  if (!isValidEmail(cleanEmail)) {
    throw new Error('Enter a valid email address.')
  }
  if (!cleanPhone) {
    throw new Error('Enter a valid 10-digit Indian mobile number (or include country code).')
  }
  if (String(password ?? '').length < USER_PASSWORD_MIN_LENGTH) {
    throw new Error(`Use at least ${USER_PASSWORD_MIN_LENGTH} characters for your password.`)
  }

  const sb = requireSupabase()
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined

  const { data, error } = await sb.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: cleanName,
        phone: cleanPhone,
        signup_source: 'public_website',
      },
    },
  })

  if (error) throw mapAuthError(error, 'Could not create your account.')

  // Supabase returns an empty identities array when email confirmation is on and email already exists.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Try signing in or resetting your password.')
  }

  if (data.session && data.user) {
    await ensureUserProfile(data.user, {
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
    })
  }

  return {
    user: data.user,
    session: data.session,
    needsEmailConfirmation: !data.session,
  }
}

export async function signInUser(email, password) {
  const sb = requireSupabase()
  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw mapAuthError(error, 'Could not sign in.')

  if (await hasAdminProfile(data.user.id)) {
    await sb.auth.signOut().catch(() => {})
    throw new Error('Administrator accounts must sign in on the Admin Login page.')
  }

  const profile = await ensureUserProfile(data.user)
  if (!profile) {
    await sb.auth.signOut().catch(() => {})
    throw new Error('Your member profile could not be loaded. Please contact the gym.')
  }

  return { session: data.session, profile }
}

export async function signOutUser() {
  const sb = requireSupabase()
  const { error } = await sb.auth.signOut()
  if (error) throw new ServiceError(error, 'Could not sign out.')
}

export async function getUserSession() {
  const sb = requireSupabase()
  const { data, error } = await sb.auth.getSession()
  if (error) throw new ServiceError(error)
  return data.session
}

export function onUserAuthChange(callback) {
  const sb = requireSupabase()
  const { data } = sb.auth.onAuthStateChange((event, session) => callback(event, session))
  return () => data.subscription.unsubscribe()
}

export async function sendPasswordReset(email) {
  const cleanEmail = email.trim()
  if (!isValidEmail(cleanEmail)) {
    throw new Error('Enter a valid email address.')
  }
  const sb = requireSupabase()
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
  const { error } = await sb.auth.resetPasswordForEmail(cleanEmail, { redirectTo })
  if (error) throw mapAuthError(error, 'Could not send the password reset link.')
}

export async function resetPasswordWithRecovery(newPassword) {
  if (String(newPassword ?? '').length < USER_PASSWORD_MIN_LENGTH) {
    throw new Error(`Use at least ${USER_PASSWORD_MIN_LENGTH} characters for your new password.`)
  }
  const sb = requireSupabase()
  const { error } = await sb.auth.updateUser({ password: newPassword })
  if (error) throw mapAuthError(error, 'Could not reset your password.')
}

export async function changeUserPassword(email, currentPassword, newPassword) {
  if (String(newPassword ?? '').length < USER_PASSWORD_MIN_LENGTH) {
    throw new Error(`Use at least ${USER_PASSWORD_MIN_LENGTH} characters for your new password.`)
  }
  const sb = requireSupabase()
  const check = await sb.auth.signInWithPassword({ email, password: currentPassword })
  if (check.error) throw new Error('Your current password is not correct.')

  const { error } = await sb.auth.updateUser({ password: newPassword })
  if (error) throw mapAuthError(error, 'Could not update your password.')
}

export async function updateUserProfile(userId, { fullName, phone }) {
  const cleanName = fullName.trim()
  const cleanPhone = normaliseUserPhone(phone)
  if (cleanName.length < 2 || cleanName.length > 80) {
    throw new Error('Enter your full name (2–80 characters).')
  }
  if (!cleanPhone) {
    throw new Error('Enter a valid 10-digit Indian mobile number (or include country code).')
  }

  const sb = requireSupabase()
  return unwrap(
    await sb
      .from('user_profiles')
      .update({ full_name: cleanName, phone: cleanPhone })
      .eq('id', userId)
      .select(PROFILE_COLUMNS)
      .single(),
    'Could not update your profile.',
  )
}
