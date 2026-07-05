'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ScheduleInstance } from "@/services/scheduleInstanceService";
import { X, Calendar, MapPin, Users, DollarSign, Tag, CheckCircle2, Bookmark, ChevronDown, ExternalLink, Banknote } from 'lucide-react';
import { formatDisplayTime } from '@/utils/timeHelper';

// Booking Interface
interface Booking {
  booking_id: string;
  passenger_name: string;
  seat_class: string;
}

interface InstanceViewModalProps {
  isOpen: boolean;
  instance: (ScheduleInstance & { bookings?: Booking[] }) | null;
  onClose: () => void;
}

export default function InstanceViewModal({ isOpen, instance, onClose }: InstanceViewModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!isOpen || !instance) return null;

  // Mock Bookings Data
  const mockBookings: Booking[] = instance.bookings || [
    { booking_id: "BK-001", passenger_name: "Aung Aung", seat_class: "Economy" },
    { booking_id: "BK-002", passenger_name: "Ma Ma", seat_class: "Business" },
    { booking_id: "BK-003", passenger_name: "Kyaw Kyaw", seat_class: "Economy" },
    { booking_id: "BK-004", passenger_name: "Su Su", seat_class: "Economy" },
    { booking_id: "BK-005", passenger_name: "Hla Hla", seat_class: "Business" },
    { booking_id: "BK-006", passenger_name: "Mya Mya", seat_class: "Economy" },
  ];

  const displayBookings = mockBookings.slice(0, 5);
  const hasMore = mockBookings.length > 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

        <div className={`px-8 py-6 text-white ${instance.status === 'SCHEDULED' ? 'bg-blue-600' : instance.status === 'DEPARTED' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{instance.airline_name}</p>
              <h2 className="text-3xl font-black mt-1">{instance.flight_no}</h2>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase block mb-2">{instance.status}</span>
            </div>
          </div>

          {/* Date Badge */}
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-widest">{instance.flight_date}</span>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-6 overflow-y-auto">

          {/* Route & Date Section */}
          <div className="border-b border-slate-100 pb-6 space-y-4">

            {/* Route Details */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><MapPin className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Route</p>
                <p className="text-sm font-bold text-slate-800">{instance.route_details}</p>
              </div>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 gap-y-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Timing</p>
                <p className="text-xs font-bold text-slate-700">{formatDisplayTime(instance.departure_time)} ➔ {formatDisplayTime(instance.arrival_time)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Occupancy</p>
                <p className="text-xs font-bold text-slate-700">Eco: {instance.economy_seats_occupied} | Biz: {instance.business_seats_occupied}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Banknote className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Economic Price</p>
                <p className="text-xs font-bold text-emerald-700">{instance.economy_price.toLocaleString()} MMK</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Banknote className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Business Price</p>
                <p className="text-xs font-bold text-amber-700">{instance.business_price.toLocaleString()} MMK</p>
              </div>
            </div>
          </div>

          {/* Bookings Section (Accordion) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-5 py-4 bg-slate-50 flex justify-between items-center hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Recent Bookings</h4>
              </div>
              <ChevronDown className={`w-4 h-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
              <div className="p-4 bg-white border-t border-slate-100 space-y-2">
                {displayBookings.map((b) => (
                  <div key={b.booking_id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-700">{b.passenger_name}</span>
                    <span className="text-[9px] font-bold px-2 py-1 bg-white border text-slate-500 rounded-lg uppercase">{b.seat_class}</span>
                  </div>
                ))}
                {hasMore && (
                  <Link href={`/bookings?instanceId=${instance.instance_id}`} className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 pt-2 hover:underline">
                    View All {mockBookings.length} Bookings <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition active:scale-[0.98]">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}