"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useBookingDetailQuery } from "@/services/BookingService";
import { useAuthStore } from "@/services/store/authStore"; // 🟢 1. Import Auth Store

import Modal from "@/components/Modal";
import { AlertTriangle } from "lucide-react";

import {
    Plane,
    Calendar,
    Ticket,
    ArrowLeft,
    User,
    Phone,
    CreditCard,
    Clock,
    IdCard,
    X,
} from "lucide-react";

function formatCleanDate(dateStr: string) {
    if (!dateStr) return "";
    if (dateStr.includes("T")) {
        return dateStr.replace("T", " ").replace(/\.\d+Z$/, "").substring(0, 16);
    }
    return dateStr;
}

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params?.id as string;

    const [showCancelModal, setShowCancelModal] = React.useState(false);
    // 🟢 2. Extract current logged-in user's ID from Zustand Store
    const currentUserId = useAuthStore((state) => state.userId);

    const { data: response, isLoading, isError, error } = useBookingDetailQuery(bookingId);

    const booking = response?.data;
    const isConfirmed = booking?.status?.toLowerCase() === "confirmed";

    // ─── Loading State ─────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
                <div className="flex-1 flex items-center justify-center text-xs font-semibold text-slate-500">
                    Loading booking details...
                </div>
            </div>
        );
    }

    // ─── Error / Not Found State ───────────────────────────────────
    if (isError || !response?.success || !booking) {
        const message = error?.message || response?.error?.details || response?.message || "This booking could not be found.";
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-xs font-semibold text-rose-500">{message}</p>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#1e3a8a] hover:underline"
                    >
                        <ArrowLeft size={13} />
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    // 🟢 3. SECURITY GUARD: IDOR Prevention
    // Check if the booking record actually belongs to the currently logged-in Agent
    // String conversion enforces strict equality checking across data types
    const bookingOwnerId = booking.user_id ? String(booking.user_id) : "";
    const authenticatedId = currentUserId ? String(currentUserId) : "";

    if (bookingOwnerId !== authenticatedId) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-rose-50 rounded-full text-rose-500">
                        <X size={24} className="hidden" /> {/* Optional Icon */}
                    </div>
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Access Denied</p>
                    <p className="text-xs text-slate-500 font-medium">You do not have authorization to view this booking record.</p>
                    <button
                        onClick={() => router.push('/agent/booking')}
                        className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#1e3a8a] hover:underline"
                    >
                        <ArrowLeft size={13} />
                        Return to My Bookings
                    </button>
                </div>
            </div>
        );
    }

    const { flight_details, passengers } = booking;

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans text-gray-800 pb-16">

            {/* Page Header Area */}
            <div className="bg-white border-b border-gray-100 py-6 mb-8">
                <div className="max-w-[900px] mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                            <span onClick={() => router.push('/agent/booking')} className="hover:text-gray-600 cursor-pointer transition-colors">Manage Booking</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-600">Booking Detail</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Booking Specifications</h1>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-gray-200 px-3 py-2 rounded-lg shadow-sm transition-all self-start md:self-auto"
                    >
                        <ArrowLeft size={14} className="text-slate-500" />
                        Back to History
                    </button>
                </div>
            </div>

            <main className="max-w-[900px] mx-auto px-4">
                {/* ... Rest of your UI JSX remains completely untouched ... */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 md:p-8">
                    {/* Ticket Code and Content */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-blue-50/80 flex items-center justify-center shrink-0">
                                <Ticket size={20} className="text-[#1e3a8a]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ticket Code</p>
                                <p className="text-lg font-bold text-slate-900 leading-tight">{booking.ticket_code}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold uppercase ${isConfirmed ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isConfirmed ? "bg-emerald-500" : "bg-rose-500"}`} />
                                {booking.status}
                            </span>

                            {/* 🆕 Cancel Button — only show if still confirmed */}
                            {isConfirmed && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                                >
                                    <X size={12} />
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Flight Info Card */}
                    <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-5 md:p-6 mb-8">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                    <Plane size={13} className="text-[#1e3a8a]" />
                                </div>
                                <span className="text-[12px] font-bold text-slate-600">{flight_details.airline_name}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[11px] font-semibold text-slate-400">{flight_details.flight_no}</span>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-slate-100 text-slate-600 font-bold uppercase text-[10px]">{booking.seat_class} Class</span>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-4 mb-5">
                            <div className="text-left">
                                <p className="text-slate-900 font-bold text-xl leading-none">{flight_details.departure_city}</p>
                                <p className="text-[11px] text-slate-400 font-semibold mt-2">{flight_details.departure_time}</p>
                            </div>
                            <div className="flex-1 flex items-center gap-1.5 px-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                                <span className="flex-1 border-t border-dashed border-slate-300" />
                                <Plane size={14} className="text-[#1e3a8a] rotate-45 shrink-0" />
                                <span className="flex-1 border-t border-dashed border-slate-300" />
                                <span className="h-1.5 w-1.5 rounded-full bg-[#1e3a8a] shrink-0" />
                            </div>
                            <div className="text-right">
                                <p className="text-[#1e3a8a] font-bold text-xl leading-none">{flight_details.arrival_city}</p>
                                <p className="text-[11px] text-slate-400 font-semibold mt-2">{flight_details.arrival_time}</p>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-[11px] text-slate-500 font-medium pt-4 border-t border-slate-200/70">
                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" />Flight date: <span className="text-slate-700 font-semibold">{flight_details.flight_date}</span></span>
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" />Booked: <span className="text-slate-700 font-semibold">{formatCleanDate(booking.booking_date)}</span></span>
                            <span className="flex items-center gap-1.5"><CreditCard size={12} className="text-slate-400" />Total price: <span className="text-slate-700 font-bold text-sm text-[#1e3a8a]">{booking.total_price.toLocaleString()} MMK</span></span>
                        </div>
                    </div>

                    {/* Passengers */}
                    <div>
                        <h2 className="text-sm font-bold text-[#1e3a8a] mb-4 flex items-center gap-2 uppercase tracking-wide"><User size={15} />Passengers ({passengers.length})</h2>
                        <div className="flex flex-col gap-3">
                            {passengers.map((p, idx) => (
                                <div key={p.passenger_id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-white hover:bg-slate-50/40 transition-colors">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-[11px] font-bold text-[#1e3a8a]">{idx + 1}</div>
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</p><p className="text-xs font-semibold text-slate-800">{p.name}</p></div>
                                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><IdCard size={10} /> NRC</p><p className="text-xs font-semibold text-slate-800">{p.nrc}</p></div>
                                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Birth</p><p className="text-xs font-semibold text-slate-800">{p.dob}</p></div>
                                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</p><p className="text-xs font-semibold text-slate-800">{p.gender}</p></div>
                                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Phone size={10} /> Phone</p><p className="text-xs font-semibold text-slate-800">{p.phone}</p></div>
                                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seat</p><p className="text-xs font-semibold text-slate-800">{p.seat}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* 🆕 Cancel Not Available Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Cancel Booking"
                maxWidth="md"
            >
                <div className="flex flex-col items-center text-center gap-4 py-2">
                    <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                        <AlertTriangle size={26} className="text-amber-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                        You can not made booking cancelled yet.
                    </p>
                    <button
                        onClick={() => setShowCancelModal(false)}
                        className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition active:scale-[0.98]"
                    >
                        Okay, Got it
                    </button>
                </div>
            </Modal>
        </div>
    );
}