const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Get user role from localStorage or default to Admin for testing
  const userRole = localStorage.getItem('userRole') || 'Admin'
  
  // Append role as query parameter
  const separator = path.includes('?') ? '&' : '?'
  const pathWithRole = `${path}${separator}role=${userRole}`

  const response = await fetch(`${apiUrl}${pathWithRole}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const messages = data.errors ? Object.values(data.errors).flat().join(' ') : data.message
    const error = new Error(messages || 'The request could not be completed.')
    error.validationErrors = data.errors ?? {}
    throw error
  }

  return data
}

export { apiUrl }
