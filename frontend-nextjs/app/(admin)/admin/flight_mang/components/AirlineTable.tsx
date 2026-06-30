'use client';

import React from 'react';
import { Airline } from '@/services/airlineService';
import { Pencil, Trash2, Loader2, Plane } from 'lucide-react';

interface AirlineTableProps {
  airlines: Airline[];
  loading: boolean;
  search: string;
  onEdit: (airline: Airline) => void;
  onDelete: (airline: Airline) => void;
}

export default function AirlineTable({ airlines, loading, search, onEdit, onDelete }: AirlineTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="grid grid-cols-[60px_1fr_1fr_120px] items-center px-6 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">#</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Airline Name</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</span>
      </div>

      {/* Loading View */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm">Loading airlines…</span>
        </div>
      )}

      {/* Empty View */}
      {!loading && airlines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <p className="text-sm font-medium">
            {search ? 'No airlines match your search.' : 'No airlines found.'}
          </p>
        </div>
      )}

      {/* Table Rows */}
      {!loading &&
        airlines.map((airline, idx) => ( 
          <div
            key={airline.airline_id}
            className={`grid grid-cols-[60px_1fr_1fr_120px] items-center px-6 py-4 transition hover:bg-slate-50 ${
              idx < airlines.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <span className="text-xs font-mono text-slate-400">#{airline.airline_id}</span>
            
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-800">{airline.airline_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">{airline.country}</span>
            </div>

            {/* Edit Button */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => onEdit(airline)}
                className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition"
              >
                <Pencil className="w-4 h-4" />
              </button>

              {/* Delete Button */}
              <button
                onClick={() => onDelete(airline)}
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
