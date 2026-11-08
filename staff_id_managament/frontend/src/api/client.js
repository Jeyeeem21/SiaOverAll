const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Get auth token from localStorage
  const authToken = localStorage.getItem('auth_token')
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(`${apiUrl}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => ({}))
  
  // Handle authentication errors - prevent redirect loop
  if (response.status === 401) {
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
    }
    throw new Error('Session expired. Please login again.')
  }
  
  if (!response.ok) {
    const messages = data.errors ? Object.values(data.errors).flat().join(' ') : data.message
    const error = new Error(messages || 'The request could not be completed.')
    error.validationErrors = data.errors ?? {}
    throw error
  }

  return data
}

export { apiUrl }
