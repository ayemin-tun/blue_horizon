'use client';
import React, { useState } from 'react';
import { ScheduleInstance, InstanceUpdatePayload } from '@/services/scheduleInstanceService';
import { Save, Loader2, AlertCircle, Plane, Calendar, MapPin, Clock, Users, Pen } from 'lucide-react';

interface UpdateInstanceFormProps {
    initialData: ScheduleInstance | null;
    onSubmit: (payload: InstanceUpdatePayload) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function UpdateInstanceForm({ initialData, onSubmit, onCancel, loading }: UpdateInstanceFormProps) {
    const [formData, setFormData] = useState({
        status: initialData?.status || 'SCHEDULED',
        override_economy_price: initialData?.economy_price || 0,
        override_business_price: initialData?.business_price || 0,
    });

    if (!initialData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: InstanceUpdatePayload = { status: formData.status };
        if (Number(formData.override_economy_price) !== initialData.economy_price) payload.override_economy_price = Number(formData.override_economy_price);
        if (Number(formData.override_business_price) !== initialData.business_price) payload.override_business_price = Number(formData.override_business_price);
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Box  */}
            <div className=" rounded-2xl p-5  bg-blue-700 text-white border-blue-200">
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">{initialData.airline_name}</p>
                <h2 className="text-2xl font-black">{initialData.flight_no}</h2>
                <div className="flex items-center gap-2 mt-2 text-blue-50 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{initialData.flight_date}</span>
                </div>
            </div>

            {/* Read-only Details */}
            <div className="grid grid-cols-2 gap-4">
                <DetailCard icon={<MapPin />} label="Route" value={initialData.route_details} />
                <DetailCard icon={<Clock />} label="Timing" value={`${initialData.departure_time} - ${initialData.arrival_time}`} />
                <DetailCard icon={<Users />} label="Economy" value={`${initialData.economy_seats_occupied} seats occupied`} />
                <DetailCard icon={<Users />} label="Business" value={`${initialData.business_seats_occupied} seats occupied`} />
            </div>

            <hr className="border-slate-100" />


            {/* Editable Actions */}
            <div className="space-y-4">
               

                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Flight Status
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Pen className="w-4 h-4" />
                        </span>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black appearance-none"
                        >
                            <option value="SCHEDULED">SCHEDULED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <PriceInput label="Eco Price (MMK)" value={formData.override_economy_price} onChange={(v) => setFormData({ ...formData, override_economy_price: Number(v) })} />
                        <PriceInput label="Biz Price (MMK)" value={formData.override_business_price} onChange={(v) => setFormData({ ...formData, override_business_price: Number(v) })} />
                    </div>
                </div>

                {/* Operational Warning */}
                <div className="bg-amber-50 p-4 rounded-xl flex gap-3 items-start border border-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                        <strong>Note:</strong> Pricing/Status changes are blocked if the flight is within 2 hours of departure or has active passenger bookings.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button type="button" onClick={onCancel} className="flex-1 py-3 text-sm font-bold border-2 border-slate-100 text-slate-500 hover:bg-slate-50 rounded-xl transition">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-2 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : "Save Changes"}
                    </button>
                </div>
        </form>
    );
}

// Sub-components
function DetailCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="text-blue-500 mt-0.5 [&>svg]:w-4 [&>svg]:h-4">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
                <p className="text-xs font-semibold text-slate-700">{value}</p>
            </div>
        </div>
    );
}

function PriceInput({ label, value, onChange }: { label: string, value: string | number, onChange: (v: string) => void }) {
    return (
        <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-500"
            />
        </div>
    );
}