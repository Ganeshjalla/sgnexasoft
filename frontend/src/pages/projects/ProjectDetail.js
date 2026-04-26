import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, bidAPI, submissionAPI, paymentAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, DollarSign, Tag, Users, Star, CheckCircle } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ proposal: '', bidAmount: '', deliveryDays: '' });
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [subDesc, setSubDesc] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const load = async () => {
    try {
      const [p, b, s] = await Promise.all([
        projectAPI.getById(id),
        bidAPI.getForProject(id),
        submissionAPI.getForProject(id)
      ]);
      setProject(p.data);
      setBids(b.data);
      setSubmissions(s.data);
    } catch (e) { toast.error('Failed to load project'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bidAPI.place({ projectId: parseInt(id), ...bidForm, bidAmount: parseFloat(bidForm.bidAmount), deliveryDays: parseInt(bidForm.deliveryDays) });
      toast.success('Bid placed successfully!');
      setBidForm({ proposal: '', bidAmount: '', deliveryDays: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place bid'); }
    setSubmitting(false);
  };

  const handleAssign = async (bidId) => {
    try {
      await projectAPI.assignStudent(id, bidId);
      toast.success('Student assigned!');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign'); }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('projectId', id);
      if (subDesc) fd.append('description', subDesc);
      if (file) fd.append('file', file);
      await submissionAPI.submit(fd);
      toast.success('Work submitted!');
      setSubDesc(''); setFile(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    setSubmitting(false);
  };

  const handleReviewSubmission = async (subId, status, feedback = '') => {
    try {
      await submissionAPI.review(subId, status, feedback);
      toast.success(`Submission ${status.toLowerCase()}`);
      load();
    } catch (err) { toast.error('Failed to review'); }
  };

  const handlePayment = async () => {
    try {
      const payment = await paymentAPI.initiate({ projectId: parseInt(id), amount: project.budget });
      toast.success('Payment initiated & held in escrow!');
      // In production: integrate Razorpay SDK here
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;
  if (!project) return <div className="card text-center py-16"><p className="text-gray-400">Project not found</p></div>;

  const isClient = user?.role === 'CLIENT' || user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';
  const isOwner = project.client?.id === user?.userId || isClient;
  const isAssigned = project.assignedStudent?.id === user?.userId;
  const statusMap = { OPEN: 'badge-open', IN_PROGRESS: 'badge-progress', UNDER_REVIEW: 'badge-review', COMPLETED: 'badge-completed' };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={statusMap[project.status] || 'badge-open'}>{project.status?.replace('_', ' ')}</span>
              {project.category && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{project.category}</span>}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
            <p className="text-gray-500 text-sm mt-1">by {project.client?.name} · {project.createdAt ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }) : ''}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">₹{project.budget?.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">
              <Clock size={12} className="inline mr-1" />
              Due {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'N/A'}
            </div>
          </div>
        </div>

        {project.skills && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.skills.split(',').map(s => (
              <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{s.trim()}</span>
            ))}
          </div>
        )}

        {project.assignedStudent && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            ✅ Assigned to: <strong>{project.assignedStudent.name}</strong>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['details', 'bids', 'submissions'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            {tab} {tab === 'bids' && `(${bids.length})`} {tab === 'submissions' && `(${submissions.length})`}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-3">Project Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{project.description}</p>
          </div>

          {/* Client Actions */}
          {isOwner && project.status === 'IN_PROGRESS' && (
            <div className="card space-y-3">
              <h2 className="font-semibold text-gray-800">Client Actions</h2>
              <div className="flex gap-3 flex-wrap">
                <button onClick={handlePayment} className="btn-primary">💳 Make Payment (Escrow)</button>
                <button onClick={() => projectAPI.complete(id).then(() => { toast.success('Project completed!'); load(); })} className="btn-secondary">✅ Mark Complete</button>
              </div>
            </div>
          )}

          {/* Student: Submit Work */}
          {isStudent && isAssigned && (project.status === 'IN_PROGRESS' || project.status === 'UNDER_REVIEW') && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Submit Work</h2>
              <form onSubmit={handleSubmitWork} className="space-y-3">
                <textarea className="input h-24 resize-none" placeholder="Describe your submission..."
                  value={subDesc} onChange={e => setSubDesc(e.target.value)} />
                <input type="file" className="input" onChange={e => setFile(e.target.files[0])} />
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Work'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Bids Tab */}
      {activeTab === 'bids' && (
        <div className="space-y-4">
          {/* Place Bid — Students only on OPEN projects */}
          {isStudent && project.status === 'OPEN' && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Place Your Bid</h2>
              <form onSubmit={handleBid} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Bid Amount (₹)</label>
                    <input type="number" className="input" placeholder="5000" required min={1}
                      value={bidForm.bidAmount} onChange={e => setBidForm({...bidForm, bidAmount: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Delivery Days</label>
                    <input type="number" className="input" placeholder="7" min={1}
                      value={bidForm.deliveryDays} onChange={e => setBidForm({...bidForm, deliveryDays: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="label">Your Proposal</label>
                  <textarea className="input h-28 resize-none" placeholder="Explain why you're the best fit for this project..." required
                    value={bidForm.proposal} onChange={e => setBidForm({...bidForm, proposal: e.target.value})} />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                  {submitting ? 'Placing bid...' : 'Place Bid'}
                </button>
              </form>
            </div>
          )}

          {/* Bids list */}
          {bids.length === 0 ? (
            <div className="card text-center py-10"><p className="text-gray-400">No bids yet</p></div>
          ) : bids.map(bid => (
            <div key={bid.id} className={`card ${bid.status === 'ACCEPTED' ? 'border-2 border-green-300' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm">
                      {bid.student?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{bid.student?.name}</p>
                      <div className="flex items-center gap-1 text-xs text-yellow-600"><Star size={10} fill="currentColor" />{bid.student?.rating?.toFixed(1) || '0.0'}</div>
                    </div>
                    {bid.status === 'ACCEPTED' && <span className="badge-open">✅ Accepted</span>}
                    {bid.status === 'REJECTED' && <span className="badge-cancelled">Rejected</span>}
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{bid.proposal}</p>
                  <p className="text-xs text-gray-400 mt-2">{bid.deliveryDays} days · {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-green-600">₹{bid.bidAmount?.toLocaleString()}</div>
                  {isOwner && project.status === 'OPEN' && bid.status === 'PENDING' && (
                    <div className="mt-2 space-y-1">
                      <button onClick={() => handleAssign(bid.id)} className="btn-primary text-xs px-3 py-1.5 block w-full">Accept</button>
                      <button onClick={() => navigate(`/messages/${bid.student?.id}`)} className="btn-secondary text-xs px-3 py-1.5 block w-full">Message</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="card text-center py-10"><p className="text-gray-400">No submissions yet</p></div>
          ) : submissions.map(sub => (
            <div key={sub.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={sub.status === 'APPROVED' ? 'badge-completed' : sub.status === 'SUBMITTED' ? 'badge-review' : 'badge-cancelled'}>{sub.status}</span>
                    <p className="text-sm text-gray-500">{sub.student?.name}</p>
                  </div>
                  {sub.description && <p className="text-gray-600 text-sm">{sub.description}</p>}
                  {sub.fileUrl && <a href={`http://localhost:8080${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline mt-2 block">📎 {sub.fileName}</a>}
                  {sub.clientFeedback && <p className="text-sm text-gray-500 mt-2 italic">Feedback: {sub.clientFeedback}</p>}
                </div>
                {isOwner && sub.status === 'SUBMITTED' && (
                  <div className="space-y-1 flex-shrink-0">
                    <button onClick={() => handleReviewSubmission(sub.id, 'APPROVED')} className="btn-primary text-xs px-3 py-1.5 block">✅ Approve</button>
                    <button onClick={() => { const fb = prompt('Revision notes:'); if (fb) handleReviewSubmission(sub.id, 'REVISION_REQUESTED', fb); }} className="btn-secondary text-xs px-3 py-1.5 block">🔄 Request Revision</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
