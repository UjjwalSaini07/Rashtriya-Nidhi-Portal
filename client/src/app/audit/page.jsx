'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditAPI } from '../../lib/api';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const ACTION_COLORS = {
  BILL_CREATED:      'bg-blue-100 text-blue-700',
  BILL_APPROVE:      'bg-green-100 text-green-700',
  BILL_REJECT:       'bg-red-100 text-red-700',
  BILL_SIGNED_STATE: 'bg-orange-100 text-orange-700',
  BILL_SIGNED_CENTRAL: 'bg-orange-100 text-orange-700',
  BILL_DISBURSED:    'bg-teal-100 text-teal-700',
  USER_LOGIN:        'bg-gray-100 text-gray-600',
  USER_LOGOUT:       'bg-gray-100 text-gray-600',
  ENTITY_REGISTERED: 'bg-purple-100 text-purple-700',
};

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [chainResult, setChainResult] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actionFilter],
    queryFn: () => auditAPI.getLogs({ page: String(page), limit: '50', ...(actionFilter && { action: actionFilter }) }).then(r => r.data),
  });

  const logs = data?.logs || [];

  async function verifyChain() {
    setVerifying(true);
    try {
      const res = await auditAPI.verifyChain();
      setChainResult(res.data);
    } catch (e) {
      setChainResult({ valid: false, totalBlocks: 0, error: 'Verification failed' });
    } finally { setVerifying(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flag-stripe" />
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Audit Trail</h1>
              <p className="text-sm text-gray-500 mt-0.5">Immutable blockchain-style log of all system actions · Read-only</p>
            </div>
            <div className="flex items-center gap-3">
              {chainResult && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${chainResult.valid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {chainResult.valid ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  Chain: {chainResult.valid ? 'VALID' : 'BROKEN'} · {chainResult.totalBlocks} blocks
                </div>
              )}
              <button onClick={verifyChain} disabled={verifying}
                className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-60">
                <RefreshCw size={14} className={verifying ? 'animate-spin' : ''} />
                {verifying ? 'Verifying...' : 'Verify Chain Integrity'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3 items-center">
            <input value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
              placeholder="Filter by action (e.g. BILL_CREATED)..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
            <div className="flex gap-2 text-xs">
              {['BILL_CREATED','BILL_APPROVE','BILL_DISBURSED','USER_LOGIN','ENTITY_REGISTERED'].map(a => (
                <button key={a} onClick={() => setActionFilter(actionFilter === a ? '' : a)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono border transition-colors ${actionFilter === a ? 'bg-[#0A2540] text-white border-[#0A2540]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <Shield size={14} className="text-[#0A2540]" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                System Audit Log · Tamper-Evident · {data?.total || 0} total records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Block #','Timestamp (IST)','Action','Entity','Performed By','Role','IP Address','Data Hash'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">Loading audit logs...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No audit logs found.</td></tr>
                  ) : logs.map(log => (
                    <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-500 font-semibold">#{log.blockNumber}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                        {format(new Date(log.createdAt), 'dd MMM yy HH:mm:ss')}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">
                        <span className="text-gray-700">{log.entityType}</span>
                        <br /><span className="font-mono">{log.entityId?.substring(0, 14)}...</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        <div className="font-medium text-gray-800">{log.performedByName}</div>
                        <div className="font-mono text-gray-400">{log.performedByNicId}</div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{log.performedByRole?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-400">{log.ipAddress}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-300 max-w-[100px] truncate" title={log.dataHash}>
                        {log.dataHash?.substring(0, 12)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Page {page} of {data.pages} · {data.total} records</span>
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
    </div>
  );
}
