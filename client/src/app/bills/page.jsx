'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { billsAPI } from '../../lib/api';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RaiseBillModal } from '@/components/forms/RaiseBillModal';
import { BILL_STATUSES } from '../../lib/constants';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function BillsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showRaise, setShowRaise] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['bills', search, statusFilter, page],
    queryFn: () => billsAPI.getAll({ ...(search && { search }), ...(statusFilter && { status: statusFilter }), page: String(page), limit: '20' }).then(r => r.data),
  });

  const bills = data?.bills || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flag-stripe" />
      <Topbar onRaiseBill={() => setShowRaise(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bills & Sanctions</h1>
              <p className="text-sm text-gray-500 mt-0.5">{data?.total || 0} total bills</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by bill ID or project..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0A2540]">
                <option value="">All Status</option>
                {BILL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Bill ID','State','Department','Project Title','Amount (₹ Cr)','Entities','Status','Raised On'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">Loading bills...</td></tr>
                  ) : bills.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No bills found.</td></tr>
                  ) : bills.map(bill => (
                    <tr key={bill._id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/bills/${bill._id}`)}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-[#0A2540]">{bill.billNumber}</span>
                        {bill.aiFlags?.length > 0 && <span className="ml-1 text-red-500">⚠</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">{bill.stateName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[120px] truncate">{bill.department}</td>
                      <td className="px-4 py-3 text-sm max-w-[200px] truncate">{bill.projectTitle}</td>
                      <td className="px-4 py-3 text-sm font-semibold">₹{bill.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{bill.fundSplit?.length || 0}</td>
                      <td className="px-4 py-3"><StatusBadge status={bill.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{format(new Date(bill.createdAt), 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Page {page} of {data.pages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                  <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      {showRaise && <RaiseBillModal onClose={() => setShowRaise(false)} />}
    </div>
  );
}
