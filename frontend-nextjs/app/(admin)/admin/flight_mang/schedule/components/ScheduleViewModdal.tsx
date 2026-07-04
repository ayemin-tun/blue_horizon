"use client";

import React from "react";
import { Schedule } from "@/services/scheduleService";
import { X, Plane, BadgeCheck, ArrowRight } from "lucide-react";
import { formatDisplayTime } from "@/utils/timeHelper";

interface ScheduleViewModalProps {
  isOpen: boolean;
  schedule: Schedule | null;
  onClose: () => void;
}

export default function ScheduleViewModal({ isOpen, schedule, onClose }: ScheduleViewModalProps) {
  if (!isOpen || !schedule) return null;

  const isOutbound = schedule.flight_type?.toUpperCase() === "OUTBOUND";

  const routePoints = schedule.route_details
    ? schedule.route_details.includes("➔")
      ? schedule.route_details.split("➔").map(p => p.trim())
      : schedule.route_details.includes("->")
      ? schedule.route_details.split("->").map(p => p.trim())
      : [schedule.route_details, ""]
    : ["—", "—"];


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
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-blue-200" />
            <h2 className="text-white font-bold text-sm tracking-wide">
              Schedule Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition rounded-lg p-1 hover:bg-white/10 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Ticket Style View) */}
        <div className="p-5 space-y-4">
          
          {/* Ticket Outer Wrapper */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs space-y-4 relative overflow-hidden">
            
            {/* Header Line inside Ticket */}
            <div className="flex items-center justify-between border-b border-blue-100/70 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-blue-900" />
                <p className="text-blue-900 font-bold text-[13px]">Schedule Type</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                isOutbound ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}>
                {schedule.flight_type || "OUTBOUND"}
              </span>
            </div>

            {/* Flight No & Airline Details */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Flight Number</p>
                <p className="font-mono font-bold text-slate-900 text-sm">{schedule.flight_no || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Airline</p>
                <p className="text-slate-800 font-semibold">{schedule.airline_name || "—"}</p>
              </div>
            </div>

            {/* Route & Timings (Ticket Layout Box) */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div className="space-y-1 max-w-[40%]">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight truncate">From</p>
                <p className="text-xs font-bold text-slate-800 truncate">{routePoints[0]}</p>
                <p className="font-mono font-bold text-blue-600 text-[13px]">
                  {formatDisplayTime(schedule.departure_time)}
                </p>
              </div>

              <div className="flex flex-col items-center flex-1 px-2 text-slate-300">
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-1 text-right max-w-[40%]">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight truncate">To</p>
                <p className="text-xs font-bold text-slate-800 truncate">{routePoints[1] || "Destination"}</p>
                <p className="font-mono font-bold text-blue-600 text-[13px]">
                  {formatDisplayTime(schedule.arrival_time)}
                </p>
              </div>
            </div>

            {/* Pricing Details Inside Ticket */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white/80 border border-slate-100 rounded-xl p-2.5">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Economy Class</p>
                <p className="text-emerald-700 font-bold text-[13px] mt-0.5">
                  {schedule.economy_price ? `${Number(schedule.economy_price).toLocaleString()} MMK` : "0 MMK"}
                </p>
              </div>
              <div className="bg-white/80 border border-slate-100 rounded-xl p-2.5">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Business Class</p>
                <p className="text-amber-700 font-bold text-[13px] mt-0.5">
                  {schedule.business_price ? `${Number(schedule.business_price).toLocaleString()} MMK` : "0 MMK"}
                </p>
              </div>
            </div>

          </div>

          {/* Action Button */}
          <div className="pt-1">
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