'use client';
import { PaginatedScheduleResponse, Schedule, SchedulePayload, useCreateScheduleMutation, useDeleteScheduleMutation, useSchedulesQuery, useUpdateScheduleMutation } from "@/services/scheduleService";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import ScheduleStats from "./components/ScheduleStats";
import ScheduleTable from "./components/ScheduleTable";
import Pagination from "@/components/Pagination";
import ScheduleViewModal from "./components/ScheduleViewModdal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { toast } from "@/services/store/alertStore";
import RouteFilter from "./components/RouteFilter";
import Modal from "@/components/Modal";
import ScheduleForm from "./components/ScheduleForm";

export default function SchedulePage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 5;

    // ─── Modal States ─────────────────────────────────────────────────────────
    const [showAdd, setShowAdd] = useState(false);
    const [viewTarget, setViewTarget] = useState<Schedule | null>(null);
    const [editTarget, setEditTarget] = useState<Schedule | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);

    const [routeId, setRouteId] = useState('');
    const [flightType, setFlightType] = useState('');

    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // ─── React Query Hooks ────────────────────────────────────────────────────

    //Get Schedule API CALL 
    const { data: apiResponse, isLoading: loading, error } = useSchedulesQuery(page, LIMIT, search, routeId as any, flightType || undefined);
    const createMutation = useCreateScheduleMutation();
    const updateMutation = useUpdateScheduleMutation();
    const deleteMutation = useDeleteScheduleMutation();

    const formLoading =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;

    // Error handling
    if (error) {
        toast.error(error.message || 'Failed to load Schedule.');
    }

    const res = apiResponse as unknown as PaginatedScheduleResponse;
    const schedules: Schedule[] = res?.data?.schedules || [];
    const metricsData = res?.data?.metrics;
    const paginationInfo = res?.data?.pagination;

    // API CALL
    const handleCreate = (payload: SchedulePayload) => {
        createMutation.mutate(payload, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(res.message || 'Schedule created successfully.');
                    setShowAdd(false);
                } else {
                    toast.error(res.error?.details || res.message || 'Failed to create Schedule.');
                }
            },
        });
    };

    const handleUpdate = (payload: SchedulePayload) => {
        if (!editTarget) return;
        updateMutation.mutate(
            { id: editTarget.schedule_id, payload: payload },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        toast.success(res.message || 'Schedule updated successfully.');
                        setEditTarget(null);
                    } else {
                        toast.error(res.error?.details || res.message || 'Failed to update Schedule.');
                    }
                },
            }
        );
    };
    //Delete
    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.schedule_id, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(res.message || 'Schedule deleted successfully.');
                    setDeleteTarget(null);
                } else {
                    toast.error(res.error?.details || res.message || 'Failed to delete Schedule.');
                }
            },
        });
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* ── Header ── */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h4 className="text-xl font-bold text-gray-950">Schedule Management</h4>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage Schedule for Blue Horizon flights.
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Schedule
                </button>
            </div>

            {/* ── Stats Strip ── */}
            <ScheduleStats metrics={metricsData} />

            {/* ── Status Dropdown and Searchbox ── */}
            <div className="flex justify-end items-center gap-3 mb-6 w-full relative">

                {/*  Filter Popover Container */}
                <div className="relative">
                    {/* Filter Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-xl transition ${routeId || flightType
                            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' // Filter တစ်ခုခုရှိနေရင် active color ပြရန်
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                        Filters
                        {(routeId || flightType) && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block" />
                        )}
                    </button>
                    {/* Dropdown Box (Mobile: Bottom Sheet / Desktop: Right-aligned Popover) */}
                    {showFilterMenu && (
                        <>
                            {/* Backdrop click close */}
                            <div className="fixed inset-0 z-40 bg-slate-950/20 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none" onClick={() => setShowFilterMenu(false)} />
                            <div className="fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-3xl bg-white p-6 shadow-2xl border-t border-slate-100 
                        animate-in slide-in-from-bottom duration-200
                        sm:absolute sm:bottom-auto sm:top-full sm:left-auto sm:right-0 sm:w-72 sm:rounded-2xl sm:border sm:p-4 sm:shadow-xl sm:animate-in sm:fade-in sm:slide-in-from-top-2">

                                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

                                <div className="flex justify-between items-center pb-3 border-b border-slate-100 sm:pb-2">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter Options</span>
                                    {(routeId || flightType) && (
                                        <button
                                            onClick={() => {
                                                setRouteId('');
                                                setFlightType('');
                                                setPage(1);
                                            }}
                                            className="text-[11px] font-semibold text-blue-600 hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4 pt-3 sm:pt-0 sm:space-y-4 sm:mt-4">

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-500">Route</label>
                                        <RouteFilter
                                            value={routeId}
                                            onChange={(val) => {
                                                setRouteId(val);
                                                setPage(1);
                                            }}
                                        />
                                    </div>

                                    {/* ✈️ Flight Type Filter Section */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-500">Flight Type</label>
                                        <div className="relative">
                                            <select
                                                value={flightType || ""}
                                                onChange={(e) => {
                                                    setFlightType(e.target.value || '');
                                                    setPage(1);
                                                }}
                                                className="w-full px-3 py-2.5 sm:py-2 text-sm text-slate-900 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none"
                                            >
                                                <option value="">All Flight Types</option>
                                                <option value="OUTBOUND">OUTBOUND</option>
                                                <option value="INBOUND">INBOUND</option>
                                            </select>
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
                                        </div>
                                    </div>


                                    <button
                                        type="button"
                                        onClick={() => setShowFilterMenu(false)}
                                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition sm:hidden mt-2"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
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

            <ScheduleTable
                schedules={schedules}
                loading={loading}
                search={search}
                onView={(schedule) => setViewTarget(schedule)}
                onUpdate={(schedule) => setEditTarget(schedule)}
                onDelete={(schedule) => setDeleteTarget(schedule)}
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
            <ScheduleViewModal
                isOpen={viewTarget !== null}
                schedule={viewTarget}
                onClose={() => setViewTarget(null)}
            />

            {/* ── Add Flight Modal ── */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Schedule" maxWidth="3xl">
                <ScheduleForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowAdd(false)}
                    loading={formLoading}
                    submitLabel="Create Schedule"
                />
            </Modal>

            {/* flight edit form  */}
            <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Update Schedule Information" maxWidth="3xl">
                <ScheduleForm
                    initialData={editTarget}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditTarget(null)}
                    loading={updateMutation.isPending}
                    submitLabel="Update Schedule"
                />
            </Modal>

            {/* ── Delete Confirm Modal ── */}
            <ConfirmDeleteModal
                isOpen={!!deleteTarget}
                title="Delete Schedule"
                message="Are you sure you want to delete this flight schedule?"
                itemName={
                    deleteTarget ? (
                        <div>
                            <div>{deleteTarget.route_details}</div>
                            <div>({deleteTarget.departure_time} - {deleteTarget.arrival_time})</div>
                            <div>{deleteTarget.flight_no} ({deleteTarget.airline_name})</div>
                        </div>
                    ) : ''
                }
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteMutation.isPending}
            />
        </div>

    )
}