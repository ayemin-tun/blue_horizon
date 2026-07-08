export default function SeatingInfo() {
    return (
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-blue-900">Airport Check-in Seating</h2>
                <p className="text-xs text-slate-500 mt-1">
                    Blue Horizon follows a airport check-in seating style seat assignment process.
                </p>
            </div>

            {/* Seating Illustration / Feature Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Free Seat Assignment</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        To keep fares low, seats are auto-assigned at the airport check-in counter at no additional charge. If you are travelling in a group, our counter agents will do their best to seat you together, subject to availability upon check-in.
                    </p>
                </div>
            </div>

            {/* Budget Airline Seating Policies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-100 rounded-xl p-5 hover:shadow-sm transition">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">👥</span>
                        <h5 className="text-xs font-bold text-slate-800 uppercase">Group Seating</h5>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Travelling with family or friends? Our counter agents will try their best to seat your group together, depending on availability.
                    </p>
                </div>

                <div className="border border-slate-100 rounded-xl p-5 hover:shadow-sm transition">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">⏱</span>
                        <h5 className="text-xs font-bold text-slate-800 uppercase">First-Come Basis</h5>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Seats are assigned sequentially during check-in. Arriving earlier at the airport counter gives you a better chance for preferred spots.
                    </p>
                </div>
            </div>
        </div>
    )
}