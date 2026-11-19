import { useCallback, useEffect, useRef, useState } from 'react'
import { friendlyError } from '../../utils/errors'

/** Runs an async loader on mount / when `deps` change. Returns { data, setData, loading, error, reload }. */
export default function useLoader(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const token = useRef(0)
  const loaderRef = useRef(loader)
  useEffect(() => {
    loaderRef.current = loader
  })

  const run = useCallback(async () => {
    const id = ++token.current
    setState((s) => ({ ...s, loading: true, error: '' }))
    try {
      const data = await loaderRef.current()
      if (id === token.current) setState({ data, loading: false, error: '' })
    } catch (error) {
      if (id === token.current) setState((s) => ({ ...s, loading: false, error: friendlyError(error) }))
    }
  }, [])

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }))
  }, [])

  return { ...state, setData, reload: run }
}
