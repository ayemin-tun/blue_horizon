"use client";

import { useState } from "react";
import AgentViewModal from "../../agent/components/AgentViewModal";
import { usePasswordRequestsQuery, useResolvePasswordRequestMutation, PasswordRequest } from "@/services/passwordRequestService";

export default function PasswordRequestTable() {
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedRequest, setSelectedRequest] = useState<PasswordRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetching live data from Python Backend using React Query
  const { data, isLoading, isError } = usePasswordRequestsQuery(page, limit, search, activeTab);
  
  // Mutation for updating password request status
  const resolveMutation = useResolvePasswordRequestMutation();

  const requests = data?.data?.requests || [];
  const totalEntries = data?.data?.pagination?.total || 0;

  const handleViewDetail = (req: PasswordRequest) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleResolve = async (id: number) => {
    if (confirm("Are you sure you want to mark this request as resolved?")) {
      await resolveMutation.mutateAsync(id);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Search & Tab Filter Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button 
            onClick={() => { setActiveTab("pending"); setPage(1); }}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === "pending" ? "bg-white text-blue-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            Pending Requests
          </button>
          <button 
            onClick={() => { setActiveTab("resolved"); setPage(1); }}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === "resolved" ? "bg-white text-blue-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            Resolved Requests
          </button>
        </div>

        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-72 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"/>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Agent Name</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Requested Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading requests from server...</td></tr>
            ) : isError ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-red-500">Failed to load server data.</td></tr>
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{req.username}</td>
                  <td className="px-6 py-4">{req.email}</td>
                  <td className="px-6 py-4 text-slate-500">{req.created_at}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${req.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <button
                      onClick={() => handleViewDetail(req)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
                      View Detail
                    </button>
                    {req.status === "pending" && (
                      <button 
                        onClick={() => handleResolve(req.id)}
                        disabled={resolveMutation.isPending}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-800 rounded hover:bg-blue-950 transition-colors disabled:opacity-50">
                        {resolveMutation.isPending ? "Resolving..." : "Resolve"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Layout */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100 text-sm text-slate-500">
        <span>Showing {requests.length} of {totalEntries} entries</span>
        <div className="flex gap-2">
          <button 
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-slate-50 border border-slate-200 rounded disabled:opacity-50">
            Previous
          </button>
          <button 
            onClick={() => setPage((prev) => (requests.length === limit ? prev + 1 : prev))}
            disabled={requests.length < limit}
            className="px-3 py-1 bg-slate-50 border border-slate-200 rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      {/* Aye Chan's Agent View Modal integration */}
      <AgentViewModal 
        isOpen={isModalOpen}
        agent={selectedRequest ? {
          agent_id: selectedRequest.agent_id,
          username: selectedRequest.username,
          email: selectedRequest.email,
          status: "ACTIVE",
          phone_no: "N/A",
          joined_date: selectedRequest.created_at
        } as any : null}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }} 
      />
    </div>
  );
}