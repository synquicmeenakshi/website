/**
 * API utility functions for admin panel
 * Automatically adds authentication headers to requests
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Get authentication headers
 */
const getAuthHeaders = (): HeadersInit => {
  const apiKey = localStorage.getItem('admin_api_key');
  const token = localStorage.getItem('admin_token');

  return {
    'Content-Type': 'application/json',
    ...(apiKey && { 'x-api-key': apiKey }),
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Make an authenticated API request
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    // Check if unauthorized - redirect to login
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_api_key');
      localStorage.removeItem('admin_email');
      localStorage.removeItem('admin_name');
      window.location.href = '/admin';
    }

    throw new Error(data.message || `API error: ${response.status}`);
  }

  return data;
};

/**
 * GET request
 */
export const apiGet = async (endpoint: string): Promise<any> => {
  return apiRequest(endpoint, { method: 'GET' });
};

/**
 * POST request
 */
export const apiPost = async (endpoint: string, body: any): Promise<any> => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
};

/**
 * PUT request
 */
export const apiPut = async (endpoint: string, body: any): Promise<any> => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
};

/**
 * PATCH request
 */
export const apiPatch = async (endpoint: string, body: any): Promise<any> => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
};

/**
 * DELETE request
 */
export const apiDelete = async (endpoint: string): Promise<any> => {
  return apiRequest(endpoint, { method: 'DELETE' });
};

/**
 * Upload file
 */
export const apiUpload = async (endpoint: string, formData: FormData): Promise<any> => {
  const apiKey = localStorage.getItem('admin_api_key');
  const token = localStorage.getItem('admin_token');

  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(apiKey && { 'x-api-key': apiKey }),
      ...(token && { 'Authorization': `Bearer ${token}` })
      // Don't set Content-Type for FormData - browser will set it with boundary
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_api_key');
      window.location.href = '/admin';
    }

    throw new Error(data.message || `Upload error: ${response.status}`);
  }

  return data;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!(localStorage.getItem('admin_token') && localStorage.getItem('admin_api_key'));
};

/**
 * Logout
 */
export const logout = (): void => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_api_key');
  localStorage.removeItem('admin_email');
  localStorage.removeItem('admin_name');
  window.location.href = '/admin';
};
