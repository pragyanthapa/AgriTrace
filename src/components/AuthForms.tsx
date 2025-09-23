import React from 'react';
import { useAuth } from '../context/AuthContext';

export const SignupForm: React.FC<{ role: 'farmer' | 'buyer'; onSuccess: () => void }> = ({ role, onSuccess }) => {
  const { signup } = useAuth();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { setError(null); await signup(name, email, password, role); onSuccess(); } catch (e: any) { setError(e?.response?.data?.error || e?.message); }
  };
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input className="w-full px-4 py-3 border rounded-lg" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
      <input className="w-full px-4 py-3 border rounded-lg" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input className="w-full px-4 py-3 border rounded-lg" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg">Sign up</button>
    </form>
  );
};

export const LoginForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { setError(null); await login(email, password); onSuccess(); } catch (e: any) { setError(e?.response?.data?.error || e?.message); }
  };
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input className="w-full px-4 py-3 border rounded-lg" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input className="w-full px-4 py-3 border rounded-lg" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg">Log in</button>
    </form>
  );
};


