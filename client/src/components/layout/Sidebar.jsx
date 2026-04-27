'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, CreditCard, Building2, Shield, Globe, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bills', label: 'Bills & Sanctions', icon: FileText },
  { href: '/payments', label: 'Fund Disbursement', icon: CreditCard },
  { href: '/entities', label: 'Registered Entities', icon: Building2 },
  { href: '/audit', label: 'Audit Trail', icon: Shield },
  { href: '/public-portal', label: 'Public Portal', icon: Globe },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <nav className="flex-1 py-4 px-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Navigation</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={clsx('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors',
                active ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}>
              <Icon size={16} className={active ? 'text-orange-500' : 'text-gray-400'} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <AlertTriangle size={13} className="text-orange-500" />
          <span className="text-xs font-semibold text-orange-700">AI Monitor</span>
        </div>
        <p className="text-xs text-orange-600">Anomaly detection active. All bills scanned on submit.</p>
      </div>
    </aside>
  );
}
