'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from '@/services/store/alertStore';
import {
  PaginatedPasswordResponse,
  PasswordRequest,
  usePasswordRequestsQuery,
  useResolvePasswordRequestMutation,
} from '@/services/passwordRequestService';

import PasswordRequestStats from './components/PasswordRequestStats';
import PasswordRequestTable from './components/PasswordRequestTable';
import PasswordResolveForm from './components/PasswordResolveForm';
import AgentViewModal from '../agent/components/AgentViewModal'; // Reuse existing Modal
import { useUpdateAgentMutation } from '@/services/agentService';
import Pagination from '@/components/Pagination';

export default function PasswordRequestPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const LIMIT = 5;

  // ─── States ─────────────────────────────────────────────────────────
  const [viewTarget, setViewTarget] = useState<PasswordRequest | null>(null);
  const [resolveTarget, setResolveTarget] = useState<PasswordRequest | null>(null);

  // ─── Queries ────────────────────────────────────────────────────────
  const { data: apiResponse, isLoading: loading } = usePasswordRequestsQuery(page, LIMIT, search, status);

  // ─── Data Extraction ───────────────────────────────────────────────
  const res = apiResponse as unknown as PaginatedPasswordResponse;
  const requests: PasswordRequest[] = res?.data?.requests || [];
  const metricsData = res?.data?.metrics;
  const paginationInfo = res?.data?.pagination;
  const resolveMutation = useResolvePasswordRequestMutation();

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleResolve = (id: number, newPassword: string) => {
    resolveMutation.mutate(
      { id: id, payload: { new_password: newPassword } },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(res.message || 'Request updated successfully.');
            setResolveTarget(null);
          } else {
            toast.error(res.error?.details || res.message || 'Failed to fetch request.');
          }
        }
      }
    )
  };


  return (
    <div className="max-w-5xl mx-auto py-6">
      <PasswordRequestStats metrics={metricsData} />

      {/* ── Status Dropdown and Searchbox ── */}
      <div className="flex justify-end items-center gap-3 mb-6 w-full">

        {/* 🌟 Status Dropdown Filter */}
        <div className="relative w-40 shrink-0">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full pl-4 pr-10 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none [-webkit-appearance:none] [-moz-appearance:none]"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px] tracking-widest">
            ▼
          </span>
        </div>

        {/* 🔍 Search Input Box */}
        <div className="relative w-full max-w-xs sm:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

      </div>

      <PasswordRequestTable
        requests={requests}
        loading={loading}
        search={search}
        onView={(req) => setViewTarget(req)}
        onResolve={(req) => setResolveTarget(req)}
      />
      
       {/* ── Pagination ── */}
        {!loading && (paginationInfo?.total ?? 0) > LIMIT && (
          <div className="w-full">
            <Pagination
              currentPage={page}
              totalCount={paginationInfo.total}
              pageSize={LIMIT}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}


      {/* View Request Modal (Agent Detail View) */}
      <AgentViewModal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        agent={viewTarget ? {
          agent_id: viewTarget.id,
          username: viewTarget.username,
          email: viewTarget.email,
          status: viewTarget.status,
          phone_no: viewTarget.phone_no,
          joined_date: viewTarget.created_at,
          is_deleted: false,
          is_email_verified: false,
        } : null}
      />

      <PasswordResolveForm
        isOpen={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        request={resolveTarget}
        onSubmit={handleResolve}
        isLoading={resolveMutation.isPending}
      />
    </div>
  );
}