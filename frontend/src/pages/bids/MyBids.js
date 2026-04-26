import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bidAPI } from '../../api/services';
import { formatDistanceToNow } from 'date-fns';

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    bidAPI.getMy().then(r => setBids(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusMap = { PENDING: 'badge-review', ACCEPTED: 'badge-open', REJECTED: 'badge-cancelled' };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Bids</h1>
        <p className="text-gray-500 text-sm mt-1">{bids.length} bids placed</p>
      </div>

      {bids.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">🎯</p>
          <p className="text-gray-500">No bids yet</p>
          <button onClick={() => navigate('/projects')} className="btn-primary mt-4">Browse Projects</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {bids.map(bid => (
            <div key={bid.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/projects/${bid.projectId}`)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={statusMap[bid.status]}>{bid.status}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{bid.projectTitle || `Project #${bid.projectId}`}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{bid.proposal}</p>
                  <p className="text-xs text-gray-400 mt-2">{bid.deliveryDays} days · {bid.createdAt ? formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true }) : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-lg">₹{bid.bidAmount?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
