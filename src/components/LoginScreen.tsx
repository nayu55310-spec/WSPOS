import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  users: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Owner');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username tidak boleh kosong');
      return;
    }

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.status === 'active'
    );

    if (user) {
      // Allow 1234 as default master password or user.password
      if (user.password && user.password !== password && password !== '1234') {
        setError('Password salah. Silakan coba lagi.');
        return;
      }
      if (user.role !== selectedRole) {
        setError(`Akun ini terdaftar sebagai role ${user.role}.`);
        return;
      }
      onLogin(user);
    } else {
      // Dynamic fallback for custom username
      onLogin({
        id: `usr_${Date.now()}`,
        name: username.trim(),
        username: username.trim().toLowerCase(),
        password: password,
        role: selectedRole,
        status: 'active',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#f59e0b] flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
          <Store className="w-8 h-8 text-black stroke-[2.2]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          WS<span className="text-[#f59e0b]">POS</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1.5 font-normal">
          Point of Sale yang cepat dan sederhana.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[420px] bg-[#18181c] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Role Switcher */}
        <div className="grid grid-cols-2 bg-[#101013] p-1 rounded-xl mb-6 border border-zinc-800/50">
          <button
            type="button"
            onClick={() => handleRoleChange('Owner')}
            className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              selectedRole === 'Owner'
                ? 'bg-[#f59e0b] text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            OWNER
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('Kasir')}
            className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              selectedRole === 'Kasir'
                ? 'bg-[#f59e0b] text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            KASIR
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full bg-[#101013] border border-zinc-800/90 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#f59e0b] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full bg-[#101013] border border-zinc-800/90 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#f59e0b] transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold py-3.5 rounded-xl text-sm tracking-wider uppercase transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            MASUK
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-xs text-zinc-500 font-normal">
            Database: Google Spreadsheet
          </span>
        </div>
      </div>
    </div>
  );
};
