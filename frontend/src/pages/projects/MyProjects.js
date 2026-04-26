import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectAPI } from '../../api/services';
import { formatDistanceToNow } from 'date-fns';

const Badge = ({ status }) => {
  const map = { OPEN: 'badge-open', IN_PROGRESS: 'badge-progress', UNDER_REVIEW: 'badge-review', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
  return <span className={map[status] || 'badge-open'}>{status?.replace('_', ' ')}</span>;
};

export default function MyProjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = user?.role === 'STUDENT'
          ? await projectAPI.getMyStudentProjects()
          : await projectAPI.getMyClientProjects();
        setProjects(res.data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} projects</p>
        </div>
        {(user?.role === 'CLIENT' || user?.role === 'ADMIN') && (
          <button onClick={() => navigate('/projects/create')} className="btn-primary">+ Post Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">📁</p>
          <p className="text-gray-500">No projects yet</p>
          {user?.role === 'CLIENT' && <button onClick={() => navigate('/projects/create')} className="btn-primary mt-4">Post Your First Project</button>}
          {user?.role === 'STUDENT' && <button onClick={() => navigate('/projects')} className="btn-primary mt-4">Browse Projects</button>}
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => (
            <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
              className="card cursor-pointer hover:shadow-md transition-shadow hover:border-indigo-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge status={p.status} />
                    {p.category && <span className="text-xs text-gray-400">{p.category}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-800">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{p.description}</p>
                  {p.assignedStudent && (
                    <p className="text-xs text-indigo-600 mt-1">👤 {p.assignedStudent.name}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-green-600">₹{p.budget?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">{p.bidCount || 0} bids</p>
                  <p className="text-xs text-gray-400">{p.createdAt ? formatDistanceToNow(new Date(p.createdAt), { addSuffix: true }) : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
