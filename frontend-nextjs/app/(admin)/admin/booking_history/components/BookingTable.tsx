'use client';
import React from 'react';
import { Loader2, Eye, Calendar, Plane, User } from 'lucide-react';
import { BookingRecord } from '@/services/BookingService';

interface BookingTableProps {
    bookings: BookingRecord[];
    loading: boolean;
    search: string;
    onView: (booking: BookingRecord) => void;
}

export default function BookingTable({
    bookings = [],
    loading,
    search,
    onView
}: BookingTableProps) {

    return (
        <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="w-full overflow-x-auto">
                <div className="min-w-200">

                    {/* Table Header */}
                    <div className="flex items-center px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="w-16 shrink-0">ID</div>
                        <div className="w-36 shrink-0">Ticket</div>
                        <div className="flex-1">Flight & Date</div>
                        <div className="w-28 shrink-0">Class</div>
                        <div className="w-28 shrink-0">Status</div>
                        <div className="w-24 shrink-0 text-right">Action</div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            <span className="text-sm font-medium">Loading Bookings...</span>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <p className="text-sm font-medium">
                                {search ? 'No bookings match your search.' : 'No bookings found.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {bookings.map((item) => (
                                <div key={item.booking_id} className="flex items-center px-6 py-4 transition hover:bg-slate-50/50 text-slate-700">

                                    {/* ID */}
                                    <div className="w-16 shrink-0 text-xs font-mono text-slate-400">#{item.booking_id}</div>

                                    {/* Ticket */}
                                    <div className="w-36 shrink-0 flex flex-col">
                                        <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-blue-900" /> {item.ticket_code}
                                        </span>
                                        <span className="text-[10px] text-slate-400">{item.passengers?.length ?? 0} passenger(s)</span>
                                    </div>

                                    {/* Flight & Date */}
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {item.flight_details?.flight_date}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                            <Plane className="w-3.5 h-3.5 text-slate-400" />
                                            {item.flight_details?.flight_no} — {item.flight_details?.departure_city} → {item.flight_details?.arrival_city}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                            <User className="w-3 h-3" />
                                            {item.agent_details?.name ?? (item.user_id ? `User #${item.user_id}` : 'N/A')}
                                        </div>

                                    </div>

                                    {/* Seat Class */}
                                    <div className="w-28 shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.seat_class === 'Business' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                                            }`}>
                                            {item.seat_class}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="w-28 shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                item.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
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