'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, User, Plus } from 'lucide-react';
import { authAPI } from '../../lib/api';

export function Topbar({ onRaiseBill }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) try { setUser(JSON.parse(stored)); } catch {}
  }, []);

  async function handleLogout() {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/auth/login');
  }

  return (
    <header className="bg-[#0A2540] flex items-center px-5 py-3 gap-4 flex-shrink-0">
      <span className="text-2xl">🇮🇳</span>
      <div>
        <span className="text-white font-semibold text-sm">Rashtriya Nidhi Portal</span>
        <span className="text-blue-300 text-xs ml-2">· Government Fund Allocation System</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-white/10 text-white px-2.5 py-1 rounded-full text-xs">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
          Secure Session
        </div>
        {user && (
          <div className="flex items-center gap-1.5 bg-white/10 text-white px-2.5 py-1 rounded-full text-xs">
            <User size={12} />
            <span>{user.name}</span>
            <span className="text-blue-300">· {user.role?.replace(/_/g,' ')}</span>
          </div>
        )}
        <button className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10">
          <Bell size={16} />
        </button>
        {onRaiseBill && (
          <button onClick={onRaiseBill}
            className="bg-[#FF6B00] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-orange-600 flex items-center gap-1.5">
            <Plus size={14} /> Raise Bill
          </button>
        )}
        <button onClick={handleLogout} className="text-white/70 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
