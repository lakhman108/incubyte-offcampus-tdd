export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'customer' | 'admin';
}
