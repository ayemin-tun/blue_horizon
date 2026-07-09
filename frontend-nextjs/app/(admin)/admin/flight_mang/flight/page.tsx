'use client';

import { ApiResponse, Flight, FlightPayload, PaginatedFlightResponse, useCreateFlightMutation, useDeleteFlightMutation, useFlightsQuery, useUpdateFlightMutation } from "@/services/flightService";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import FlightStats from "./components/FlightStats";
import FlightTable from "./components/FlightTable";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { toast } from "@/services/store/alertStore";
import Modal from "@/components/Modal";
import FlightForm from "./components/FlightForm";
import Pagination from "@/components/Pagination";

export default function FlightPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 5;

    // modal state
    const [showAdd, setShowAdd] = useState(false);

    const [editTarget, setEditTarget] = useState<Flight | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Flight | null>(null);

    const { data: apiResponse, isLoading: loading, error } = useFlightsQuery(page, LIMIT, search);
    const deleteMutation = useDeleteFlightMutation();
    const updateMutation = useUpdateFlightMutation();
    const createMutation = useCreateFlightMutation();

    const formLoading =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;

    // Error handling
    if (error) {
        toast.error(error.message || 'Failed to load Flights.');
    }
    // Type casting
    const res = apiResponse as unknown as PaginatedFlightResponse;
    const flights: Flight[] = res?.data?.flights || [];
    const metricsData = res?.data?.metrics;
    const paginationInfo = res?.data?.pagination;

    // 🌟 Action Handlers

    const handleCreate = (payload: FlightPayload) => {
        createMutation.mutate(payload, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(res.message || 'Flight created successfully.');
                    setShowAdd(false);
                } else {
                    toast.error(res.error?.details || res.message || 'Failed to create flight.');
                }
            },
        });
    };

    const handleUpdate = (payload: FlightPayload) => {
        if (!editTarget) return;
        updateMutation.mutate(
            { id: editTarget.flight_id, payload: payload },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        toast.success(res.message || 'Flight updated successfully.');
                        setEditTarget(null);
                    } else {
                        toast.error(res.error?.details || res.message || 'Failed to update flight.');
                    }
                },
            }
        );
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.flight_id, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(res.message || 'Flight deleted successfully.');
                    setDeleteTarget(null);
                } else {
                    toast.error(res.error?.details || res.message || 'Failed to delete flight.');
                }
            },
        });
    };
    return (
        <div className="max-w-5xl mx-auto">
            {/* ── Header ── */}
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h4 className="text-xl font-bold text-gray-950">Flight Management</h4>
                    <p className="md:text-sm text-xs text-gray-500 mt-1 ">
                        Manage all registered flight in the Blue Horizon system.
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="inline-flex items-center gap-2 shrink-0 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Flight
                </button>
            </div>
            {/* Stats */}
            <FlightStats metrics={metricsData} />

            {/* ── Search ── */}
            <div className="flex justify-end mb-6">
                <div className="relative w-full max-w-md">
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
                        placeholder="Search by Flight No"
                        className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {/* Flight table */}
            <FlightTable
                flights={flights}
                loading={loading}
                search={search}
                onUpdate={(flight) => setEditTarget(flight as any)}
                onDelete={(flight) => setDeleteTarget(flight as any)}
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
            {/* ── Add Flight Modal ── */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Flight">
                <FlightForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowAdd(false)}
                    loading={formLoading}
                    submitLabel="Create Flight"
                />
            </Modal>

            {/* flight edit form  */}
            <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Update Flight Information">
                <FlightForm
                    initialData={editTarget}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditTarget(null)}
                    loading={updateMutation.isPending}
                    submitLabel="Update Flight"
                />
            </Modal>

            {/* ── Delete Confirm Modal ── */}
            <ConfirmDeleteModal
                isOpen={!!deleteTarget}
                title="Delete Flight"
                message="Are you sure you want to delete this flight?"
                itemName={deleteTarget ? `${deleteTarget.flight_no}(${deleteTarget.airline?.airline_name} - ${deleteTarget.airline?.country} )` : ''}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteMutation.isPending}
            />


        </div>
    )
}