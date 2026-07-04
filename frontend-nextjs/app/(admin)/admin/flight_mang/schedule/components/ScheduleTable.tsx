'use client';

import React from 'react';
import { Schedule } from '@/services/scheduleService'; 
import { Pencil, Trash2, Loader2, Eye, Plane } from 'lucide-react';

interface ScheduleTableProps {
  schedules: Schedule[]; 
  loading: boolean;
  search: string;
  onUpdate: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onView: (schedule: Schedule) => void;
}

export default function ScheduleTable({ 
  schedules = [], 
  loading, 
  search, 
  onUpdate, 
  onDelete,
  onView
}: ScheduleTableProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Table Wrapper for Horizontal Scroll on Mobile */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-200">
          
          {/* Table Header */}
          <div className="flex items-center px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-16 shrink-0"># ID</div>
            <div className="w-44 shrink-0">Flight & Airline</div>
            <div className="flex-1 min-w-37.5">Route Route</div>
            <div className="w-36 shrink-0">Timing (Dep ➔ Arr)</div>
            <div className="w-28 shrink-0">Type</div>
            <div className="w-40 shrink-0">Pricing (Eco / Biz)</div>
            <div className="w-24 shrink-0 text-right">Actions</div>
          </div>

          {/* Loading View */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Loading Schedules...</span>
            </div>
          )}

          {/* Empty View */}
          {!loading && schedules.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <p className="text-sm font-medium">
                {search ? 'No schedules match your search.' : 'No schedules found.'}
              </p>
            </div>
          )}

          {/* Table Body Rows */}
          {!loading && schedules.length > 0 && (
            <div className="divide-y divide-slate-100">
              {schedules.map((schedule, idx) => {
                const rowKey = schedule.schedule_id ? `schedule-${schedule.schedule_id}` : `schedule-idx-${idx}`;
                
                // Flight Type Mapping (OUTBOUND / INBOUND)
                const isOutbound = schedule.flight_type?.toUpperCase() === 'OUTBOUND';
                
                return (
                  <div
                    key={rowKey}
                    className="flex items-center px-6 py-4 transition hover:bg-slate-50/50 text-slate-700"
                  >
                    {/* ID */}
                    <div className="w-16 shrink-0 text-xs font-mono text-slate-400">
                      #{schedule.schedule_id}
                    </div>
                    
                    {/* Flight No & Airline */}
                    <div className="w-44 shrink-0 flex flex-col justify-center">
                      <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        {schedule.flight_no}
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-1 mt-0.5 pl-5">
                        {schedule.airline_name}
                      </span>
                    </div>

                    {/* Route Details */}
                    <div className="flex-1 min-w-37.5 text-sm font-medium text-slate-800">
                      {schedule.route_details}
                    </div>

                    {/* Timing */}
                    <div className="w-36 shrink-0 flex flex-col justify-center text-xs">
                      <span className="font-semibold text-slate-700">Dep: {schedule.departure_time}</span>
                      <span className="text-slate-500 mt-0.5">Arr: {schedule.arrival_time}</span>
                    </div>

                    {/* Flight Type Badge */}
                    <div className="w-28 shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isOutbound 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {schedule.flight_type}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="w-40 shrink-0 flex flex-col justify-center text-xs font-medium">
                      <span className="text-emerald-700">Eco: {schedule.economy_price}</span>
                      <span className="text-amber-700 mt-0.5">Biz: {schedule.business_price}</span>
                    </div>

                    {/* Actions */}
                    <div className="w-24 shrink-0 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView(schedule)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                        title="View Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onUpdate(schedule)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                        title="Edit Schedule"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(schedule)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                        title="Delete Schedule"
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