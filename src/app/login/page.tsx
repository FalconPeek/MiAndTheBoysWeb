'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const USERS = [
  'Lucas Barbagallo',
  'Lucas Lindstrom',
  'Enoc Alegre',
  'Lucio Coutinho',
  'Ezequiel Oviedo',
  'Sebastian Vigliecca',
  'Maxi Dos Santos',
  'Agustin Bravo',
  'Matias Gamboa',
  'Chino',
  'Guido Pereyra'
];

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!selectedUser) {
      setError('Por favor seleccioná un usuario');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Por favor ingresá la contraseña');
      setIsLoading(false);
      return;
    }

    // Dummy password check for Phase 1 as per "fixed list auth" requirement
    // In a real scenario, this would be validated against Supabase
    if (password === 'losgurise2026') { 
      localStorage.setItem('user', selectedUser);
      router.push('/');
    } else {
      setError('Contraseña incorrecta');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-800">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
            PICK'EM MUNDIAL
          </h2>
          <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-widest">
            LosguRise Exclusive
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="user-select" className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">
                Miembro
              </label>
              <select
                id="user-select"
                required
                className="block w-full px-4 py-4 rounded-xl border-0 text-white bg-zinc-800 ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm transition-all appearance-none"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Seleccioná tu nombre</option>
                {USERS.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="password" title="Hint: losgurise2026" className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-4 py-4 rounded-xl border-0 text-white bg-zinc-800 ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs font-bold text-center bg-red-950/30 py-3 rounded-xl border border-red-900/50">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 text-sm font-black rounded-xl text-black bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? 'CARGANDO...' : 'ENTRAR AL VESTUARIO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
