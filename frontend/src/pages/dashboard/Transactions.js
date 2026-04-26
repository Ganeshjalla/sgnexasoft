import React, { useEffect, useState } from 'react';
import { paymentAPI } from '../../api/services';
import { format } from 'date-fns';

export default function Transactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentAPI.getMy().then(r => setPayments(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColors = { PENDING: 'text-yellow-600 bg-yellow-50', HELD: 'text-blue-600 bg-blue-50', RELEASED: 'text-green-600 bg-green-50', REFUNDED: 'text-orange-600 bg-orange-50', FAILED: 'text-red-600 bg-red-50' };

  const total = payments.filter(p => p.status === 'RELEASED').reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">{payments.length} transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm">Total Released</p>
          <p className="text-2xl font-bold mt-1">₹{total.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Held in Escrow</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            ₹{payments.filter(p => p.status === 'HELD').reduce((s, p) => s + p.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Total Transactions</p>
          <p className="text-2xl font-bold mt-1">{payments.length}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">💳</p>
          <p className="text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Transaction ID', 'Project', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.transactionId || `TXN-${p.id}`}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{p.projectTitle || `Project #${p.projectId}`}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">₹{p.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.createdAt ? format(new Date(p.createdAt), 'MMM dd, yyyy') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
