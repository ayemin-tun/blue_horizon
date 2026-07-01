'use client';

import React from 'react';
import { Route } from '@/services/routeService'; 
import { Pencil, Trash2, Loader2, ArrowRight } from 'lucide-react';

interface RouteTableProps {
  routes: Route[]; 
  loading: boolean;
  search: string;
  onEdit: (route: Route) => void;
  onDelete: (route: Route) => void;
}

export default function RouteTable({ 
  routes = [], 
  loading, 
  search, 
  onEdit, 
  onDelete 
}: RouteTableProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Table Header */}
      <div className="flex items-center px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="w-16 shrink-0">#</div>
        <div className="flex-1 min-w-[150px]">Departure City</div>
        <div className="w-12 shrink-0 text-center"></div>
        <div className="flex-1 min-w-[150px]">Arrival City</div>
        <div className="w-24 shrink-0 text-right">Actions</div>
      </div>

      {/* Loading View */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading Routes...</span>
        </div>
      )}

      {/* Empty View */}
      {!loading && routes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="text-sm font-medium">
            {search ? 'No routes match your search.' : 'No routes found.'}
          </p>
        </div>
      )}

      {/* Table Body Rows */}
      {!loading && routes.length > 0 && (
        <div className="divide-y divide-slate-100">
          {routes.map((route, idx) => {
            const rowKey = route.route_id ? `route-${route.route_id}` : `route-idx-${idx}`;
            
            return (
              <div
                key={rowKey}
                className="flex items-center px-6 py-4 transition hover:bg-slate-50/50"
              >
                {/* ၁။ ID */}
                <div className="w-16 shrink-0 text-xs font-mono text-slate-400">
                  #{route.route_id}
                </div>
                
                {/* ၂။ Departure City */}
                <div className="flex-1 min-w-[150px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">
                    {route.departure_city}
                  </span>
                </div>

                {/* ၃။ Arrow Icon */}
                <div className="w-12 shrink-0 flex justify-center text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </div>

                {/* ၄။ Arrival City */}
                <div className="flex-1 min-w-[150px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">
                    {route.arrival_city}
                  </span>
                </div>

                {/* ၅။ Actions */}
                <div className="w-24 shrink-0 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onEdit(route)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                    title="Edit Route"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(route)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                    title="Delete Route"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}