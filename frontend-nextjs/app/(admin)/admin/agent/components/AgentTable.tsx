'use client';

import React from 'react';
import { Agent } from '@/services/agentService'; 
import { Pencil, Trash2, Loader2, Eye, ToggleLeft } from 'lucide-react';

interface AgentTableProps {
  agents: Agent[]; 
  loading: boolean;
  search: string;
  onUpdate: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onView: (agent:Agent) => void;
}

export default function AgentTable({ 
  agents = [], 
  loading, 
  search, 
  onUpdate, 
  onDelete,
  onView
}: AgentTableProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Table Wrapper for Horizontal Scroll on Mobile */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-200"> 
          
          {/* Table Header */}
          <div className="flex items-center px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-16 shrink-0"># ID</div>
            <div className="flex-1 min-w-50">Agent Info</div>
            <div className="w-40 shrink-0">Phone No</div>
            <div className="w-32 shrink-0">Status</div>
            <div className="w-36 shrink-0">Joined Date</div>
            <div className="w-24 shrink-0 text-right">Actions</div>
          </div>

          {/* Loading View */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Loading Agents...</span>
            </div>
          )}

          {/* Empty View */}
          {!loading && agents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <p className="text-sm font-medium">
                {search ? 'No agents match your search.' : 'No agents found.'}
              </p>
            </div>
          )}

          {/* Table Body Rows */}
          {!loading && agents.length > 0 && (
            <div className="divide-y divide-slate-100">
              {agents.map((agent, idx) => {
                const rowKey = agent.agent_id ? `agent-${agent.agent_id}` : `agent-idx-${idx}`;
                
                // Status mapping to style badges nicely
                const isActive = agent.status?.toUpperCase() === 'ACTIVE';
                
                return (
                  <div
                    key={rowKey}
                    className="flex items-center px-6 py-4 transition hover:bg-slate-50/50"
                  >
                    {/* ID */}
                    <div className="w-16 shrink-0 text-xs font-mono text-slate-400">
                      #{agent.agent_id}
                    </div>
                    
                    {/* Agent Name & Email */}
                    <div className="flex-1 min-w-50 flex flex-col justify-center">
                      <span className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {agent.username} 
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {agent.email}
                      </span>
                    </div>

                    {/* Phone Number */}
                    <div className="w-40 shrink-0 text-sm font-medium text-slate-600">
                      {agent.phone_no}
                    </div>

                    {/* Status Badge */}
                    <div className="w-32 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {agent.status}
                      </span>
                    </div>

                    {/* Joined Date */}
                    <div className="w-36 shrink-0 text-sm text-slate-500">
                      {agent.joined_date}
                    </div>

                    {/* Actions */}
                    <div className="w-24 shrink-0 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView(agent)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                        title="Edit Agent"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onUpdate(agent)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95"
                        title="Edit Agent"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>


                      <button
                        onClick={() => onDelete(agent)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                        title="Delete Agent"
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