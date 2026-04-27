'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '../../lib/api';
import { INDIAN_STATES } from '../../lib/constants';
import { Globe, Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_LABELS = {
  ROADS_TRANSPORT:'Roads & Transport', WATER_RESOURCES:'Water Resources',
  HEALTH:'Health', EDUCATION:'Education', URBAN_DEV:'Urban Development',
  AGRICULTURE:'Agriculture', ENERGY:'Energy', DEFENSE:'Defense', MISC:'Miscellaneous',
};
const STATUS_LABELS = { SANCTIONED:'Sanctioned', DISBURSING:'Disbursing', DISBURSED:'Completed' };

export default function PublicPortalPage() {
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['public-projects', stateFilter, categoryFilter, page],
    queryFn: () => publicAPI.getProjects({ ...(stateFilter && { stateCode: stateFilter }), ...(categoryFilter && { category: categoryFilter }), page: String(page) }).then(r => r.data),
  });

  const projects = data?.projects || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Public header — no auth required */}
      <div className="flag-stripe" />
      <header className="bg-[#0A2540] text-white py-4 px-6 flex items-center gap-4">
        <span className="text-3xl">🇮🇳</span>
        <div>
          <div className="font-semibold text-lg">Rashtriya Nidhi Portal — Public Transparency</div>
          <div className="text-blue-200 text-sm">Government of India · Sanctioned Projects Register</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Globe size={15} className="text-blue-300" />
          <span className="text-blue-200 text-xs">Public Read-Only Portal — No Login Required</span>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sanctioned Government Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            All fund allocations that have been officially sanctioned and disbursed. Citizens can track how public funds are being utilised.
            Total projects: <strong>{data?.total || 0}</strong>
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0A2540]">
              <option value="">All States</option>
              {Object.entries(INDIAN_STATES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0A2540]">
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>

        {/* Projects grid */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <Globe size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No sanctioned projects found with the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {projects.map(project => (
              <div key={project._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-xs font-semibold text-[#0A2540] bg-blue-50 px-2 py-0.5 rounded">{project.billNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${project.status === 'DISBURSED' ? 'bg-green-100 text-green-700' : project.status === 'DISBURSING' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'}`}>
                    {STATUS_LABELS[project.status] || project.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{project.projectTitle}</h3>
                <p className="text-xs text-gray-500 mb-3">{project.stateName} · {project.department}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Sanctioned Amount</div>
                    <div className="text-lg font-bold text-gray-900">₹{project.totalAmount?.toLocaleString('en-IN')} Cr</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-0.5">Category</div>
                    <div className="text-xs font-medium text-gray-700">{CATEGORY_LABELS[project.projectCategory] || project.projectCategory}</div>
                    {project.sanctionedAt && <div className="text-xs text-gray-400 mt-0.5">{format(new Date(project.sanctionedAt), 'dd MMM yyyy')}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data?.pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-white">← Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {data.pages}</span>
            <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-white">Next →</button>
          </div>
        )}

        <div className="mt-8 bg-[#0A2540] rounded-xl p-5 text-white text-center">
          <p className="text-sm text-blue-200 mb-1">🔒 This is a read-only public transparency portal of the Government of India</p>
          <p className="text-xs text-blue-300">Data is updated in real-time. For RTI requests, contact the respective Ministry.</p>
        </div>
      </main>
    </div>
  );
}
