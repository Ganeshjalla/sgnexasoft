import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/services';
import { format } from 'date-fns';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getProjects().then(r => setProjects(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? projects : projects.filter(p => p.status === filter);
  const statusMap = { OPEN: 'badge-open', IN_PROGRESS: 'badge-progress', UNDER_REVIEW: 'badge-review', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Projects</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Title', 'Client', 'Budget', 'Status', 'Bids', 'Posted', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">{p.client?.name}</td>
                <td className="px-4 py-3 font-medium text-green-600">₹{p.budget?.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={statusMap[p.status] || 'badge-open'}>{p.status?.replace('_', ' ')}</span></td>
                <td className="px-4 py-3 text-gray-500">{p.bidCount || 0}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.createdAt ? format(new Date(p.createdAt), 'MMM dd, yyyy') : '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/projects/${p.id}`)} className="text-indigo-600 text-xs hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
