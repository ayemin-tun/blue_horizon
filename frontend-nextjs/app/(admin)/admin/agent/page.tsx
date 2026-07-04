'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from '@/services/store/alertStore';
import {
    Agent,
    AgentPayload,
    PaginatedAgentResponse,
    useAgentsQuery,
    useCreateAgentMutation,
    useUpdateAgentStatusMutation,
    useDeleteAgentMutation,
    useUpdateAgentMutation,
} from '@/services/agentService';

import AgentStats from './components/AgentStats';
import AgentTable from './components/AgentTable';
import AgentForm from './components/AgentForm';
import AgentViewModal from './components/AgentViewModal';
import Modal from '@/components/Modal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Pagination from '@/components/Pagination';

export default function AgentPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 5;

    // ─── Modal States ─────────────────────────────────────────────────────────
    const [showAdd, setShowAdd] = useState(false);
    const [viewTarget, setViewTarget] = useState<Agent | null>(null);
    const [editTarget, setEditTarget] = useState<Agent | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);

    const [status, setStatus] = useState('');

    // ─── React Query Hooks ────────────────────────────────────────────────────

    //Get Agent API CALL 
    const { data: apiResponse, isLoading: loading, error } = useAgentsQuery(page, LIMIT, search, status);
    const createMutation = useCreateAgentMutation();
    const updateStatusMutation = useUpdateAgentStatusMutation();
    const deleteMutation = useDeleteAgentMutation();
    const updateMutation = useUpdateAgentMutation();

    // ─── Type Cast Response ───────────────────────────────────────────────────
    const res = apiResponse as unknown as PaginatedAgentResponse;
    const agents: Agent[] = res?.data?.agents || [];
    const metricsData = res?.data?.metrics;
    const paginationInfo = res?.data?.pagination;

    // Loading state for any active mutation
    const formLoading =
        createMutation.isPending ||
        updateStatusMutation.isPending ||
        deleteMutation.isPending;

    // Error handling
    if (error) {
        toast.error(error.message || 'Failed to load agents.');
    }

    // ─── API handler  ──────────────────────────────────────────────

    //Create API CALL
    const handleCreate = (payload: AgentPayload) => {
        createMutation.mutate(payload, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(res.message || 'Agent created successfully.');
                    setShowAdd(false);
                } else {
                    toast.error(res.error?.details || res.message || 'Failed to create agent.');
                }
            },
        });
    };

    const handleUpdateAllData = (payload: AgentPayload) => {
        if (!editTarget) return;
        updateMutation.mutate(
            { id: editTarget.agent_id, payload: payload },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        toast.success(res.message || 'Agent updated successfully.');
                        setEditTarget(null);
                    } else {
                        toast.error(res.error?.details || res.message || 'Failed to update agent.');
                    }
                },
            }
        );
    };

    //Status Update
    const handleStatusUpdate = (newStatus: string) => {
        if (!editTarget) return;
        updateStatusMutation.mutate(
            { id: editTarget.agent_id, payload: { status: newStatus } },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        toast.success(res.message || 'Agent status updated successfully.');
                        setEditTarget(null);
                    } else {
                        toast.error(res.error?.details || res.message || 'Failed to update status.');
                    }
                },
            }
        );
    };

    //Delete
    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.agent_id, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(res.message || 'Agent deleted successfully.');
                    setDeleteTarget(null);
                } else {
                    toast.error(res.error?.details || res.message || 'Failed to delete agent.');
                }
            },
        });
    };

    return (
        <>
            <div className="max-w-5xl mx-auto">
                {/* ── Header ── */}
                <div className="mb-8 flex  sm:flex-row justify-end gap-4 ">
                    
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95 w-32"
                    >
                        <Plus className="w-4 h-4" />
                        Add Agent
                    </button>
                </div>

                {/* ── Stats Strip ── */}
                <AgentStats metrics={metricsData} />

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
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
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
                            placeholder="Search by username or email…"
                            className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                </div>

                {/* ── Table ── */}
                <AgentTable
                    agents={agents}
                    loading={loading}
                    search={search}
                    onView={(agent) => setViewTarget(agent)}
                    onUpdate={(agent) => setEditTarget(agent)}
                    onDelete={(agent) => setDeleteTarget(agent)}
                />

                {/* ── Pagination ── */}
                {!loading && paginationInfo?.total && paginationInfo.total > LIMIT && (
                    <div className="w-full">
                        <Pagination
                            currentPage={page}
                            totalCount={paginationInfo.total}
                            pageSize={LIMIT}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    </div>
                )}
            </div>

            {/* ── Add Agent Modal ── */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Agent">
                <AgentForm
                    onSubmit={handleCreate}
                    isCreateMode={true}
                    onCancel={() => setShowAdd(false)}
                    loading={formLoading}
                    submitLabel="Create Agent"
                />
            </Modal>

            <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Update Agent Information">
                <AgentForm
                    initialData={editTarget} 
                    onSubmit={handleUpdateAllData}
                    onCancel={() => setEditTarget(null)}
                    loading={updateStatusMutation.isPending}
                    submitLabel="Update Agent"
                />
            </Modal>

            {/* ── View Agent Modal ── */}
            <AgentViewModal
                isOpen={!!viewTarget}
                agent={viewTarget}
                onClose={() => setViewTarget(null)}
            />

            {/* ── Delete Confirm Modal ── */}
            <ConfirmDeleteModal
                isOpen={!!deleteTarget}
                title="Delete Agent"
                message="Are you sure you want to delete this agent?"
                itemName={deleteTarget ? `${deleteTarget.username} (${deleteTarget.email})` : ''}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteMutation.isPending}
            />
        </>
    );
}