'use client';

import React, { useState, useMemo } from 'react';
import { toast } from '@/services/store/alertStore';
import {
  useRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  Route,
  PaginatedRouteResponse, // for type checking
} from '@/services/routeService';
import Modal from '@/components/Modal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import RouteForm from './components/RouterForm';
import RouteStats from './components/RouteStats';
import Pagination from '@/components/Pagination';
import RouteTable from './components/RouteTable';

// ─── Lucide Icons Import ───────────────────────────────────────────────────
import { Plus, Pencil, Trash2, ArrowRight, Search, Loader2 } from 'lucide-react';

export default function RoutePage() {
  const [search, setSearch] = useState('');

  // ─── Pagination States ───────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const LIMIT = 5;

  // Modals visibility states
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Route | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);

  // ─── React Query Hooks ────────────────────────────────────────────────────
  const { data: apiResponse, isLoading: loading, error } = useRoutesQuery(page, LIMIT, search);
  const createMutation = useCreateRouteMutation();
  const updateMutation = useUpdateRouteMutation();
  const deleteMutation = useDeleteRouteMutation();

  //  (Type Casting)
  const res = apiResponse as unknown as PaginatedRouteResponse;

  const routes: Route[] = res?.data || [];
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
          toast.success(res.message || 'Route created successfully.');
          setShowAdd(false);
        } else {
          toast.error(res.error?.details || res.message || 'Failed to create route.');
        }
      },
    });
  };

  const handleUpdate = (payload: any) => {
    if (!editTarget) return;
    updateMutation.mutate(
      { id: editTarget.route_id, payload },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(res.message || 'Route updated successfully.');
            setEditTarget(null);
          } else {
            toast.error(res.error?.details || res.message || 'Failed to update route.');
          }
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.route_id, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success(res.message || 'Route deleted.');
          setDeleteTarget(null);
        } else {
          toast.error(res.error?.details || res.message || 'Failed to delete route.');
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
            <h4 className="text-xl font-bold text-gray-950">Route Management</h4>
            <p className="text-sm text-gray-500 mt-1">
              Manage departure and arrival city routes for Blue Horizon flights.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Route
          </button>
        </div>

        {/* ── Stats Strip ── */}


        <RouteStats
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
              placeholder="Search by city name"
              className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>


        {/* ── Table ── */}
        <RouteTable
          routes={routes}
          loading={loading}
          search={search}
          onEdit={(route) => setEditTarget(route)}
          onDelete={(route) => setDeleteTarget(route)}
        />

        {/* ── Pagination ── */}
        {!loading && paginationInfo && (
          <Pagination
            currentPage={page}
            totalCount={paginationInfo.total}
            pageSize={LIMIT}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>

      {/* ── Add Modal ── */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Route">
        <RouteForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          loading={formLoading}
          submitLabel="Create Route"
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Route">
        {editTarget && (
          <RouteForm
            initialData={{ departure_city: editTarget.departure_city, arrival_city: editTarget.arrival_city }}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
            loading={formLoading}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        route={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={formLoading}
      />
    </>
  );
}