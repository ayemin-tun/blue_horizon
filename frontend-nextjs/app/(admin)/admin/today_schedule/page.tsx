'use client';
import { InstanceUpdatePayload, PaginatedInstanceResponse, ScheduleInstance, useInstancesQuery, useUpdateInstanceMutation } from "@/services/scheduleInstanceService";
import { useState } from "react";
import InstanceStats from "./components/InstanceStats";
import { Search } from "lucide-react"; 
import { FilterModal } from "@/components/FilterModal";
import { ActiveFilters } from "@/components/ActiveFilter";
import InstanceTable from "./components/InstanceTable";
import Pagination from "@/components/Pagination";
import RouteFilter from "../flight_mang/schedule/components/RouteFilter";
import InstanceViewModal from "./components/InstanceViewModal";
import UpdateInstanceForm from "./components/UpdateInstanceForm";
import Modal from "@/components/Modal";
import { toast } from "@/services/store/alertStore";

export default function SchedulePage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 5;

    const formatDateForApi = (dateStr: string) => {
        if (!dateStr) return undefined;
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    // ─── Filter States  ──────────────────────────────────
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [routeId, setRouteId] = useState<number | undefined>(undefined);

    const [editTarget, setEditTarget] = useState<ScheduleInstance | null>(null);

    const [viewTarget, setViewTarget] = useState<ScheduleInstance | null>(null);

    const { data: apiResponse, isLoading: loading, error } = useInstancesQuery(
        page, LIMIT, search, routeId, status, formatDateForApi(fromDate), 
        formatDateForApi(toDate)    
    );

    const activeFilters = [
        routeId && { label: `Route: ${routeId}`, onRemove: () => setRouteId(undefined) },
        status && { label: status, onRemove: () => setStatus(undefined) },
        (fromDate || toDate) && { label: `${fromDate || '...'} to ${toDate || '...'}`, onRemove: () => { setFromDate(''); setToDate(''); } },
        search && { label: `"${search}"`, onRemove: () => setSearch('') }
    ].filter(Boolean) as { label: string, onRemove: () => void }[];

    const res = apiResponse as unknown as PaginatedInstanceResponse;
    const instances: ScheduleInstance[] = res?.data?.instances || [];
    const metricsData = res?.data?.metrics;
    const paginationInfo = res?.data?.pagination;
    const today = new Date().toISOString().split('T')[0];
    const updateMutation = useUpdateInstanceMutation();
    const handleUpdate = (payload: InstanceUpdatePayload) => {
        if (!editTarget) return;
        updateMutation.mutate(
            { id: editTarget.instance_id, payload: payload },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        toast.success(res.message || 'Schedule Instance updated successfully.');
                        setEditTarget(null);
                    } else {
                        toast.error(res.error?.details || res.message || 'Failed to update Schedule.');
                    }
                },
            }
        );
    };
    return (
        <div className="max-w-5xl mx-auto py-6">

            {/* Stats */}
            <InstanceStats metrics={metricsData} />

            {/* ── Filter & Search Bar ── */}
            <div className="flex justify-end items-center gap-3 mb-6 w-full relative">

                <div className="relative">
                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilterMenu(true)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-xl transition ${(status || routeId || fromDate) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                        Filters
                        {(status || routeId || fromDate || toDate) && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block" />}
                    </button>

                    {/* 🌟 REUSABLE MODAL */}
                    <FilterModal
                        isOpen={showFilterMenu}
                        onClose={() => setShowFilterMenu(false)}
                        hasActiveFilters={!!(status || routeId || fromDate || toDate)}
                        onClear={() => {
                            setStatus(undefined); setRouteId(undefined); setFromDate(''); setToDate(''); setSearch(''); setPage(1);
                        }}
                    >
                        {/* Filter Content */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-500">Route</label>
                                <RouteFilter value={routeId as any} onChange={(val) => { setRouteId(val); setPage(1); }} />
                            </div>

                            <div className="relative shrink-0">
                                <label className="block text-xs font-semibold text-slate-500 mb-3">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full pl-4 pr-10 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none [-webkit-appearance:none] [-moz-appearance:none]"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="SCHEDULED">SCHEDULED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>

                                <span className="absolute right-4 top-2/3 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px] tracking-widest">
                                    ▼
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-semibold text-slate-500">From</label>
                                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full pl-4 pr-10 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none [-webkit-appearance:none] [-moz-appearance:none]" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-semibold text-slate-500">To</label>
                                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full pl-4 pr-10 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none [-webkit-appearance:none] [-moz-appearance:none]" />
                                </div>
                            </div>
                        </div>
                    </FilterModal>
                </div>

                {/* 🔍 Search Input Box */}
                <div className="relative w-full max-w-xs">
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
                        placeholder="Search by Flight number"
                        className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {/* Schedule is for today */}
            {!activeFilters.length && !search && (
                <div className="text-xs text-slate-500 mb-4">
                    Showing schedules for: <span className="font-bold text-slate-900">{today}</span>
                </div>
            )}

            {/* Filter text  */}
            <ActiveFilters items={activeFilters} />

            <InstanceTable
                instances={instances}
                loading={loading}
                search={search}
                onView={(instances) => setViewTarget(instances)}
                onEdit={(instances) => setEditTarget(instances)}
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

            {/* Schedule View modal */}
            <InstanceViewModal
                isOpen={viewTarget !== null}
                instance={viewTarget}
                onClose={() => setViewTarget(null)}
            />

            {/* flight edit form  */}
            <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Update Schedule Information" maxWidth="3xl">
                <UpdateInstanceForm
                    initialData={editTarget}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditTarget(null)}
                    loading={updateMutation.isPending}
                />
            </Modal>

        </div>
    )
}