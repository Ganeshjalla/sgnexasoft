import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../../api/services';
import toast from 'react-hot-toast';

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '', category: '', tags: '', skills: '' });
  const [loading, setLoading] = useState(false);

  const categories = ['Web Development', 'Mobile App', 'UI/UX Design', 'Data Science', 'Machine Learning', 'Backend', 'DevOps', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await projectAPI.create({ ...form, budget: parseFloat(form.budget), deadline: new Date(form.deadline).toISOString() });
      toast.success('Project posted successfully!');
      navigate(`/projects/${res.data.id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create project'); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Post a New Project</h1>
        <p className="text-gray-500 text-sm mt-1">Describe your project to attract the best students</p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Project Title *</label>
            <input className="input" placeholder="e.g., Build a React E-commerce Website" required
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input h-36 resize-none" placeholder="Describe your project in detail — requirements, deliverables, and expectations..." required
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Budget (₹) *</label>
              <input type="number" className="input" placeholder="5000" required min={1}
                value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
            </div>
            <div>
              <label className="label">Deadline *</label>
              <input type="datetime-local" className="input" required
                value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Required Skills (comma separated)</label>
            <input className="input" placeholder="React, Node.js, MySQL, Spring Boot"
              value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" placeholder="fullstack, web, urgent"
              value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {loading ? 'Posting...' : '🚀 Post Project'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
