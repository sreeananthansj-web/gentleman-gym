/** Client-side navigation compatible with the app's custom path router (see App.jsx). */
export function navigate(to, { replace = false } = {}) {
  if (typeof window === 'undefined') return
  const current = window.location.pathname + window.location.search
  if (current !== to) {
    if (replace) window.history.replaceState({}, '', to)
    else window.history.pushState({}, '', to)
  }
  // App.jsx listens for popstate to re-read the path.
  window.dispatchEvent(new PopStateEvent('popstate'))
}
