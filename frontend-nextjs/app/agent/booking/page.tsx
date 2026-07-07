"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import { Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const bookings = [
    {
        id: 1,
        date: '24 Jun, 2026',
        type: 'One-Way',
        ticketId: 'FB-NQ23230221',
        flightClass: 'Economy Class',
        destination: 'RGN_MDY',
        airline: 'Blue Horizon Airlines',
        status: 'Confirmed',
    },
    {
        id: 2,
        date: '21 Jun, 2026',
        type: 'One-Way',
        ticketId: 'FB-NQ23230321',
        flightClass: 'Economy Class',
        destination: 'MDY_RGN',
        airline: 'Blue Horizon Airlines',
        status: 'Confirmed',
    },
    {
        id: 3,
        date: '21 Jun, 2026',
        type: 'One-Way',
        ticketId: 'FB-NQ23230321',
        flightClass: 'Economy Class',
        destination: 'MDY_RGN',
        airline: 'Blue Horizon Airlines',
        status: 'Cancel',
    },
    {
        id: 4,
        date: '21 Jun, 2026',
        type: 'One-Way',
        ticketId: 'FB-NQ23230321',
        flightClass: 'Economy Class',
        destination: 'MDY_RGN',
        airline: 'Blue Horizon Airlines',
        status: 'Cancel',
    },
    {
        id: 5,
        date: '18 Jun, 2026',
        type: 'Round-Trip',
        ticketId: 'FB-NQ23230322',
        flightClass: 'Business Class',
        destination: 'RGN_BKK',
        airline: 'Blue Horizon Airlines',
        status: 'Confirmed',
    },
    {
        id: 6,
        date: '15 Jun, 2026',
        type: 'One-Way',
        ticketId: 'FB-NQ23230323',
        flightClass: 'Economy Class',
        destination: 'BKK_SIN',
        airline: 'Blue Horizon Airlines',
        status: 'Confirmed',
    },
    {
        id: 7,
        date: '12 Jun, 2026',
        type: 'One-Way',
        ticketId: 'FB-NQ23230324',
        flightClass: 'Economy Class',
        destination: 'SIN_RGN',
        airline: 'Blue Horizon Airlines',
        status: 'Cancel',
    },
    {
        id: 8,
        date: '10 Jun, 2026',
        type: 'Round-Trip',
        ticketId: 'FB-NQ23230325',
        flightClass: 'First Class',
        destination: 'RGN_NRT',
        airline: 'Blue Horizon Airlines',
        status: 'Confirmed',
    },
    {
        id: 9,
        date: '05 Jun, 2026',
        type: 'One-Way',
        ticketId: 'FB-NQ23230326',
        flightClass: 'Economy Class',
        destination: 'NRT_ICN',
        airline: 'Blue Horizon Airlines',
        status: 'Confirmed',
    },
    {
        id: 10,
        date: '01 Jun, 2026',
        type: 'One-Way',
        ticketId: 'FB-NQ23230327',
        flightClass: 'Economy Class',
        destination: 'ICN_RGN',
        airline: 'Blue Horizon Airlines',
        status: 'Cancel',
    }
];

export default function BookingHistory() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const totalCount = bookings.length; 
    const startIndex = (currentPage - 1) * pageSize;
    const currentBookings = bookings.slice(startIndex, startIndex + pageSize);

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans text-gray-800 pb-12">

        <Navbar />

        <main className="max-w-[1000px] mx-auto px-4 mt-8 bg-white border border-gray-100 rounded-lg shadow-sm p-8">
            
            {/* Breadcrumbs */}
            <div className="text-sm mb-8 flex items-center gap-1">
            <span className="text-gray-400 font-medium cursor-pointer hover:text-gray-600">Home</span>
            <span className="text-gray-300">|</span>
            <span className="text-[#1e3a8a] font-medium cursor-pointer">Manage Booking</span>
            </div>

            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-lg font-bold text-[#1e3a8a]">Flight Booking History</h1>

            <div className="flex flex-wrap justify-end gap-3 items-center mt-4 md:mt-0">
                {/* Sort Dropdown */}
                <button className="flex items-center border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]">
                <span className="mr-2">Sort by: <span className="font-semibold text-gray-800">Most Recent</span></span>
                <ChevronDown size={14} className="text-gray-500" />
                </button>

                {/* Search Input */}
                <div className="relative">
                <input
                    type="text"
                    placeholder="Search by booking ID"
                    className="pl-3 pr-8 py-1.5 border border-gray-200 rounded-md text-xs w-48 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-gray-700 placeholder-gray-400"
                />
                <Search size={14} className="absolute right-2.5 top-2 text-gray-400 font-bold" />
                </div>
            </div>
            </div>

            {/* Bookings List */}
            <div className="flex flex-col gap-3">
            {currentBookings.map((booking) => (
                <div 
                key={booking.id} 
                className="border border-gray-200 rounded-lg p-5 flex flex-wrap md:flex-nowrap justify-between items-center bg-white"
                >
                
                {/* Time */}
                <div className="w-full md:w-[15%] text-center mb-4 md:mb-0">
                    <p className="text-[11px] font-semibold text-gray-800 mb-1.5">Time</p>
                    <p className="text-[#1e3a8a] font-bold text-[13px]">{booking.date}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{booking.type}</p>
                </div>

                {/* Ticket Id */}
                <div className="w-full md:w-[25%] text-center mb-4 md:mb-0">
                    <p className="text-[11px] font-semibold text-gray-800 mb-1.5">Ticket Id</p>
                    <p className="text-[#1e3a8a] font-bold text-[13px]">{booking.ticketId}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{booking.flightClass}</p>
                </div>

                {/* Destination */}
                <div className="w-full md:w-[15%] text-center mb-4 md:mb-0">
                    <p className="text-[11px] font-semibold text-gray-800 mb-1.5">Destination</p>
                    <p className="text-[#1e3a8a] font-bold text-[13px]">{booking.destination}</p>
                </div>

                {/* Airlines */}
                <div className="w-full md:w-[20%] text-center mb-4 md:mb-0">
                    <p className="text-[11px] font-semibold text-gray-800 mb-1.5">Airlines</p>
                    <p className="text-[#1e3a8a] font-bold text-[13px]">{booking.airline}</p>
                </div>

                {/* Booking Ticket (Status & Action) */}
                <div className="w-full md:w-[25%] text-center flex flex-col items-center">
                    <p className="text-[11px] font-semibold text-gray-800 mb-1.5">Booking Ticket</p>
                    <p className={`font-bold text-[13px] ${booking.status === 'Confirmed' ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                    {booking.status}
                    </p>
                    <Link href={`/booking/${booking.id}`} className="w-full flex justify-center">
                        <button className="mt-2 border border-[#1e3a8a] text-[#1e3a8a] font-semibold text-[11px] px-5 py-1 rounded-full hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-200 outline-none">
                            View Detail
                        </button>
                    </Link>
                </div>

                </div>
            ))}
            </div>

            <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            />

        </main>
        </div>
    );
}