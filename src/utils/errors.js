/** Turn Supabase / PostgREST / network errors into messages a gym owner can act on. */
export function friendlyError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback
  const code = error.code ?? ''
  const message = String(error.message ?? '')

  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return 'Could not reach the server. Check your internet connection and try again.'
  }
  if (code === '42501' || /row-level security|permission denied/i.test(message)) {
    return 'You do not have permission to do that. Sign in again with an administrator account.'
  }
  if (code === 'PGRST301' || /jwt (expired|invalid)/i.test(message)) {
    return 'Your session has expired. Please sign in again.'
  }
  if (code === '23505') return 'That entry already exists.'
  if (code === '23503') return 'This item is still in use by other records.'
  if (code === '23514' || code === '22001') return 'One of the values is not valid. Please check the form.'
  if (code === '42P01' || /relation .* does not exist|schema cache/i.test(message)) {
    return 'The database tables are missing. Run the SQL migrations from the supabase/migrations folder.'
  }
  if (code === 'PGRST116') return 'That record no longer exists or you cannot change it.'
  return message || fallback
}

export class ServiceError extends Error {
  constructor(error, fallback) {
    super(friendlyError(error, fallback))
    this.name = 'ServiceError'
    this.code = error?.code
    this.original = error
  }
}

/** Throw a ServiceError when a Supabase response carries an error; otherwise return data. */
export function unwrap(response, fallback) {
  if (response.error) throw new ServiceError(response.error, fallback)
  return response.data
}
