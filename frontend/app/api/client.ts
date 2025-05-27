const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log('Making API call to:', url);
    console.log('API_URL:', API_URL);
    console.log('Endpoint:', endpoint);
    const token = getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    console.log('Response status:', response.status);
    console.log('Content-Type:', contentType);
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('JSON data received:', data);
    } else {
      data = await response.text();
      console.warn('Response is not JSON:', data);
      console.warn('Full response headers:', Array.from(response.headers.entries()));
      throw new Error(`Invalid response format. Content-Type: ${contentType}, Body: ${data}`);
    }

    if (!response.ok) {
      console.error('API error:', data);
      return {
        error: data.message || data.error || 'An error occurred while fetching data',
      };
    }

    return { data: data as T };
  } catch (error) {
    console.error('Fetch error:', error);

    // Check if it's a timeout error
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        error: 'Request timed out. Please try again later.',
      };
    }

    // Check if it's a network error (like CORS or server not running)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        error: 'Network error. Please check your connection or try again later.',
      };
    }

    return {
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export function get<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

export function post<T>(
  endpoint: string,
  data: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function put<T>(
  endpoint: string,
  data: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function del<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}
