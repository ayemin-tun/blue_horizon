'use client';
import { useState } from "react";
import BookingStats from "./components/BookingStats";
import { Search } from "lucide-react";
import { FilterModal } from "@/components/FilterModal";
import { ActiveFilters } from "@/components/ActiveFilter";
import BookingTable from "./components/BookingTable";
import Pagination from "@/components/Pagination";
import BookingViewModal from "./components/BookingViewModal";
import { BookingRecord, useAdminBookingsQuery } from "@/services/BookingService";

export default function BookingHistoryPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    // ─── Filter States ──────────────────────────────────
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [seatClass, setSeatClass] = useState<string>('');

    const [viewTarget, setViewTarget] = useState<BookingRecord | null>(null);

    const skip = (page - 1) * LIMIT;

    const { data: apiResponse, isLoading: loading } = useAdminBookingsQuery({
        search,
        status,
        seat_class: seatClass,
        skip,
        limit: LIMIT,
    });

    const activeFilters = [
        status && { label: status, onRemove: () => setStatus('') },
        seatClass && { label: seatClass, onRemove: () => setSeatClass('') },
        search && { label: `"${search}"`, onRemove: () => setSearch('') }
    ].filter(Boolean) as { label: string, onRemove: () => void }[];

    const bookings: BookingRecord[] = apiResponse?.data?.bookings || [];
    const metricsData = apiResponse?.data?.metrics;
    const paginationInfo = apiResponse?.data?.pagination;

    return (
        <div className="max-w-5xl mx-auto py-6">

            {/* Stats */}
            <BookingStats metrics={metricsData} />

            {/* ── Filter & Search Bar ── */}
            <div className="flex justify-end items-center gap-3 mb-6 w-full relative">

                <div className="relative">
                    <button
                        onClick={() => setShowFilterMenu(true)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-xl transition ${(status || seatClass) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                        Filters
                        {(status || seatClass) && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block" />}
                    </button>

                    <FilterModal
                        isOpen={showFilterMenu}
                        onClose={() => setShowFilterMenu(false)}
                        hasActiveFilters={!!(status || seatClass)}
                        onClear={() => {
                            setStatus(''); setSeatClass(''); setSearch(''); setPage(1);
                        }}
                    >
                        <div className="space-y-4">
                            <div className="relative shrink-0">
                                <label className="block text-xs font-semibold text-slate-500 mb-3">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                    className="w-full pl-4 pr-10 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none [-webkit-appearance:none] [-moz-appearance:none]"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="CONFIRMED">CONFIRMED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                                <span className="absolute right-4 top-2/3 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px] tracking-widest">▼</span>
                            </div>

                            <div className="relative shrink-0">
                                <label className="block text-xs font-semibold text-slate-500 mb-3">Seat Class</label>
                                <select
                                    value={seatClass}
                                    onChange={(e) => { setSeatClass(e.target.value); setPage(1); }}
                                    className="w-full pl-4 pr-10 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none [-webkit-appearance:none] [-moz-appearance:none]"
                                >
                                    <option value="">All Classes</option>
                                    <option value="Economy">Economy</option>
                                    <option value="Business">Business</option>
                                </select>
                                <span className="absolute right-4 top-2/3 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px] tracking-widest">▼</span>
                            </div>
                        </div>
                    </FilterModal>
                </div>

                {/* Search Input */}
                <div className="relative w-full max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by ticket code or passenger"
                        className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {/* Filter text */}
            <ActiveFilters items={activeFilters} />

            <BookingTable
                bookings={bookings}
                loading={loading}
                search={search}
                onView={(booking) => setViewTarget(booking)}
            />

            {/* ── Pagination ── */}
            {!loading && paginationInfo?.total && paginationInfo.total > LIMIT && (
                <div className="w-full">
                    <Pagination
                        currentPage={page}
                        totalCount={paginationInfo.total}
                        pageSize={LIMIT}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                </div>
            )}

            {/* Booking View modal */}
            <BookingViewModal
                isOpen={viewTarget !== null}
                booking={viewTarget}
                onClose={() => setViewTarget(null)}
            />

        </div>
    )
}