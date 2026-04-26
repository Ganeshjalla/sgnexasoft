import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/services';
import { Users, FolderOpen, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'bg-indigo-500' },
    { label: 'Students', value: stats.totalStudents || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Clients', value: stats.totalClients || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Projects', value: stats.totalProjects || 0, icon: FolderOpen, color: 'bg-green-500' },
    { label: 'Open Projects', value: stats.openProjects || 0, icon: TrendingUp, color: 'bg-yellow-500' },
    { label: 'Completed', value: stats.completedProjects || 0, icon: FolderOpen, color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
