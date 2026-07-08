'use client';
import React from 'react';
import { Calendar, MapPin, Users, Banknote, Bookmark, Plane, User } from 'lucide-react';
import { formatBookingDateTime12H, formatDisplayTime } from '@/utils/timeHelper';
import { BookingRecord } from '@/services/BookingService';


interface BookingViewModalProps {
    isOpen: boolean;
    booking: BookingRecord | null;
    onClose: () => void;
}

export default function BookingViewModal({ isOpen, booking, onClose }: BookingViewModalProps) {
    if (!isOpen || !booking) return null;

    const flight = booking.flight_details;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

                <div className={`px-8 py-6 text-white ${booking.status === 'CONFIRMED' ? 'bg-blue-600' : booking.status === 'CANCELLED' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Ticket Code</p>
                            <h2 className="text-2xl font-black mt-1">{booking.ticket_code}</h2>
                        </div>
                        <div className="text-right">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase block mb-2">{booking.status}</span>
                        </div>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {formatBookingDateTime12H(booking.booking_date)}
                        </span>
                    </div>
                </div>


                {/* Scrollable Content */}
                <div className="p-8 space-y-6 overflow-y-auto">

                    {/* Flight Section */}
                    <div className="border-b border-slate-100 pb-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Plane className="w-6 h-6" /></div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Flight</p>
                                <p className="text-sm font-bold text-slate-800">{flight?.airline_name} · {flight?.flight_no}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl"><MapPin className="w-6 h-6" /></div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Route</p>
                                <p className="text-sm font-bold text-slate-800">{flight?.departure_city} → {flight?.arrival_city}</p>
                            </div>
                        </div>
                    </div>


                    {/* Grid Information */}
                    <div className="grid grid-cols-2 gap-y-6">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Timing</p>
                                <p className="text-xs font-bold text-slate-700">
                                    {flight ? `${formatDisplayTime(flight.departure_time)} ➔ ${formatDisplayTime(flight.arrival_time)}` : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-slate-400" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Seat Class</p>
                                <p className="text-xs font-bold text-slate-700">{booking.seat_class}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Banknote className="w-4 h-4 text-slate-400" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Price</p>
                                <p className="text-xs font-bold text-emerald-700">{booking.total_price.toLocaleString()} MMK</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Bookmark className="w-4 h-4 text-slate-400" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Passengers</p>
                                <p className="text-xs font-bold text-slate-700">{booking.passengers?.length ?? 0} pax</p>
                            </div>
                        </div>

                        {/* 🆕 Booked By (Agent) */}
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-slate-400" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Booked By</p>
                                <p className="text-xs font-bold text-slate-700">
                                    {booking.agent_details?.name ?? (booking.user_id ? `User #${booking.user_id}` : 'Unknown')}
                                </p>
                                {booking.agent_details?.email && (
                                    <p className="text-[10px] text-slate-400">{booking.agent_details.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Passenger List */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="w-full px-5 py-4 bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-500" />
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Passenger List</h4>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-slate-100 space-y-2">
                            {booking.passengers?.map((p) => (
                                <div key={p.passenger_id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-semibold text-slate-700">{p.name}</span>
                                        <span className="text-[9px] text-slate-400">{p.nrc}</span>
                                    </div>
                                    <span className="text-[9px] font-bold px-2 py-1 bg-white border text-slate-500 rounded-lg uppercase">{p.seat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition active:scale-[0.98]">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}