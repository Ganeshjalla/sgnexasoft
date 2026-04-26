import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../../api/services';
import { Search, Clock, DollarSign, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusBadge = (status) => {
  const map = { OPEN: 'badge-open', IN_PROGRESS: 'badge-progress', UNDER_REVIEW: 'badge-review', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
  return <span className={map[status] || 'badge-open'}>{status?.replace('_', ' ')}</span>;
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = async (q = '') => {
    setLoading(true);
    try {
      const res = await projectAPI.getAll(q);
      setProjects(res.data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Browse Projects</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} open projects available</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className="input pl-10" placeholder="Search projects by title, category, skills..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary px-6">Search</button>
        {search && <button type="button" onClick={() => { setSearch(''); load(''); }} className="btn-secondary">Clear</button>}
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg">No projects found</p>
          <p className="text-gray-400 text-sm mt-1">Try different search terms</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => (
            <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
              className="card cursor-pointer hover:shadow-md transition-shadow border hover:border-indigo-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {statusBadge(p.status)}
                    {p.category && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{p.category}</span>}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors">{p.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.description}</p>
                  {p.skills && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.skills.split(',').slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0 space-y-2">
                  <div className="flex items-center justify-end gap-1 text-green-600 font-bold text-lg">
                    <DollarSign size={18} />₹{p.budget?.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />{p.deadline ? formatDistanceToNow(new Date(p.deadline), { addSuffix: true }) : 'No deadline'}
                  </div>
                  <p className="text-xs text-gray-400">{p.bidCount || 0} bids</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                <span>Posted by {p.client?.name}</span>
                <span>{p.createdAt ? formatDistanceToNow(new Date(p.createdAt), { addSuffix: true }) : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
