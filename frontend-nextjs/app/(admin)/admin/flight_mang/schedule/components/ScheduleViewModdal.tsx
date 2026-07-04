"use client";

import React from "react";
import { Schedule } from "@/services/scheduleService";
import { X, Plane, CalendarDays, BadgeCheck, MapPin, DollarSign, Clock } from "lucide-react";

interface ScheduleViewModalProps {
  isOpen: boolean;
  schedule: Schedule | null;
  onClose: () => void;
}

export default function ScheduleViewModal({ isOpen, schedule, onClose }: ScheduleViewModalProps) {
  if (!isOpen || !schedule) return null;

  const isOutbound = schedule.flight_type?.toUpperCase() === "OUTBOUND";

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
          <h2 className="text-white font-bold text-sm tracking-wide">Schedule Details</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition rounded-lg p-1 hover:bg-white/10 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Flight No + Type Badge */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <Plane className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">{schedule.flight_no}</p>
              <span className="text-xs text-slate-400 font-medium block mt-0.5">{schedule.airline_name}</span>
              <span
                className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isOutbound
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                }`}
              >
                {schedule.flight_type}
              </span>
            </div>
          </div>

          {/* Detail Rows */}
          <div className="space-y-3">
            {/* Schedule ID */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Schedule ID</p>
                <p className="text-sm font-semibold text-slate-700">#{schedule.schedule_id}</p>
              </div>
            </div>

            {/* Route Details */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Flight Route</p>
                <p className="text-sm font-semibold text-slate-700">{schedule.route_details}</p>
              </div>
            </div>

            {/* Timing (Departure & Arrival) */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Departure</p>
                  <p className="text-sm font-semibold text-slate-700">{schedule.departure_time}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Arrival</p>
                  <p className="text-sm font-semibold text-slate-700">{schedule.arrival_time}</p>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Economy Class</p>
                  <p className="text-sm font-bold text-emerald-700">${schedule.economy_price}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Business Class</p>
                  <p className="text-sm font-bold text-amber-700">${schedule.business_price}</p>
                </div>
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