// Cookie utility functions for session management

/**
 * Set a session cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until expiration (default: 1 day for session)
 */
export const setCookie = (name: string, value: string, days: number = 1): void => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`
}

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }
  return null
}

/**
 * Delete a cookie by name
 * @param name - Cookie name to delete
 */
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`
}

/**
 * Check if admin session cookie exists and is valid
 * @returns boolean indicating if admin is logged in
 */
export const isAdminAuthenticated = (): boolean => {
  const sessionCookie = getCookie('adminSession')
  return sessionCookie === 'true'
}

/**
 * Create admin session cookie on login
 * @param email - Admin email to store
 */
export const createAdminSession = (email: string): void => {
  setCookie('adminSession', 'true', 1) // Session valid for 1 day
  setCookie('adminEmail', email, 1)
}

/**
 * Destroy admin session cookies on logout
 */
export const destroyAdminSession = (): void => {
  deleteCookie('adminSession')
  deleteCookie('adminEmail')
}

/**
 * Get admin email from session
 * @returns Admin email or null
 */
export const getAdminEmail = (): string | null => {
  return getCookie('adminEmail')
}
