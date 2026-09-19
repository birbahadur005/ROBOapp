const API_BASE = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('ravan_auth_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  get: <T = any>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'GET' }),
  post: <T = any>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  patch: <T = any>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  delete: <T = any>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'DELETE' })
};
