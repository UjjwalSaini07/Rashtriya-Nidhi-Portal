'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, billsAPI } from '../../lib/api';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RaiseBillModal } from '@/components/forms/RaiseBillModal';
import { TrendingUp, Clock, CheckCircle, AlertTriangle, FileText, Building2 } from 'lucide-react';
import { format } from 'date-fns';

function StatCard({ label, value, sub, icon: Icon, borderColor }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 border-l-4 ${borderColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="bg-gray-50 p-2 rounded-lg"><Icon size={20} className="text-gray-400" /></div>
      </div>
    </div>
  );
}

function formatCrore(val) {
  if (!val) return '₹0';
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L Cr`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K Cr`;
  return `₹${val.toFixed(0)} Cr`;
}

export default function DashboardPage() {
  const [showRaise, setShowRaise] = useState(false);

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats().then(r => r.data),
  });

  const { data: billsData } = useQuery({
    queryKey: ['bills-recent'],
    queryFn: () => billsAPI.getAll({ limit: '10', page: '1' }).then(r => r.data),
  });

  const stats = statsData?.stats || {};
  const bills = billsData?.bills || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flag-stripe" />
      <Topbar onRaiseBill={() => setShowRaise(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Overview of all fund allocation activity</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Sanctioned" value={formatCrore(stats.totalSanctioned)} sub="Across all states" icon={TrendingUp} borderColor="border-l-[#0A2540]" />
            <StatCard label="Pending Approvals" value={stats.pendingBills || 0} sub="Awaiting review/sign" icon={Clock} borderColor="border-l-[#FF6B00]" />
            <StatCard label="Disbursed Bills" value={stats.disbursedBills || 0} sub="100% direct routed" icon={CheckCircle} borderColor="border-l-[#138808]" />
            <StatCard label="AI Flags Active" value={stats.flaggedBills || 0} sub="Needs investigation" icon={AlertTriangle} borderColor="border-l-red-500" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="Sanctioned Bills" value={stats.sanctionedBills || 0} sub="Awaiting disbursement" icon={FileText} borderColor="border-l-blue-500" />
            <StatCard label="Registered Entities" value={stats.totalEntities || 0} sub="GST/PAN verified" icon={Building2} borderColor="border-l-purple-500" />
            <StatCard label="Avg Bill Size" value={formatCrore(stats.avgAmount)} sub="Historical average" icon={TrendingUp} borderColor="border-l-teal-500" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent Bills</h2>
              <a href="/bills" className="text-xs text-orange-600 hover:text-orange-700 font-medium">View all →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Bill ID','State','Project','Amount','Status','Date'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No bills yet. Raise your first bill.</td></tr>
                  ) : bills.map((bill) => (
                    <tr key={bill._id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/bills/${bill._id}`}>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-[#0A2540]">{bill.billNumber}</span>
                        {bill.aiFlags?.length > 0 && <span className="ml-1 text-red-500 text-xs">⚠</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{bill.stateName}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 max-w-[180px] truncate">{bill.projectTitle}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">₹{bill.totalAmount?.toLocaleString('en-IN')} Cr</td>
                      <td className="px-5 py-3.5"><StatusBadge status={bill.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{format(new Date(bill.createdAt), 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {showRaise && <RaiseBillModal onClose={() => setShowRaise(false)} />}
    </div>
  );
}
