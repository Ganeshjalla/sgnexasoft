import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, projectAPI } from '../../api/services';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { TrendingUp, FolderOpen, Users, DollarSign, Clock, CheckCircle, Star } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [projectStats, setProjectStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, p] = await Promise.all([userAPI.getDashboard(), projectAPI.getStats()]);
        setStats(d.data);
        setProjectStats(p.data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const lineData = {
    labels: months.slice(0, new Date().getMonth() + 1),
    datasets: [{
      label: 'Earnings (₹)',
      data: [2000, 4500, 3200, 6800, 5100, 7200, 8900, 6400, 9100, 7800, 11000, 9500].slice(0, new Date().getMonth() + 1),
      fill: true,
      backgroundColor: 'rgba(99,102,241,0.1)',
      borderColor: '#6366f1',
      tension: 0.4,
      pointRadius: 4,
    }]
  };

  const donutData = {
    labels: ['Open', 'In Progress', 'Completed'],
    datasets: [{ data: [projectStats.open || 0, projectStats.inProgress || 0, projectStats.completed || 0],
      backgroundColor: ['#10b981', '#6366f1', '#94a3b8'], borderWidth: 0 }]
  };

  const chartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } } };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your account today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === 'STUDENT' && <>
          <StatCard title="Total Earnings" value={`₹${stats.totalEarnings?.toLocaleString() || 0}`} icon={DollarSign} color="bg-green-500" sub="All time" />
          <StatCard title="Wallet Balance" value={`₹${stats.walletBalance?.toLocaleString() || 0}`} icon={TrendingUp} color="bg-indigo-500" sub="Available" />
          <StatCard title="My Projects" value={stats.totalProjects || 0} icon={FolderOpen} color="bg-purple-500" />
          <StatCard title="Rating" value={`${stats.rating?.toFixed(1) || '0.0'} ⭐`} icon={Star} color="bg-yellow-500" />
        </>}
        {user?.role === 'CLIENT' && <>
          <StatCard title="Total Spent" value={`₹${stats.totalSpent?.toLocaleString() || 0}`} icon={DollarSign} color="bg-blue-500" />
          <StatCard title="My Projects" value={stats.totalProjects || 0} icon={FolderOpen} color="bg-indigo-500" />
          <StatCard title="Open" value={projectStats.open || 0} icon={Clock} color="bg-green-500" />
          <StatCard title="Completed" value={projectStats.completed || 0} icon={CheckCircle} color="bg-gray-500" />
        </>}
        {user?.role === 'ADMIN' && <>
          <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="bg-indigo-500" />
          <StatCard title="Students" value={stats.totalStudents || 0} icon={Users} color="bg-purple-500" />
          <StatCard title="Clients" value={stats.totalClients || 0} icon={Users} color="bg-blue-500" />
          <StatCard title="Total Projects" value={stats.totalProjects || 0} icon={FolderOpen} color="bg-green-500" />
        </>}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-4">Revenue Overview</h2>
          <Line data={lineData} options={chartOptions} />
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Project Status</h2>
          <Doughnut data={donutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '65%' }} />
          <div className="mt-4 space-y-2">
            {[['Open', projectStats.open, 'bg-green-500'], ['In Progress', projectStats.inProgress, 'bg-indigo-500'], ['Completed', projectStats.completed, 'bg-gray-400']].map(([label, val, color]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${color}`}></span><span className="text-gray-600">{label}</span></div>
                <span className="font-medium text-gray-800">{val || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {user?.role === 'CLIENT' && <button onClick={() => navigate('/projects/create')} className="btn-primary">+ Post Project</button>}
          {user?.role === 'STUDENT' && <button onClick={() => navigate('/projects')} className="btn-primary">Browse Projects</button>}
          <button onClick={() => navigate('/messages')} className="btn-secondary">💬 Messages</button>
          <button onClick={() => navigate('/transactions')} className="btn-secondary">💳 Transactions</button>
          <button onClick={() => navigate('/my-projects')} className="btn-secondary">📁 My Projects</button>
        </div>
      </div>
    </div>
  );
}
