'use client';

import React, { useState, useMemo } from 'react';
import { toast } from '@/services/store/alertStore';
import {
  useRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  Route,
} from '@/services/routeService';
import Modal from '@/components/Modal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import RouteForm from './components/RouterForm';
import RouteStats from './components/RouteStats';

// ─── Lucide Icons Import ───────────────────────────────────────────────────
import { Plus, Pencil, Trash2, ArrowRight, Search, Loader2 } from 'lucide-react';

export default function RoutePage() {
  const [search, setSearch] = useState('');

  // Modals visibility states
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Route | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);

  // ─── React Query Hooks ────────────────────────────────────────────────────
  const { data: apiResponse, isLoading: loading, error } = useRoutesQuery();
  const createMutation = useCreateRouteMutation();
  const updateMutation = useUpdateRouteMutation();
  const deleteMutation = useDeleteRouteMutation();

  // get data from api response
  const routes = apiResponse?.data || [];

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

  // ─── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return routes.filter(
      (r) =>
        r.departure_city.toLowerCase().includes(search.toLowerCase()) ||
        r.arrival_city.toLowerCase().includes(search.toLowerCase())
    );
  }, [routes, search]);

  return (
    <>
      <div className=" max-w-5xl mx-auto">
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
        <RouteStats totalCount={routes.length} filteredCount={filtered.length} />

        {/* ── Search ── */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city name…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[60px_1fr_40px_1fr_120px] items-center px-6 py-3 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">#</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departure</span>
            <span />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arrival</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</span>
          </div>

          {/* Loading View */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm">Loading routes…</span>
            </div>
          )}

          {/* Empty View */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <p className="text-sm font-medium">
                {search ? 'No routes match your search.' : 'No routes found.'}
              </p>
            </div>
          )}

          {/* Table Rows */}
          {!loading &&
            filtered.map((route, idx) => (
              <div
                key={route.route_id}
                className={`grid grid-cols-[60px_1fr_40px_1fr_120px] items-center px-6 py-4 transition hover:bg-slate-50 ${
                  idx < filtered.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span className="text-xs font-mono text-slate-400">#{route.route_id}</span>
                
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">{route.departure_city}</span>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">{route.arrival_city}</span>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditTarget(route)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(route)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
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