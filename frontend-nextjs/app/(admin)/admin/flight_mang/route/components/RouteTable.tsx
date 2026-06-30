'use client';

import React from 'react';
import { Route } from '@/services/routeService';
import { ArrowRight, Pencil, Trash2, Loader2 } from 'lucide-react';

interface RouteTableProps {
  routes: Route[];
  loading: boolean;
  search: string;
  onEdit: (route: Route) => void;
  onDelete: (route: Route) => void;
}

export default function RouteTable({ routes, loading, search, onEdit, onDelete }: RouteTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Header */}
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
      {!loading && routes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <p className="text-sm font-medium">
            {search ? 'No routes match your search.' : 'No routes found.'}
          </p>
        </div>
      )}

      {/* Table Rows */}
      {!loading &&
        routes.map((route, idx) => ( 
          <div
            key={route.route_id}
            className={`grid grid-cols-[60px_1fr_40px_1fr_120px] items-center px-6 py-4 transition hover:bg-slate-50 ${
              idx < routes.length - 1 ? 'border-b border-slate-100' : ''
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

            {/* Edit Button */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => onEdit(route)}
                className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition"
              >
                <Pencil className="w-4 h-4" />
              </button>

              {/* Delete Button */}
              <button
                onClick={() => onDelete(route)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}