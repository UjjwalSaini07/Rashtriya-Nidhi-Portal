'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entitiesAPI } from '../../lib/api';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Search, Plus, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { RegisterEntityModal } from '@/components/forms/RegisterEntityModal';

export default function EntitiesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['entities', search, typeFilter],
    queryFn: () => entitiesAPI.getAll({ ...(search && { search }), ...(typeFilter && { type: typeFilter }) }).then(r => r.data),
  });

  const entities = data?.entities || [];

  async function toggleStatus(id, currentStatus) {
    try {
      await entitiesAPI.updateStatus(id, !currentStatus);
      qc.invalidateQueries({ queryKey: ['entities'] });
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  }

  const TYPE_COLORS = {
    CONTRACTOR: 'bg-blue-100 text-blue-700',
    SUPPLIER: 'bg-purple-100 text-purple-700',
    MEDIATOR: 'bg-yellow-100 text-yellow-700',
    STATE_DEPT: 'bg-green-100 text-green-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flag-stripe" />
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Registered Entities</h1>
              <p className="text-sm text-gray-500 mt-0.5">{entities.length} entities · All GST/PAN verified</p>
            </div>
            <button onClick={() => setShowRegister(true)}
              className="bg-[#0A2540] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0D3063] flex items-center gap-2">
              <Plus size={15} /> Register Entity
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, NIC ID, GST, PAN..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0A2540]">
              <option value="">All Types</option>
              <option value="CONTRACTOR">Contractor</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="MEDIATOR">Mediator</option>
              <option value="STATE_DEPT">State Department</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['NIC Entity ID','Name','Type','GST Number','PAN','Bank (IFSC)','State','GST ✓','PAN ✓','Status','Registered'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={11} className="px-5 py-8 text-center text-sm text-gray-400">Loading entities...</td></tr>
                  ) : entities.length === 0 ? (
                    <tr><td colSpan={11} className="px-5 py-10 text-center">
                      <Building2 size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No entities registered yet.</p>
                    </td></tr>
                  ) : entities.map(entity => (
                    <tr key={entity._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-[#0A2540]">{entity.nicEntityId}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[160px] truncate">{entity.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[entity.type] || 'bg-gray-100 text-gray-600'}`}>
                          {entity.type?.replace('_',' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{entity.gstNumber || '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{entity.panNumber}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{entity.bankName}<br/><span className="font-mono">{entity.bankIfsc}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-600">{entity.stateCode}</td>
                      <td className="px-4 py-3 text-center">
                        {entity.gstVerified ? <CheckCircle size={15} className="text-green-500 mx-auto" /> : <XCircle size={15} className="text-red-400 mx-auto" />}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entity.panVerified ? <CheckCircle size={15} className="text-green-500 mx-auto" /> : <XCircle size={15} className="text-red-400 mx-auto" />}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleStatus(entity._id, entity.isActive)}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer ${entity.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                          {entity.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{format(new Date(entity.createdAt), 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {showRegister && <RegisterEntityModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
