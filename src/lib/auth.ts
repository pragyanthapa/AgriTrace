import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const client = axios.create({ baseURL: `${API_BASE}/api/auth` });

export async function signup(payload: { name: string; email: string; password: string; role: 'farmer' | 'buyer'; }) {
  const { data } = await client.post('/signup', payload);
  return data as { token: string; user: any };
}

export async function login(payload: { email: string; password: string; }) {
  const { data } = await client.post('/login', payload);
  return data as { token: string; user: any };
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token');
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}


