import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured } from '../../services/supabase'
import {
  getAdminProfile,
  getSession,
  onAuthChange,
  signInWithPassword,
  signOut as signOutService,
} from '../../services/authService'
import { friendlyError } from '../../utils/errors'
import { AuthContext } from './AuthContext'

/**
 * status:
 *  loading      checking for a stored session
 *  unconfigured Supabase env vars are missing
 *  signedOut    no session (reason: 'unauthorized' when a non-admin tried to sign in)
 *  ready        signed in AND present in admin_profiles
 *  error        could not verify admin rights (network / database problem)
 */
export default function AuthProvider({ children }) {
  const [state, setState] = useState(
    isSupabaseConfigured ? { status: 'loading' } : { status: 'unconfigured' },
  )
  const profileRef = useRef(null)
  const reasonRef = useRef(null)
  const pendingLogin = useRef(null)


  const resolve = useCallback(async (session) => {
    try {
      await resolveInner(session)
    } finally {
      pendingLogin.current?.()
      pendingLogin.current = null
    }
  }, [])

  const resolveInner = useCallback(async (session) => {
    if (!session) {
      profileRef.current = null
      setState({ status: 'signedOut', reason: reasonRef.current })
      return
    }
    try {
      const profile = await getAdminProfile(session.user.id)
      if (!profile) {
        // Authenticated but not an administrator: never grant access.
        reasonRef.current = 'unauthorized'
        profileRef.current = null
        await signOutService().catch(() => {})
        setState({ status: 'signedOut', reason: 'unauthorized' })
        return
      }
      profileRef.current = profile
      reasonRef.current = null
      setState({ status: 'ready', session, profile })
    } catch (error) {
      setState({ status: 'error', message: friendlyError(error) })
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true

    getSession()
      .then((session) => active && resolve(session))
      .catch((error) => active && setState({ status: 'error', message: friendlyError(error) }))

    const unsubscribe = onAuthChange((event, session) => {
      if (!active || event === 'INITIAL_SESSION') return
      if (event === 'SIGNED_OUT') {
        profileRef.current = null
        setState({ status: 'signedOut', reason: reasonRef.current })
        return
      }
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setState((current) => (current.status === 'ready' ? { ...current, session } : current))
        return
      }
      if (event === 'SIGNED_IN') {
        // supabase-js re-emits SIGNED_IN when a tab regains focus; ignore if nothing changed.
        if (profileRef.current && session?.user?.id === profileRef.current.id) return
        // Do not await Supabase calls inside this callback.
        window.setTimeout(() => active && resolve(session), 0)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [resolve])

  const login = useCallback(async (email, password) => {
    reasonRef.current = null
    // Resolves once the admin check that follows sign-in has finished (success or not).
    const settled = new Promise((resolveLogin) => {
      pendingLogin.current = resolveLogin
      window.setTimeout(resolveLogin, 10000)
    })
    try {
      await signInWithPassword(email, password)
    } catch (error) {
      pendingLogin.current = null
      throw error
    }
    await settled
  }, [])

  const logout = useCallback(async () => {
    reasonRef.current = null
    await signOutService()
    profileRef.current = null
    setState({ status: 'signedOut', reason: null })
  }, [])

  const retry = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      await resolve(await getSession())
    } catch (error) {
      setState({ status: 'error', message: friendlyError(error) })
    }
  }, [resolve])

  const value = useMemo(() => ({ ...state, login, logout, retry }), [state, login, logout, retry])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
