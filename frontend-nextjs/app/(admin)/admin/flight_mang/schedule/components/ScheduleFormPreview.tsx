"use client";

import React from "react";
import { ArrowRight, Plane } from "lucide-react";

interface SchedulePreviewProps {
    flightId: number;
    routeId: number;
    flightType: string;
    departureTime: string;
    arrivalTime: string;
    economyPrice: number;
    businessPrice: number;
    flightNo?: string;
    airlineName?: string;
    routeDetails?: string;
}

export default function ScheduleFormPreview({
    flightId,
    routeId,
    flightType,
    departureTime,
    arrivalTime,
    economyPrice,
    businessPrice,
    flightNo,       
    airlineName,    
    routeDetails,  
}: SchedulePreviewProps) {

    if (!flightId && !routeId && !departureTime && !arrivalTime && !economyPrice && !businessPrice) {
        return null;
    }

    const formatDisplayTime = (timeStr: string) => {
        if (!timeStr) return "—:—";
        try {
            const [hrs, mins] = timeStr.split(":").map(Number);
            const ampm = hrs >= 12 ? "PM" : "AM";
            const displayHrs = hrs % 12 || 12;
            return `${String(displayHrs).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${ampm}`;
        } catch {
            return timeStr;
        }
    };

    return (
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs space-y-3 relative overflow-hidden">
            {/* Header Line */}
            <div className="flex items-center justify-between border-b border-blue-100/70 pb-2">
                <div className="flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-blue-900" />
                    <p className="text-blue-900 font-bold text-[13px]">Schedule Preview</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                    flightType === "OUTBOUND" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                }`}>
                    {flightType}
                </span>
            </div>

            {/* Flight No & Airline Details */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 font-medium text-[10px] uppercase">Flight Number</p>
                    {/* 🛠️ နေရာဟောင်းတွေမှာ တိုက်ရိုက် ပြောင်းထည့် */}
                    <p className="font-mono font-bold text-slate-900 text-sm">{flightNo || "—"}</p> 
                </div>
                <div className="text-right">
                    <p className="text-slate-400 font-medium text-[10px] uppercase">Airline</p>
                    {/* 🛠️ နေရာဟောင်းတွေမှာ တိုက်ရိုက် ပြောင်းထည့် */}
                    <p className="text-slate-800 font-semibold">{airlineName || "—"}</p> 
                </div>
            </div>

            {/* Route & Timings */}
            <div className="bg-white/80 border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                    {/* 🛠️ */}
                    <p className="text-[11px] font-bold text-slate-800">
                        {routeDetails?.split("➔")[0]?.trim() || "Departure Point"}
                    </p>
                    <p className="font-mono font-bold text-blue-600 text-[13px]">
                        {formatDisplayTime(departureTime)}
                    </p>
                </div>

                <div className="flex flex-col items-center flex-1 px-4 text-slate-300">
                    <span className="text-[9px] font-medium text-slate-400 mb-0.5">Route Way</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 animate-pulse" />
                </div>

                <div className="space-y-1 text-right">
                    <p className="text-[11px] font-bold text-slate-800">
                        {routeDetails?.split("➔")[1]?.trim() || "Arrival Point"}
                    </p>
                    <p className="font-mono font-bold text-blue-600 text-[13px]">
                        {formatDisplayTime(arrivalTime)}
                    </p>
                </div>
            </div>

            {/* Pricing Information */}
            <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-2">
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Economy Class</p>
                    <p className="text-slate-900 font-bold text-xs mt-0.5">
                        {economyPrice > 0 ? `${economyPrice.toLocaleString()} MMK` : "— MMK"}
                    </p>
                </div>
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-2">
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Business Class</p>
                    <p className="text-blue-950 font-bold text-xs mt-0.5">
                        {businessPrice > 0 ? `${businessPrice.toLocaleString()} MMK` : "— MMK"}
                    </p>
                </div>
            </div>
        </div>
    );
}