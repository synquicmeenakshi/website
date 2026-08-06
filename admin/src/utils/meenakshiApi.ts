/**
 * API helpers for the Meenakshi collections.
 *
 * Note on the base URL: config/api.ts treats VITE_API_URL as already including
 * `/api`, while utils/api.ts treats it as excluding it. That disagreement is
 * masked whenever the env var is set and bites on a fresh clone. This module
 * normalises explicitly rather than inheriting the ambiguity.
 */

const RAW = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

/** Guarantee exactly one trailing `/api`, whichever convention was configured. */
export const API = RAW.replace(/\/+$/, '').replace(/\/api$/, '') + '/api'

const authHeaders = (): Record<string, string> => {
  const apiKey = localStorage.getItem('admin_api_key')
  const token = localStorage.getItem('admin_token')
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers as Record<string, string>) },
  })

  let body: any = null
  try {
    body = await res.json()
  } catch {
    /* non-JSON error page */
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_api_key')
      window.location.href = '/admin/'
    }
    throw new Error(body?.message || `Request failed (HTTP ${res.status})`)
  }
  return body
}

export type CollectionName = 'services' | 'testimonials' | 'faqs' | 'journey' | 'legal'

export const listItems = (c: CollectionName) => request(`/meenakshi/admin/${c}`)
export const createItem = (c: CollectionName, data: any) =>
  request(`/meenakshi/admin/${c}`, { method: 'POST', body: JSON.stringify(data) })
export const updateItem = (c: CollectionName, id: string, data: any) =>
  request(`/meenakshi/admin/${c}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteItem = (c: CollectionName, id: string) =>
  request(`/meenakshi/admin/${c}/${id}`, { method: 'DELETE' })
export const reorderItems = (c: CollectionName, ids: string[]) =>
  request(`/meenakshi/admin/${c}/reorder`, { method: 'PATCH', body: JSON.stringify({ ids }) })

export const getSettings = () => request('/meenakshi/admin/settings')
export const saveSettings = (data: any) =>
  request('/meenakshi/admin/settings', { method: 'PUT', body: JSON.stringify(data) })

export interface Consultation {
  _id: string
  name: string
  contact: string
  contactType: 'email' | 'phone' | 'unknown'
  dob: string
  tob: string
  pob: string
  area: string
  language: string
  preferredDate: string
  notes: string
  consent: boolean
  status: 'new' | 'confirmed' | 'completed' | 'cancelled'
  confirmedDate: string
  confirmedTime: string
  adminNotes: string
  createdAt: string
}

export const listConsultations = (params: { status?: string; search?: string } = {}) => {
  const q = new URLSearchParams()
  if (params.status && params.status !== 'all') q.set('status', params.status)
  if (params.search) q.set('search', params.search)
  const qs = q.toString()
  return request(`/consultations${qs ? `?${qs}` : ''}`)
}
export const updateConsultation = (id: string, data: Partial<Consultation>) =>
  request(`/consultations/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteConsultation = (id: string) =>
  request(`/consultations/${id}`, { method: 'DELETE' })
