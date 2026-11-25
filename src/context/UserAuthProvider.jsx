import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured } from '../services/supabase'
import {
  ensureUserProfile,
  getUserSession,
  hasAdminProfile,
  onUserAuthChange,
  registerUser as registerUserService,
  signInUser as signInUserService,
  signOutUser as signOutUserService,
  updateUserProfile as updateUserProfileService,
} from '../services/userAuthService'
import { friendlyError } from '../utils/errors'
import { UserAuthContext } from './UserAuthContext'

/**
 * status:
 *  loading       checking for a stored session
 *  unconfigured  Supabase env vars are missing
 *  signedOut     no active member session
 *  ready         signed in as a member with a user_profiles row
 *  error         could not verify session (network / missing migration)
 */
export default function UserAuthProvider({ children }) {
  const [state, setState] = useState(() =>
    isSupabaseConfigured ? { status: 'loading' } : { status: 'unconfigured' },
  )
  const [recoveryMode, setRecoveryMode] = useState(false)
  const profileRef = useRef(null)

  const resolveSession = useCallback(async (session) => {
    if (!session) {
      profileRef.current = null
      setState({ status: 'signedOut' })
      return
    }

    try {
      // Do not treat an admin session as a normal user session on public pages,
      // and do not log them out so /admin keeps working in the same browser.
      if (await hasAdminProfile(session.user.id)) {
        profileRef.current = null
        setState({ status: 'signedOut' })
        return
      }

      const profile = await ensureUserProfile(session.user)
      if (!profile) {
        profileRef.current = null
        setState({ status: 'signedOut' })
        return
      }

      profileRef.current = profile
      setState({ status: 'ready', session, profile })
    } catch (error) {
      setState({ status: 'error', message: friendlyError(error) })
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true

    getUserSession()
      .then((session) => active && resolveSession(session))
      .catch((error) => active && setState({ status: 'error', message: friendlyError(error) }))

    const unsubscribe = onUserAuthChange((event, session) => {
      if (!active || event === 'INITIAL_SESSION') return
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true)
        if (session) {
          window.setTimeout(() => active && resolveSession(session), 0)
        }
        return
      }
      if (event === 'SIGNED_OUT') {
        profileRef.current = null
        setRecoveryMode(false)
        setState({ status: 'signedOut' })
        return
      }
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setState((current) => (current.status === 'ready' ? { ...current, session } : current))
        return
      }
      if (event === 'SIGNED_IN') {
        if (profileRef.current && session?.user?.id === profileRef.current.id) return
        window.setTimeout(() => active && resolveSession(session), 0)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [resolveSession])

  const login = useCallback(async (email, password) => {
    const result = await signInUserService(email, password)
    profileRef.current = result.profile
    setRecoveryMode(false)
    setState({ status: 'ready', session: result.session, profile: result.profile })
    return result
  }, [])

  const register = useCallback(async (payload) => {
    const result = await registerUserService(payload)
    if (result.session && result.user) {
      await resolveSession(result.session)
    }
    return result
  }, [resolveSession])

  const logout = useCallback(async () => {
    await signOutUserService()
    profileRef.current = null
    setRecoveryMode(false)
    setState({ status: 'signedOut' })
  }, [])

  const updateProfile = useCallback(
    async ({ fullName, phone }) => {
      const userId = state.status === 'ready' ? state.profile.id : null
      if (!userId) throw new Error('Please sign in to update your profile.')
      const updated = await updateUserProfileService(userId, { fullName, phone })
      profileRef.current = updated
      setState((current) =>
        current.status === 'ready' ? { ...current, profile: updated } : current,
      )
      return updated
    },
    [state],
  )

  const refreshProfile = useCallback(async () => {
    const session = await getUserSession()
    await resolveSession(session)
  }, [resolveSession])

  const retry = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      await resolveSession(await getUserSession())
    } catch (error) {
      setState({ status: 'error', message: friendlyError(error) })
    }
  }, [resolveSession])

  const clearRecoveryMode = useCallback(() => setRecoveryMode(false), [])

  const value = useMemo(
    () => ({
      ...state,
      recoveryMode,
      clearRecoveryMode,
      login,
      register,
      logout,
      updateProfile,
      refreshProfile,
      retry,
    }),
    [
      state,
      recoveryMode,
      clearRecoveryMode,
      login,
      register,
      logout,
      updateProfile,
      refreshProfile,
      retry,
    ],
  )

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
}
