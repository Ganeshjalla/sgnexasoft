import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI, messageAPI } from '../../api/services';
import {
  LayoutDashboard, FolderOpen, PlusCircle, FileText, MessageSquare,
  CreditCard, User, Settings, LogOut, Bell, Menu, X, Shield, Users
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [n, m] = await Promise.all([
          notificationAPI.getUnreadCount(),
          messageAPI.getUnreadCount()
        ]);
        setUnreadNotif(n.data);
        setUnreadMsg(m.data);
      } catch (e) {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['CLIENT','STUDENT','ADMIN'] },
    { to: '/projects', icon: FolderOpen, label: 'Browse Projects', roles: ['CLIENT','STUDENT','ADMIN'] },
    { to: '/projects/create', icon: PlusCircle, label: 'Post Project', roles: ['CLIENT','ADMIN'] },
    { to: '/my-projects', icon: FileText, label: 'My Projects', roles: ['CLIENT','STUDENT','ADMIN'] },
    { to: '/my-bids', icon: FileText, label: 'My Bids', roles: ['STUDENT'] },
    { to: '/messages', icon: MessageSquare, label: 'Messages', roles: ['CLIENT','STUDENT','ADMIN'], badge: unreadMsg },
    { to: '/transactions', icon: CreditCard, label: 'Transactions', roles: ['CLIENT','STUDENT','ADMIN'] },
    { to: '/admin', icon: Shield, label: 'Admin Panel', roles: ['ADMIN'] },
    { to: '/admin/users', icon: Users, label: 'Manage Users', roles: ['ADMIN'] },
  ];

  const filtered = navItems.filter(i => i.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-sm`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SG</span>
              </div>
              <span className="font-bold text-gray-800 text-lg">SGnexasoft</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filtered.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }>
              <div className="relative flex-shrink-0">
                <Icon size={18} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>
                )}
              </div>
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-gray-100 p-3">
          <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 font-semibold text-xs">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            )}
          </NavLink>
          <button onClick={handleLogout}
            className="mt-1 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600 w-full">
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shadow-sm">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/messages')} className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
              <MessageSquare size={20} />
              {unreadMsg > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <button className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
              <Bell size={20} />
              {unreadNotif > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <NavLink to="/profile" className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </NavLink>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
