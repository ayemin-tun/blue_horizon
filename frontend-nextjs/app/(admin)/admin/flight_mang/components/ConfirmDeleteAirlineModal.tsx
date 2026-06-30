"use client";

import { Plane, Loader2 } from "lucide-react";
import React from "react";
import { Airline } from "@/services/airlineService";

interface ConfirmDeleteAirlineProps {
  isOpen: boolean;
  airline: Airline | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ConfirmDeleteAirlineModal({ isOpen, airline, onConfirm, onCancel, loading }: ConfirmDeleteAirlineProps) {
  if (!isOpen || !airline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onCancel} 
      />
      
      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden transform transition-all duration-300 scale-100">
        <div className="bg-linear-to-r from-rose-600 to-rose-500 px-6 py-4">
          <h2 className="text-white font-bold text-sm tracking-wide">Confirm Delete</h2>
        </div>
        
        <div className="p-6">
          <p className="text-slate-600 text-sm mb-2">
            Are you sure you want to delete this airline?
          </p>
          
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 mb-6 border border-slate-200">
            <Plane className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-blue-900 text-sm">{airline.airline_name}</span>
            <span className="text-sm text-blue-400">•</span>
            <span className="font-semibold text-blue-900 text-sm">{airline.country}</span>
          </div>
          
          <p className="text-xs text-slate-400 mb-6">
            This action performs a soft delete and can be re-activated later.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              type="button"
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              type="button"
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 focus:outline-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : null}
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
