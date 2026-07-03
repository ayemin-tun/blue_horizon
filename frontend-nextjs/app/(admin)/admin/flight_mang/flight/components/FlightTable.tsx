'use client';

import React from 'react';
import { Pencil, Trash2, Loader2, Plane } from 'lucide-react';

export interface Flight {
  flight_id: number;
  airline_id: number;
  flight_no: string;
  total_seats: number;
  is_deleted: boolean;
  airline?: {
    airline_id: number;
    airline_name: string;
    country: string;
  };
}


interface FlightTableProps {
  flights: Flight[]; 
  loading: boolean;
  search: string;
  onUpdate: (flight: Flight) => void;
  onDelete: (flight: Flight) => void;
}

export default function FlightTable({ 
  flights = [], 
  loading, 
  search, 
  onUpdate, 
  onDelete
}: FlightTableProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-6">
      
      <div className="w-full overflow-x-auto">
        <div className="min-w-200"> 
          
          {/* Table Header */}
          <div className="flex items-center px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-20 shrink-0"># ID</div>
            <div className="w-52 shrink-0">Airline</div>
            <div className="flex-1 min-w-37.5">Flight No</div>
            <div className="w-40 shrink-0">Total Seats</div>
            <div className="w-24 shrink-0 text-right">Actions</div>
          </div>

          {/* Loading View */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Loading Flights...</span>
            </div>
          )}

          {/* Empty View */}
          {!loading && flights.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <p className="text-sm font-medium">
                {search ? 'No flights match your search.' : 'No flights found.'}
              </p>
            </div>
          )}

          {/* Table Body Rows */}
          {!loading && flights.length > 0 && (
            <div className="divide-y divide-slate-100">
              {flights.map((flight, idx) => {
                const rowKey = flight.flight_id ? `flight-${flight.flight_id}` : `flight-idx-${idx}`;
                
                return (
                  <div
                    key={rowKey}
                    className="flex items-center px-6 py-4 transition hover:bg-slate-50/50"
                  >
                    {/* Flight ID */}
                    <div className="w-20 shrink-0 text-xs font-mono text-slate-400">
                      #{flight.flight_id}
                    </div>
                    
                    <div className="w-52 shrink-0 flex flex-col justify-center">
                      <span className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {flight.airline?.airline_name || `Airline #${flight.airline_id}`}
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {flight.airline?.country || 'Unknown Country'}
                      </span>
                    </div>

                    {/* Flight Number */}
                    <div className="flex-1 min-w-37.5 flex items-center">
                      <span className="text-sm font-semibold text-blue-800 font-mono bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-slate-500" />
                        {flight.flight_no}
                      </span>
                    </div>

                    {/* Total Seats */}
                    <div className="w-40 shrink-0 text-sm font-medium text-slate-600">
                      {flight.total_seats.toLocaleString()} Seats
                    </div>

                    {/* Actions */}
                    <div className="w-24 shrink-0 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onUpdate(flight)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                        title="Edit Flight"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(flight)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                        title="Delete Flight"
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
      </div>
    </div>
  );
}