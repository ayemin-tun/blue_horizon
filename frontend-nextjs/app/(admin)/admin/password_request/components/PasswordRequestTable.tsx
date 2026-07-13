'use client';

import { PasswordRequest } from '@/services/passwordRequestService'; 
import { Eye, Loader2, RefreshCcw } from 'lucide-react';

interface Props {
  requests: PasswordRequest[]; 
  loading: boolean;
  search: string;
  onView: (req: PasswordRequest) => void;
  onResolve: (req: PasswordRequest) => void;
}

export default function PasswordRequestTable({ requests, loading, search, onView, onResolve }: Props) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <div className="min-w-200">
          
          <div className="flex items-center px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-48 shrink-0">Agent Name</div>
            <div className="flex-1 min-w-50">Email Address</div>
            <div className="w-48 shrink-0">Requested Date</div>
            <div className="w-32 shrink-0 text-center">Status</div>
            <div className="w-32 shrink-0 text-center">Action</div>
          </div>

          {loading && (
            <div className="flex justify-center py-20 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-800 mr-3" /> Loading requests...
            </div>
          )}

          {!loading && requests.length === 0 && (
            <div className="flex justify-center py-20 text-slate-500 text-sm">
              {search ? 'No requests match your search.' : 'No requests found.'}
            </div>
          )}

          {!loading && requests.length > 0 && (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => {
                const isResolved = req.status === 'RESOLVED';
                
                return (
                  <div key={req.id} className="flex items-center px-6 py-4 transition hover:bg-slate-50/50">
                    
                    <div className="w-48 shrink-0 text-sm font-semibold text-slate-800">
                      {req.username || '-'}
                    </div>
                    
                    <div className="flex-1 min-w-50 text-sm text-slate-500">
                      {req.email || '-'}
                    </div>
                    
                    <div className="w-48 shrink-0 text-sm text-slate-600">
                      {req.created_at}
                    </div>
                    
                    <div className="w-32 shrink-0 flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        !isResolved 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    
                    <div className="w-32 shrink-0 flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView(req)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                        title="View Password Request"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onResolve(req)}
                        disabled={isResolved} // Resolved ဖြစ်နေရင် နှိပ်လို့မရအောင် ပိတ်ထားမယ်
                        className={`p-1.5 rounded-lg transition active:scale-95 ${
                          isResolved 
                            ? 'text-slate-300 cursor-not-allowed bg-slate-50' 
                            : 'text-slate-400 hover:text-red-700 hover:bg-red-50'
                        }`}
                        title={isResolved ? "Already Resolved" : "Resolve Request"}
                      >
                        <RefreshCcw className="w-4 h-4" />
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