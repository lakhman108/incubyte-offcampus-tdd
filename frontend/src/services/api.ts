const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

const fetchAPI = async (endpoint: string, options: FetchOptions = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

export const authAPI = {
  register: (username: string, email: string, password: string, role: string = 'customer') =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    }),

  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const sweetsAPI = {
  getAll: (token: string) =>
    fetchAPI('/sweets', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getById: (token: string, id: string) =>
    fetchAPI(`/sweets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  search: (token: string, query: string) =>
    fetchAPI(`/sweets/search?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  create: (token: string, sweet: { name: string; category: string; price: number; quantity: number }) =>
    fetchAPI('/sweets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(sweet),
    }),

  update: (token: string, id: string, sweet: Partial<{ name: string; category: string; price: number; quantity: number }>) =>
    fetchAPI(`/sweets/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(sweet),
    }),

  delete: (token: string, id: string) =>
    fetchAPI(`/sweets/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  purchase: (token: string, id: string, quantity: number) =>
    fetchAPI(`/sweets/${id}/purchase`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ quantity }),
    }),

  restock: (token: string, id: string, quantity: number) =>
    fetchAPI(`/sweets/${id}/restock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ quantity }),
    }),
};
