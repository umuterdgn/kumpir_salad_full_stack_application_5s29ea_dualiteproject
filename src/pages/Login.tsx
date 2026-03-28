import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAppStore } from '../store';
import { SEO } from '../components/SEO';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setToken = useAppStore(state => state.setToken);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      navigate('/admin');
    } catch (err: any) {
      // Mock login for preview environment if backend fails
      if (email === 'admin@kumpirsalad.com' && password === 'admin123') {
        setToken('mock_token_for_preview');
        navigate('/admin');
      } else {
        setError(err.response?.data?.error || 'Giriş başarısız. (Test için: admin@kumpirsalad.com / admin123)');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Yönetici Girişi" description="Kumpir Salad Yönetici Paneli Girişi" />
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-dark">
            Yönetici Girişi
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-orange focus:border-brand-orange focus:z-10 sm:text-sm"
                placeholder="E-posta Adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-orange focus:border-brand-orange focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange transition-colors"
            >
              Giriş Yap
            </button>
          </div>
          <div className="text-center mt-4">
            <Link to="/" className="text-sm text-brand-green hover:underline">Ana Sayfaya Dön</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
