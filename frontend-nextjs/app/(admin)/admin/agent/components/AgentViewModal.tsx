"use client";

import React from "react";
import { Agent } from "@/services/agentService";
import { X, User, Mail, Phone, CalendarDays, BadgeCheck } from "lucide-react";

interface AgentViewModalProps {
  isOpen: boolean;
  agent: Agent | null;
  onClose: () => void;
}

export default function AgentViewModal({ isOpen, agent, onClose }: AgentViewModalProps) {
  if (!isOpen || !agent) return null;

  const isActive = agent.status?.toUpperCase() === "ACTIVE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-900 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-sm tracking-wide">Agent Details</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition rounded-lg p-1 hover:bg-white/10 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">{agent.username}</p>
              <span
                className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                {agent.status}
              </span>
            </div>
          </div>

          {/* Detail Rows */}
          <div className="space-y-3">
            {/* Agent ID */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Agent ID</p>
                <p className="text-sm font-semibold text-slate-700">#{agent.agent_id}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Email</p>
                <p className="text-sm font-semibold text-slate-700">{agent.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <p className="text-sm font-semibold text-slate-700">{agent.phone_no || "—"}</p>
              </div>
            </div>

            {/* Joined Date */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Joined Date</p>
                <p className="text-sm font-semibold text-slate-700">{agent.joined_date || "—"}</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
