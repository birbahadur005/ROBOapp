import { handleMockRoute } from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
  // Keep all data in client-side file/localStorage store when no server is connected
  if (!import.meta.env.VITE_API_URL) {
    let bodyData = null;
    if (options.body && typeof options.body === 'string') {
      try {
        bodyData = JSON.parse(options.body);
      } catch {
        bodyData = options.body;
      }
    } else if (options.body) {
      bodyData = options.body;
    }
    return handleMockRoute(endpoint, options.method || 'GET', bodyData) as T;
  }

  const token = localStorage.getItem('ravan_auth_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (response.status === 404 && !import.meta.env.VITE_API_URL) {
      let bodyData = null;
      if (options.body && typeof options.body === 'string') {
        try {
          bodyData = JSON.parse(options.body);
        } catch {
          bodyData = options.body;
        }
      }
      return handleMockRoute(endpoint, options.method || 'GET', bodyData) as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err: any) {
    // If backend is unreachable (e.g. offline local development) fallback to mock
    if (
      !import.meta.env.VITE_API_URL ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError')
    ) {
      let bodyData = null;
      if (options.body && typeof options.body === 'string') {
        try {
          bodyData = JSON.parse(options.body);
        } catch {
          bodyData = options.body;
        }
      }
      return handleMockRoute(endpoint, options.method || 'GET', bodyData) as T;
    }
    throw err;
  }
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
