'use client';

import React, { useState, useMemo } from 'react';
import { toast } from '@/services/store/alertStore';
import {
  useAirlinesQuery,
  useCreateAirlineMutation,
  useUpdateAirlineMutation,
  useDeleteAirlineMutation,
  Airline,
  PaginatedAirlineResponse,
} from '@/services/airlineService';
import Modal from '@/components/Modal';
import AirlineForm from '@/app/(admin)/admin/flight_mang/airline/components/AirlineForm';
import AirlineStats from '@/app/(admin)/admin/flight_mang/airline/components/AirlineStats';
import Pagination from '@/components/Pagination';
import AirlineTable from '@/app/(admin)/admin/flight_mang/airline/components/AirlineTable';
import ConfirmDeleteAirlineModal from '@/components/ConfirmDeleteModal';
// ─── Lucide Icons Import ───────────────────────────────────────────────────
import { Plus, Search } from 'lucide-react';

export default function AdminAirlinesPage() {
  const [search, setSearch] = useState('');

  // ─── Pagination States ───────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const LIMIT = 5;

  // Modals visibility states
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Airline | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Airline | null>(null);

  // ─── React Query Hooks ────────────────────────────────────────────────────
  const { data: apiResponse, isLoading: loading, error } = useAirlinesQuery(page, LIMIT,search);
  const createMutation = useCreateAirlineMutation();
  const updateMutation = useUpdateAirlineMutation();
  const deleteMutation = useDeleteAirlineMutation();

  //  (Type Casting)
  const res = apiResponse as unknown as PaginatedAirlineResponse;

  const airlines: Airline[] = res?.data || [];
  const paginationInfo = res?.pagination;


  // made form loading when one mutation is working
  const formLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Error handle logic
  if (error) {
    toast.error(error.message || 'Failed to load data');
  }

  // ─── API Actions ──────────────────────────────────────────────────────────────
  const handleCreate = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success(res.message || 'Airline created successfully.');
          setShowAdd(false);
        } else {
          toast.error(res.error?.details || res.message || 'Failed to create airline.');
        }
      },
    });
  };

  const handleUpdate = (payload: any) => {
    if (!editTarget) return;
    updateMutation.mutate(
      { id: editTarget.airline_id, payload },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(res.message || 'Airline updated successfully.');
            setEditTarget(null);
          } else {
            toast.error(res.error?.details || res.message || 'Failed to update airline.');
          }
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.airline_id, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success(res.message || 'Airline deleted.');
          setDeleteTarget(null);
        } else {
          toast.error(res.error?.details || res.message || 'Failed to delete airline.');
        }
      },
    });
  };

  return (
    <>
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-xl font-bold text-gray-950">Airlines Management</h4>
            <p className="text-sm text-gray-500 mt-1">
              Manage all registered airlines in the Blue Horizon system.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Airline
          </button>
        </div>

        {/* ── Stats Strip ── */}
        <AirlineStats
          totalCount={paginationInfo?.total || 0}
          filteredCount={paginationInfo?.total || 0}
        />

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
              placeholder="Search by airline name or country…"
              className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <AirlineTable
          airlines={airlines}
          loading={loading}
          search={search}
          onEdit={(airline) => setEditTarget(airline)}
          onDelete={(airline) => setDeleteTarget(airline)}
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

      {/* ── Add Modal ── */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Airline">
        <AirlineForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          loading={formLoading}
          submitLabel="Create Airline"
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Airline">
        {editTarget && (
          <AirlineForm
            initialData={{ airline_name: editTarget.airline_name, country: editTarget.country }}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
            loading={formLoading}
            submitLabel="Save Changes"
          />
        )}
      </Modal>


    </>
  );
}
