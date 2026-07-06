'use client';

import { useState } from 'react';
import PasswordRequestStats from './components/PasswordRequestStats';
import PasswordRequestTable from './components/PasswordRequestTable';
import PasswordResolveForm from './components/PasswordResolveForm';
import AgentViewModal from '../agent/components/AgentViewModal'; 
import { usePasswordRequestsQuery, useResolvePasswordRequestMutation, PasswordRequest } from '@/services/passwordRequestService';
import { ChevronDown, Search } from 'lucide-react';

export default function PasswordRequestPage() {
 
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [viewRequest, setViewRequest] = useState<PasswordRequest | null>(null);
  const [resolveRequest, setResolveRequest] = useState<PasswordRequest | null>(null);

 
  const apiStatus = statusFilter === 'ALL' ? '' : statusFilter;
  const { data, isLoading } = usePasswordRequestsQuery(page, limit, search, apiStatus);
  const resolveMutation = useResolvePasswordRequestMutation();

  const requests = data?.data?.requests || [];
  const metrics = data?.data?.metrics;
  const totalItems = data?.data?.pagination?.total_items || 0;

  const handleResolveSubmit = async (id: number, newPassword: string) => {
    try {
    
      alert("Password updated successfully!");
      setResolveRequest(null);
    } catch (err) {
      alert("Failed to reset password.");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password Requests</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and resolve agent password reset requests.</p>
      </div>

      <PasswordRequestStats metrics={metrics} />

      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Status Dropdown */}
        <div className="relative w-full sm:w-40">
          <select
            value={statusFilter}
            onChange={(e) => { 
              setStatusFilter(e.target.value as 'ALL' | 'PENDING' | 'RESOLVED'); 
              setPage(1); 
            }}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium cursor-pointer transition hover:bg-slate-100"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-[320px]">
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10 text-slate-700 transition"
          />
          <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
        </div>

      </div>

      <PasswordRequestTable 
        requests={requests} loading={isLoading} search={search}
        onView={setViewRequest} onResolve={setResolveRequest}
      />

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-sm text-slate-500">
        <span>Showing {requests.length} of {totalItems} entries</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 font-medium border border-slate-200 rounded-lg disabled:opacity-50 transition">Previous</button>
          <button onClick={() => setPage(p => p + 1)} disabled={requests.length < limit} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 font-medium border border-slate-200 rounded-lg disabled:opacity-50 transition">Next</button>
        </div>
      </div>

      <PasswordResolveForm 
        isOpen={!!resolveRequest} 
        onClose={() => setResolveRequest(null)} 
        request={resolveRequest} 
        onSubmit={handleResolveSubmit} 
        isLoading={resolveMutation.isPending} 
      />

      <AgentViewModal 
        isOpen={!!viewRequest}
        agent={viewRequest ? { agent_id: viewRequest.id, username: viewRequest.username, email: viewRequest.email, status: viewRequest.status, phone_no: '-', joined_date: viewRequest.created_at } as any : null}
        onClose={() => setViewRequest(null)} 
      />
    </div>
  );
}