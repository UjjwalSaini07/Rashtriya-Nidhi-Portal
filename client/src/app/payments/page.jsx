'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { billsAPI } from '../../lib/api';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle, AlertCircle, CreditCard, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [disbursing, setDisbursing] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['bills-sanctioned'],
    queryFn: () => billsAPI.getAll({ status: 'SANCTIONED', limit: '50' }).then(r => r.data),
  });
  const { data: disbursedData } = useQuery({
    queryKey: ['bills-disbursed'],
    queryFn: () => billsAPI.getAll({ status: 'DISBURSED', limit: '20' }).then(r => r.data),
  });

  const sanctioned = data?.bills || [];
  const disbursed = disbursedData?.bills || [];

  async function handleDisburse(billId) {
    setDisbursing(billId); setMsg({ type: '', text: '' });
    try {
      await billsAPI.disburse(billId);
      setMsg({ type: 'success', text: 'Funds successfully disbursed to all beneficiaries.' });
      qc.invalidateQueries({ queryKey: ['bills-sanctioned'] });
      qc.invalidateQueries({ queryKey: ['bills-disbursed'] });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Disbursement failed' });
    } finally { setDisbursing(null); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flag-stripe" />
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-5">
            <h1 className="text-xl font-bold text-gray-900">Fund Disbursement</h1>
            <p className="text-sm text-gray-500 mt-0.5">Release sanctioned funds directly to verified beneficiary bank accounts</p>
          </div>

          {msg.text && (
            <div className={`rounded-lg p-3 mb-4 flex gap-2 items-center text-sm ${msg.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              {msg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
              {msg.text}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard size={15} className="text-green-600" /> Sanctioned — Ready to Disburse ({sanctioned.length})
            </h2>
            {isLoading ? (
              <p className="text-sm text-gray-400 text-center py-8 bg-white rounded-xl border border-gray-200">Loading...</p>
            ) : sanctioned.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 bg-white rounded-xl border border-gray-200">No sanctioned bills pending disbursement.</p>
            ) : sanctioned.map(bill => (
              <div key={bill._id} className="bg-white rounded-xl border border-green-200 p-5 mb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-[#0A2540]">{bill.billNumber}</span>
                      <StatusBadge status={bill.status} />
                    </div>
                    <p className="text-sm font-medium text-gray-700">{bill.projectTitle}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{bill.stateName} · {bill.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 mb-3">₹{bill.totalAmount?.toLocaleString('en-IN')} Cr</div>
                    <button onClick={() => handleDisburse(bill._id)} disabled={disbursing === bill._id}
                      className="bg-[#138808] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center gap-2">
                      {disbursing === bill._id ? 'Processing...' : <><CreditCard size={14} /> Release Funds</>}
                    </button>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Auto-routed to verified bank accounts:</p>
                  {bill.fundSplit?.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{s.entityType}</span>
                        <span className="text-sm font-medium text-gray-800">{s.entityName}</span>
                        <span className="text-xs font-mono text-gray-400">{s.entityNicId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{s.percentage?.toFixed(1)}%</span>
                        <ArrowRight size={12} className="text-gray-300" />
                        <span className="text-sm font-bold">₹{s.amount?.toLocaleString('en-IN')} Cr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle size={15} className="text-teal-600" /> Recent Disbursements ({disbursed.length})
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Bill ID','Project','State','Amount','Parties Paid','Disbursed On'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {disbursed.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No disbursements yet.</td></tr>
                  ) : disbursed.map(bill => (
                    <tr key={bill._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0A2540]">{bill.billNumber}</td>
                      <td className="px-4 py-3 text-sm max-w-[200px] truncate">{bill.projectTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bill.stateName}</td>
                      <td className="px-4 py-3 text-sm font-semibold">₹{bill.totalAmount?.toLocaleString('en-IN')} Cr</td>
                      <td className="px-4 py-3"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{bill.fundSplit?.filter(s => s.disbursed).length}/{bill.fundSplit?.length} ✓</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{bill.fundSplit?.[0]?.disbursedAt ? format(new Date(bill.fundSplit[0].disbursedAt), 'dd MMM yyyy HH:mm') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
