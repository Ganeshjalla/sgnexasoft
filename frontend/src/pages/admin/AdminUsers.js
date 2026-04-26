import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = () => adminAPI.getUsers().then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success('User status updated');
      load();
    } catch (e) { toast.error('Failed'); }
  };

  const filtered = filter === 'ALL' ? users : users.filter(u => u.role === filter);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'STUDENT', 'CLIENT', 'ADMIN'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Email', 'Role', 'Rating', 'Wallet', 'Status', 'Joined', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-semibold">{u.name?.[0]?.toUpperCase()}</div>
                    <span className="font-medium text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'CLIENT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">⭐ {u.rating?.toFixed(1) || '0.0'}</td>
                <td className="px-4 py-3 text-gray-600">₹{u.walletBalance?.toLocaleString() || 0}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.active ? 'Active' : 'Disabled'}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(u.id)}
                    className={`text-xs px-2 py-1 rounded-md font-medium ${u.active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                    {u.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
