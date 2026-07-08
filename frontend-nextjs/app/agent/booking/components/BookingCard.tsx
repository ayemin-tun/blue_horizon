import Link from "next/link";
import { BookingRecord } from "@/services/BookingService";
import { Plane, Calendar, Ticket, ArrowRight } from "lucide-react";

interface BookingCardProps {
    booking: BookingRecord;
}

export default function BookingCard({ booking }: BookingCardProps) {
    const isConfirmed = booking.status.toLowerCase() === "confirmed";

    return (
        <div className="group relative bg-white border border-slate-100 hover:border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">

            {/* Status accent bar */}
            <div className={`absolute left-0 top-0 h-full w-1 ${isConfirmed ? "bg-emerald-400" : "bg-rose-400"}`} />

            <div className="pl-5 pr-5 py-5 md:pl-6 md:pr-6 flex flex-col md:flex-row md:items-center gap-5">

                {/* Left: Route + meta */}
                <div className="flex-1 flex flex-col gap-3">

                    {/* Top row: airline + ticket code + status (mobile) */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <Plane size={13} className="text-[#1e3a8a]" />
                            </div>
                            <span className="text-[12px] font-bold text-slate-600 truncate max-w-[160px]">
                                {booking.flight_details.airline_name}
                            </span>
                            <span className="text-slate-200">•</span>
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                <Ticket size={11} />
                                {booking.ticket_code}
                            </span>
                        </div>

                        <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            isConfirmed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isConfirmed ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {booking.status}
                        </span>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-3">
                        <div className="text-left">
                            <p className="text-slate-900 font-bold text-base leading-none">
                                {booking.flight_details.departure_city}
                            </p>
                        </div>

                        <div className="flex-1 flex items-center gap-1.5 px-1 min-w-[60px] max-w-[140px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                            <span className="flex-1 border-t border-dashed border-slate-300" />
                            <Plane size={13} className="text-[#1e3a8a] rotate-45 shrink-0" />
                            <span className="flex-1 border-t border-dashed border-slate-300" />
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1e3a8a] shrink-0" />
                        </div>

                        <div className="text-right">
                            <p className="text-[#1e3a8a] font-bold text-base leading-none">
                                {booking.flight_details.arrival_city}
                            </p>
                        </div>
                    </div>

                    {/* Bottom meta row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-50">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-350" />
                            Flight: <span className="text-slate-600 font-semibold">{booking.flight_details.flight_date}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
                        <span>
                            Booked: <span className="text-slate-500 font-semibold">{booking.booking_date}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 font-bold tracking-wide uppercase text-[10px]">
                            {booking.seat_class} Class
                        </span>
                        <span className={`inline-flex md:hidden items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            isConfirmed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isConfirmed ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {booking.status}
                        </span>
                    </div>
                </div>

                {/* Right: CTA */}
                <div className="md:pl-5 md:border-l md:border-slate-100 w-full md:w-auto">
                    <Link href={`/agent/booking/${booking.booking_id}`} className="block w-full md:w-auto">
                        <button className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-[#1e3a8a] hover:bg-[#16296b] text-white font-bold text-[11px] px-4 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] shadow-sm">
                            View Detail
                            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
}