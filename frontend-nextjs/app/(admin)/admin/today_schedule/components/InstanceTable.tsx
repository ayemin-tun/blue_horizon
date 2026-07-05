'use client';
import React from 'react';
import { ScheduleInstance } from "@/services/scheduleInstanceService";
import { Loader2, Eye, Calendar, MapPin, Plane, Pencil } from 'lucide-react';

interface InstanceTableProps {
  instances: ScheduleInstance[];
  loading: boolean;
  search: string;
  onView: (instance: ScheduleInstance) => void;
  onEdit: (instance: ScheduleInstance) => void;
}

export default function InstanceTable({ 
  instances = [], 
  loading, 
  search, 
  onView,
  onEdit
}: InstanceTableProps) {
  
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <div className="min-w-200">
          
          {/* Table Header */}
          <div className="flex items-center px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-16 shrink-0">ID</div>
            <div className="w-40 shrink-0">Flight Info</div>
            <div className="flex-1">Date & Route</div>
            <div className="w-32 shrink-0">Status</div>
            <div className="w-24 shrink-0 text-right">Action</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Loading Instances...</span>
            </div>
          ) : instances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <p className="text-sm font-medium">
                {search ? 'No instances match your search.' : 'No instances found.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {instances.map((item) => (
                <div key={item.instance_id} className="flex items-center px-6 py-4 transition hover:bg-slate-50/50 text-slate-700">
                  
                  {/* ID */}
                  <div className="w-16 shrink-0 text-xs font-mono text-slate-400">#{item.instance_id}</div>
                  
                  {/* Flight Info */}
                  <div className="w-40 shrink-0 flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-blue-900" /> {item.flight_no}
                    </span>
                  </div>

                  {/* Date & Route */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.flight_date}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.route_details}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="w-32 shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      item.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      item.status === 'DEPARTED' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="w-24 shrink-0 flex justify-end">
                    <button
                      onClick={() => onView(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}