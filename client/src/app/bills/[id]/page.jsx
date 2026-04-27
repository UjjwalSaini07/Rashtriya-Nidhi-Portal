'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { billsAPI, authAPI } from '../../../lib/api';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArrowLeft, AlertTriangle, CheckCircle, Shield, Send } from 'lucide-react';
import { format } from 'date-fns';
import crypto from 'crypto';

export default function BillDetailPage({ params }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [comments, setComments] = useState('');
  const [otp, setOtp] = useState('');
  const [signType, setSignType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const { data: bill, isLoading } = useQuery({
    queryKey: ['bill', params.id],
    queryFn: () => billsAPI.getById(params.id).then(r => r.data.bill),
  });

  async function handleReview(action) {
    if (action === 'REJECT' && !comments) return setMsg({ type: 'error', text: 'Rejection reason required' });
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      await billsAPI.review(params.id, { action, comments });
      setMsg({ type: 'success', text: `Bill ${action.toLowerCase()}d` });
      qc.invalidateQueries({ queryKey: ['bill', params.id] });
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Action failed' }); }
    finally { setLoading(false); }
  }

  async function handleRequestOTP() {
    try { await authAPI.sendOTP(`bill_sign_${params.id}`); setMsg({ type: 'success', text: 'OTP sent to your mobile' }); }
    catch { setMsg({ type: 'error', text: 'Failed to send OTP' }); }
  }

  async function handleSign() {
    if (!otp || otp.length !== 6) return setMsg({ type: 'error', text: 'Enter valid 6-digit OTP' });
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const sType = bill.status === 'AWAITING_STATE_SIGN' ? 'STATE' : 'CENTRAL';
      await billsAPI.sign(params.id, { otp, signatureType: sType });
      setMsg({ type: 'success', text: `${sType} signature applied` });
      qc.invalidateQueries({ queryKey: ['bill', params.id] });
      setOtp('');
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Signing failed' }); }
    finally { setLoading(false); }
  }

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!bill) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Bill not found</div>;

  const TABS = ['overview', 'split', 'timeline', 'blockchain'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flag-stripe" />
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <button onClick={() => router.push('/bills')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft size={15} /> Back to Bills
          </button>

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold font-mono text-gray-900">{bill.billNumber}</h1>
                <StatusBadge status={bill.status} />
                {bill.aiFlags?.length > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <AlertTriangle size={11} /> {bill.aiFlags.length} AI Flag(s)
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{bill.projectTitle} · {bill.stateName} · ₹{bill.totalAmount?.toLocaleString('en-IN')} Crore</p>
            </div>
          </div>

          {msg.text && (
            <div className={`rounded-lg p-3 mb-4 flex gap-2 items-center text-sm ${msg.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              {msg.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              {msg.text}
            </div>
          )}

          {bill.aiFlags?.length > 0 && (
            <div className="mb-4 space-y-2">
              {bill.aiFlags.map((f, i) => (
                <div key={i} className={`rounded-lg p-3 border text-sm ${['CRITICAL','HIGH'].includes(f.severity) ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <span className="font-semibold">{f.severity}: {f.flagType?.replace(/_/g,' ')} — </span>
                  {f.message}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-[#0A2540] border-b-2 border-[#0A2540]' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {tab === 'overview' && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Bill Number', bill.billNumber],
                      ['State', bill.stateName],
                      ['Department', bill.department],
                      ['Category', bill.projectCategory?.replace(/_/g,' ')],
                      ['Total Amount', `₹${bill.totalAmount?.toLocaleString('en-IN')} Crore`],
                      ['Raised By', `${bill.raisedBy?.name} (${bill.raisedByNicId})`],
                      ['Submitted On', format(new Date(bill.createdAt), 'dd MMM yyyy HH:mm')],
                      ['Expected Completion', bill.expectedCompletionDate ? format(new Date(bill.expectedCompletionDate), 'dd MMM yyyy') : '-'],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                        <div className="text-sm font-medium text-gray-900">{value}</div>
                      </div>
                    ))}
                    <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Description</div>
                      <div className="text-sm text-gray-800">{bill.projectDescription}</div>
                    </div>
                  </div>
                )}

                {tab === 'split' && (
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                      {['Entity','NIC ID','Type','Amount (₹ Cr)','%','KYC','Disbursed'].map(h => (
                        <th key={h} className="text-left text-xs text-gray-500 px-3 py-2 font-semibold">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {bill.fundSplit?.map((s, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-3 py-2.5 font-medium">{s.entityName}</td>
                          <td className="px-3 py-2.5 text-xs font-mono text-gray-500">{s.entityNicId}</td>
                          <td className="px-3 py-2.5 text-xs">{s.entityType}</td>
                          <td className="px-3 py-2.5 font-semibold">₹{s.amount?.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2.5">{s.percentage?.toFixed(1)}%</td>
                          <td className="px-3 py-2.5 text-green-600">✓</td>
                          <td className="px-3 py-2.5">{s.disbursed ? <span className="text-green-600 text-xs">✓ {s.transactionRef}</span> : <span className="text-gray-400 text-xs">Pending</span>}</td>
                        </tr>
                      ))}
                      <tr className="bg-green-50 border-t-2 border-green-200">
                        <td colSpan={3} className="px-3 py-2 font-bold text-green-700">TOTAL</td>
                        <td className="px-3 py-2 font-bold text-green-700">₹{bill.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 font-bold text-green-700">100%</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {tab === 'timeline' && (
                  <div className="space-y-4">
                    {[
                      { done: true, label: 'Bill Created', detail: `By ${bill.raisedBy?.name} (${bill.raisedByNicId})`, time: bill.createdAt },
                      { done: !!bill.level1ReviewedBy, label: 'Level 1 Review', detail: bill.level1ReviewedBy ? `By ${bill.level1ReviewedBy.name}${bill.level1Comments ? ' — ' + bill.level1Comments : ''}` : 'Pending', time: bill.level1ReviewedAt },
                      { done: !!bill.level2ReviewedBy, label: 'Level 2 Review', detail: bill.level2ReviewedBy ? `By ${bill.level2ReviewedBy.name}` : 'Pending', time: bill.level2ReviewedAt },
                      { done: !!bill.stateSignedAt, label: 'State OTP Signature', detail: bill.stateSignedAt ? 'Applied via OTP' : 'Pending', time: bill.stateSignedAt },
                      { done: !!bill.centralSignedAt, label: 'Central OTP Signature', detail: bill.centralSignedAt ? 'Applied via OTP' : 'Pending', time: bill.centralSignedAt },
                      { done: !!bill.sanctionedAt, label: 'Sanctioned', detail: bill.sanctionOrderNumber || 'Pending', time: bill.sanctionedAt },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {step.done ? <CheckCircle size={14} className="text-green-600" /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{step.label}</div>
                          <div className="text-xs text-gray-500">{step.detail}</div>
                          {step.time && <div className="text-xs text-gray-400 mt-0.5">{format(new Date(step.time), 'dd MMM yyyy HH:mm IST')}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'blockchain' && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">Block Hash (SHA-256 — Immutable Ledger)</div>
                      <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 break-all">
                        {bill.blockchainHash || 'Not generated yet — bill must be sanctioned first'}
                      </div>
                    </div>
                    {bill.blockchainHash && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
                        🔗 Cryptographically linked to the audit chain. Any modification breaks the chain and triggers alerts.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions panel */}
            <div className="space-y-4">
              {['SUBMITTED','LEVEL1_REVIEW','LEVEL2_REVIEW','FLAGGED'].includes(bill.status) && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={15} className="text-[#0A2540]" />
                    <h3 className="text-sm font-semibold">Review Actions</h3>
                  </div>
                  <textarea value={comments} onChange={e => setComments(e.target.value)}
                    placeholder="Comments (required for rejection)..."
                    rows={3} className="w-full border border-gray-200 rounded-lg p-2.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#0A2540] mb-3" />
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleReview('APPROVE')} disabled={loading}
                      className="bg-green-600 text-white text-xs py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60">
                      ✓ Approve
                    </button>
                    <button onClick={() => handleReview('REJECT')} disabled={loading || !comments}
                      className="bg-red-600 text-white text-xs py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-60">
                      ✕ Reject
                    </button>
                  </div>
                </div>
              )}

              {['AWAITING_STATE_SIGN','AWAITING_CENTRAL_SIGN'].includes(bill.status) && (
                <div className="bg-white rounded-xl border border-orange-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Send size={15} className="text-orange-500" />
                    <h3 className="text-sm font-semibold">Digital Signature</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {bill.status === 'AWAITING_STATE_SIGN' ? 'State Admin OTP signature required' : 'Central Admin OTP signature required'}
                  </p>
                  <button onClick={handleRequestOTP} className="w-full border border-orange-300 text-orange-600 text-xs py-2 rounded-lg mb-2 hover:bg-orange-50">
                    Send OTP to Registered Mobile
                  </button>
                  <input value={otp} onChange={e => setOtp(e.target.value)} type="text" maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center tracking-widest font-mono mb-2 focus:outline-none focus:ring-1 focus:ring-[#0A2540]" />
                  <button onClick={handleSign} disabled={loading || otp.length !== 6}
                    className="w-full bg-[#0A2540] text-white text-xs py-2 rounded-lg font-medium hover:bg-[#0D3063] disabled:opacity-60">
                    {loading ? 'Signing...' : 'Apply Digital Signature →'}
                  </button>
                </div>
              )}

              {bill.status === 'SANCTIONED' && (
                <div className="bg-white rounded-xl border border-green-200 p-4">
                  <h3 className="text-sm font-semibold mb-2 text-green-700">Disburse Funds</h3>
                  <p className="text-xs text-gray-500 mb-3">Bill is sanctioned. Release funds to all {bill.fundSplit?.length} beneficiaries.</p>
                  <button onClick={async () => { setLoading(true); try { await billsAPI.disburse(params.id); setMsg({ type: 'success', text: 'Funds disbursed' }); qc.invalidateQueries({ queryKey: ['bill', params.id] }); } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); } finally { setLoading(false); } }}
                    disabled={loading}
                    className="w-full bg-green-600 text-white text-xs py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60">
                    {loading ? 'Disbursing...' : '💸 Release Funds to All Parties'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
