'use client';

import React from 'react';
import { Airline } from '@/services/airlineService'; 
import { Pencil, Trash2, Loader2 } from 'lucide-react';

interface AirlineTableProps {
  airlines: Airline[];
  loading: boolean;
  search: string;
  onEdit: (airline: Airline) => void;
  onDelete: (airline: Airline) => void;
}

export default function AirlineTable({ 
  airlines = [], 
  loading, 
  search, 
  onEdit, 
  onDelete 
}: AirlineTableProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      <div className="flex items-center px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="w-16 shrink-0">#</div>
        <div className="flex-1 min-w-[200px]">Airline Name</div>
        <div className="flex-1 min-w-[150px]">Country</div>
        <div className="w-24 shrink-0 text-right">Actions</div>
      </div>

      {/* ─── Loading View ─── */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading Airlines...</span>
        </div>
      )}

      {/* ─── Empty View ─── */}
      {!loading && airlines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="text-sm font-medium">
            {search ? 'No airlines match your search.' : 'No airlines found.'}
          </p>
        </div>
      )}

      {!loading && airlines.length > 0 && (
        <div className="divide-y divide-slate-100">
          {airlines.map((airline, idx) => {
            const rowKey = airline.airline_id ? `airline-${airline.airline_id}` : `airline-idx-${idx}`;
            
            return (
              <div
                key={rowKey}
                className="flex items-center px-6 py-4 transition hover:bg-slate-50/50"
              >
                <div className="w-16 shrink-0 text-xs font-mono text-slate-400">
                  #{airline.airline_id}
                </div>
                
                <div className="flex-1 min-w-[200px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">
                    {airline.airline_name}
                  </span>
                </div>

                {/* ၃။ Country */}
                <div className="flex-1 min-w-[150px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-600">
                    {airline.country || '-'}
                  </span>
                </div>

                {/* ၄။ Actions Button Context */}
                <div className="w-24 shrink-0 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onEdit(airline)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                    title="Edit Airline"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(airline)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                    title="Delete Airline"
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