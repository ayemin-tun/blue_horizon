'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { User, Plane } from 'lucide-react';
import logoImg from '@/public/logo.png';
import { useParams } from 'next/navigation';

// Mocked database matching your history items to simulate real data fetching
const bookingsData = [
    { id: 1, date: 'Sunday, June 24', type: 'One-Way', ticketId: 'FB-NQ23230221', flightClass: 'Economy', destination: 'RGN_MDY', airline: 'Blue Horizon Airlines', status: 'Confirmed', price: '300,000 MMK', routeFrom: 'Yangon', routeTo: 'Mandalay', flightNo: 'BH-101', country: 'Myanmar', duration: '1hr(s) 30 min(s)', depTime: '9:00 AM', arrTime: '10:30 AM', passenger: { name: 'Daw May Thu', passport: 'MJI04930', phone: '+95 912789430', address: 'Kamayut, Yangon', nationality: 'Myanmar', gender: 'Male' } },
    { id: 2, date: 'Sunday, June 21', type: 'One-Way', ticketId: 'FB-NQ23230321', flightClass: 'Economy', destination: 'MDY_RGN', airline: 'Blue Horizon Airlines', status: 'Confirmed', price: '300,000 MMK', routeFrom: 'Yangon', routeTo: 'Mandalay', flightNo: 'BH-101', country: 'Myanmar', duration: '1hr(s) 30 min(s)', depTime: '9:00 AM', arrTime: '10:30 AM', passenger: { name: 'U Lwin Maung', passport: 'MJI04930', phone: '+95 912789430', address: 'Kamayut, Yangon', nationality: 'Myanmar', gender: 'Male' } },
    { id: 3, date: 'Sunday, June 21', type: 'One-Way', ticketId: 'FB-NQ23230322', flightClass: 'Economy', destination: 'MDY_RGN', airline: 'Blue Horizon Airlines', status: 'Cancel', price: '300,000 MMK', routeFrom: 'Yangon', routeTo: 'Mandalay', flightNo: 'BH-101', country: 'Myanmar', duration: '1hr(s) 30 min(s)', depTime: '9:00 AM', arrTime: '10:30 AM', passenger: { name: 'U Kyaw Min', passport: 'MJI04930', phone: '+95 912789430', address: 'Kamayut, Yangon', nationality: 'Myanmar', gender: 'Male' } },
    { id: 4, date: 'Sunday, June 21', type: 'One-Way', ticketId: 'FB-NQ23230323', flightClass: 'Economy', destination: 'MDY_RGN', airline: 'Blue Horizon Airlines', status: 'Cancel', price: '300,000 MMK', routeFrom: 'Yangon', routeTo: 'Mandalay', flightNo: 'BH-101', country: 'Myanmar', duration: '1hr(s) 30 min(s)', depTime: '9:00 AM', arrTime: '10:30 AM', passenger: { name: 'Daw Hsu Hlaing Win', passport: 'MJI04930', phone: '+95 912789430', address: 'Kamayut, Yangon', nationality: 'Myanmar', gender: 'Male' } },
];

export default function BookingDetails() {
    const params = useParams();
    const bookingId = Number(params?.id);

    // Fallback to item 2 if the specific ID isn't found in mock data, matching your screenshot design
    const booking = bookingsData.find((b) => b.id === bookingId) || bookingsData[1];

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans text-gray-800 pb-12">

        <Navbar />

        <main className="max-w-[1000px] mx-auto px-4 mt-6 sm:mt-8">
            {/* Breadcrumbs */}
            <div className="text-sm mb-6 flex items-center gap-1">
                <Link href="/" className="text-gray-400 font-medium hover:text-gray-600 transition-colors">Home</Link>
                <span className="text-gray-300">|</span>
                <span className="text-[#1e3a8a] font-bold">Booking Details</span>
            </div>

            {/* Layout Container split into 2 unequal columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
                {/* Left Side Panel: Booking Details (Spans 2 columns) */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-lg shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-4 gap-2">
                    <h2 className="text-sm font-bold text-gray-800">Booking Details</h2>
                    <p className="text-xs font-semibold text-gray-500">
                        DATE : <span className="text-gray-700">{booking.date}</span>
                    </p>
                    </div>

                    {/* Flight Identifier Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                        {/* <Plane size={32} className="transform -rotate-45 sm:w-9 sm:h-9" /> */}
                        <Image 
                            src={logoImg} 
                            alt="Airline Logo" 
                            width={64} 
                            height={64} 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs w-full">
                        <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[70px]">Flight No</span>
                        <span className="text-gray-800 font-bold">: {booking.flightNo}</span>
                        </div>
                        <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[70px]">Airline</span>
                        <span className="text-gray-800 font-bold">: {booking.airline}</span>
                        </div>
                        <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[70px]">Country</span>
                        <span className="text-gray-800 font-bold">: {booking.country}</span>
                        </div>
                        <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[70px]">Ticket ID</span>
                        <span className="text-[#1e3a8a] font-bold">: {booking.ticketId}</span>
                        </div>
                    </div>
                    </div>

                    <hr className="border-gray-100 mb-5" />

                    {/* Specific Route & Time Metrics */}
                    <div className="space-y-3 text-xs max-w-md w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-1">
                            <span className="text-gray-500 font-medium min-w-[100px]">Route</span>
                            <div className="flex items-center gap-2 flex-wrap">
                                :<span className="bg-[#e0f2fe] text-[#0369a1] font-semibold px-3 py-0.5 rounded-full text-[11px] ml-1 sm:ml-0">{booking.routeFrom}</span>
                                <span className="text-gray-400 font-bold">⇄</span>
                                <span className="bg-[#e0f2fe] text-[#0369a1] font-semibold px-3 py-0.5 rounded-full text-[11px]">{booking.routeTo}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Departure Time</span>
                            <span className="text-gray-800 font-semibold">: {booking.depTime}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Arrival Time</span>
                            <span className="text-gray-800 font-semibold">: {booking.arrTime}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Duration</span>
                            <span className="text-gray-800 font-semibold">: {booking.duration}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Seat Class</span>
                            <span className="text-gray-800 font-semibold">: {booking.flightClass}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Status</span>
                            <span className={`font-bold ${booking.status === 'Confirmed' ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                            : {booking.status}
                            </span>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <span className="text-gray-500 font-medium min-w-[100px]">Total Price</span>
                            <span className="text-gray-900 font-bold">: {booking.price}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side Panel: Passenger Information (Spans 1 column) */}
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 sm:p-6 w-full">
                    <div className="flex items-center gap-2 mb-6 text-gray-800">
                    <User size={16} className="text-gray-700" />
                    <h2 className="text-xs font-bold">Passenger Information</h2>
                    </div>

                    <div className="space-y-3.5 text-xs">
                    <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[90px]">Name</span>
                        <span className="text-gray-800 font-semibold break-all sm:break-normal">: {booking.passenger.name}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[90px]">Passport No</span>
                        <span className="text-gray-800 font-semibold">: {booking.passenger.passport}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[90px]">Phone No</span>
                        <span className="text-gray-800 font-semibold">: {booking.passenger.phone}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[90px]">Address</span>
                        <span className="text-gray-800 font-semibold break-all sm:break-normal">: {booking.passenger.address}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[90px]">Nationality</span>
                        <span className="text-gray-800 font-semibold">: {booking.passenger.nationality}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-[90px]">Gender</span>
                        <span className="text-gray-800 font-semibold">: {booking.passenger.gender}</span>
                    </div>
                    </div>
                </div>
            </div>

        </main>
        </div>
    );
}