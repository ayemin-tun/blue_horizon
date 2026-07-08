"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import { Search, ChevronDown, X } from 'lucide-react';
import { useAuthStore } from '@/services/store/authStore';
import { useAgentBookingsQuery } from '@/services/BookingService';
import BookingCard from './components/BookingCard';
import Link from 'next/link';

const STATUS_OPTIONS = [
    { label: 'All Status', value: '' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

const SEAT_CLASS_OPTIONS = [
    { label: 'All Classes', value: '' },
    { label: 'Economy', value: 'ECONOMY' },
    { label: 'Business', value: 'BUSINESS' },
];

function FilterDropdown({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
}) {
    const isActive = value !== '';
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`appearance-none pl-3 pr-8 py-1.5 border rounded-md text-xs bg-white cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] ${isActive
                        ? 'border-[#1e3a8a] text-[#1e3a8a] font-semibold bg-blue-50/30'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={14}
                className={`pointer-events-none absolute right-2.5 top-2.5 transition-colors ${isActive ? 'text-[#1e3a8a]' : 'text-gray-400'
                    }`}
            />
        </div>
    );
}

export default function BookingHistory() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [seatClass, setSeatClass] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const userIdFromStore = useAuthStore((state) => state.userId);
    const currentAgentId = userIdFromStore ? String(userIdFromStore) : "";

    const { data: bookingResponse, isLoading, isError, error } = useAgentBookingsQuery({
        user_id: currentAgentId,
        search,
        status,
        seat_class: seatClass,
        skip: (currentPage - 1) * pageSize,
        limit: pageSize
    });

    const totalCount = bookingResponse?.pagination?.total || 0;
    const currentBookings = bookingResponse?.data || [];
    const hasActiveFilters = search !== '' || status !== '' || seatClass !== '';

    const clearFilters = () => {
        setSearchInput('');
        setSearch('');
        setStatus('');
        setSeatClass('');
        setCurrentPage(1);
    };

    if (!currentAgentId && !isLoading) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center text-xs font-semibold text-rose-500">
                    Authentication required. Please login to view your booking history.
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center text-xs font-semibold text-slate-500">
                    Loading your booking history records...
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center text-xs font-semibold text-rose-500">
                    Error loading bookings: {error?.message || "Internal server connection failed."}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans text-gray-800 pb-16">
            <Navbar />

            {/* Page Header Section with Clean Structure */}
            <div className="bg-white border-b border-gray-100 py-6 mb-8">
                <div className="max-w-250 mx-auto px-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                        <Link
                            href="/" 
                        >
                            <span className="hover:text-gray-600 cursor-pointer transition-colors">Home</span></Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-600">Manage Booking</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Flight Booking History</h1>
                </div>
            </div>

            <main className="max-w-250 mx-auto px-4">
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 md:p-8">

                    {/* Controls & Filter Panel */}
                    <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-gray-400 mr-1 uppercase tracking-wider">Filter By:</span>
                                <FilterDropdown value={status} onChange={(v) => { setStatus(v); setCurrentPage(1); }} options={STATUS_OPTIONS} />
                                <FilterDropdown value={seatClass} onChange={(v) => { setSeatClass(v); setCurrentPage(1); }} options={SEAT_CLASS_OPTIONS} />

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 px-2.5 py-1.5 rounded-md hover:bg-rose-50 transition-colors"
                                    >
                                        <X size={13} />
                                        Clear Filters
                                    </button>
                                )}
                            </div>

                            {/* Search Box Component */}
                            <div className="relative w-full md:w-64">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search by ticket code or city"
                                    className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-xs w-full focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-gray-700 placeholder-gray-400 transition-colors"
                                />
                                {searchInput && (
                                    <button
                                        onClick={() => setSearchInput('')}
                                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                                        aria-label="Clear search"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bookings Render Block */}
                    <div className="flex flex-col gap-3.5">
                        {currentBookings.length === 0 ? (
                            <div className="text-center py-16 text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                                {hasActiveFilters
                                    ? "No bookings match your current search parameters or active filters."
                                    : "No flight booking records found under this agent account."}
                            </div>
                        ) : (
                            currentBookings.map((booking) => (
                                <BookingCard key={booking.booking_id} booking={booking} />
                            ))
                        )}
                    </div>

                    {/* Pagination Interface */}
                    {totalCount > 0 && (
                        <div className="mt-8 pt-4 border-t border-gray-50">
                            <Pagination
                                currentPage={currentPage}
                                totalCount={totalCount}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}