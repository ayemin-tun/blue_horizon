'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { User } from 'lucide-react';
import logoImg from '@/public/logo.png';
import { useParams } from 'next/navigation';

const bookingsData = [
    { id: 1, date: 'Sunday, June 24', type: 'One-Way', ticketId: 'FB-NQ23230221', flightClass: 'Economy', destination: 'RGN_MDY', airline: 'Blue Horizon Airlines', status: 'Confirmed', price: '300,000 MMK', routeFrom: 'Yangon', routeTo: 'Mandalay', flightNo: 'BH-101', country: 'Myanmar', duration: '1hr(s) 30 min(s)', depTime: '9:00 AM', arrTime: '10:30 AM', passenger: { name: 'Daw May Thu', passport: 'MJI04930', phone: '+95 912789430', address: 'Kamayut, Yangon', nationality: 'Myanmar', gender: 'Male' } },
    { id: 2, date: 'Sunday, June 21', type: 'One-Way', ticketId: 'FB-NQ23230321', flightClass: 'Economy', destination: 'MDY_RGN', airline: 'Blue Horizon Airlines', status: 'Confirmed', price: '300,000 MMK', routeFrom: 'Yangon', routeTo: 'Mandalay', flightNo: 'BH-101', country: 'Myanmar', duration: '1hr(s) 30 min(s)', depTime: '9:00 AM', arrTime: '10:30 AM', passenger: { name: 'U Lwin Maung', passport: 'MJI04930', phone: '+95 912789430', address: 'Kamayut, Yangon', nationality: 'Myanmar', gender: 'Male' } },
    { id: 3, date: 'Sunday, June 21', type: 'One-Way', ticketId: 'FB-NQ23230322', flightClass: 'Economy', destination: 'MDY_RGN', airline: 'Blue Horizon Airlines', status: 'Cancel', price: '300,000 MMK', routeFrom: 'Yangon', routeTo: 'Mandalay', flightNo: 'BH-101', country: 'Myanmar', duration: '1hr(s) 30 min(s)', depTime: '9:00 AM', arrTime: '10:30 AM', passenger: { name: 'U Kyaw Min', passport: 'MJI04930', phone: '+95 912789430', address: 'Kamayut, Yangon', nationality: 'Myanmar', gender: 'Male' } },
    { id: 4, date: 'Sunday, June 21', type: 'One-Way', ticketId: 'FB-NQ23230323', flightClass: 'Economy', destination: 'MDY_RGN', airline: 'Blue Horizon Airlines', status: 'Cancel', price: '300,000 MMK', routeFrom: 'Yangon', routeTo: 'Mandalay', flightNo: 'BH-101', country: 'Myanmar', duration: '1hr(s) 30 min(s)', depTime: '9:00 AM', arrTime: '10:30 AM', passenger: { name: 'Daw Hsu Hlaing Win', passport: 'MJI04930', phone: '+95 912789430', address: 'Kamayut, Yangon', nationality: 'Myanmar', gender: 'Male' } },
];

export default function BookingDetails() {
    const params = useParams();
    const bookingId = Number(params?.id);
    const booking = bookingsData.find((b) => b.id === bookingId) || bookingsData[1];

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans text-gray-800 pb-12">
            <Navbar />

            <main className="max-w-[1150px] mx-auto px-4 mt-6 sm:mt-8">
                {/* Breadcrumbs */}
                <div className="text-sm mb-6 flex items-center gap-1">
                    <Link href="/" className="text-gray-400 font-medium hover:text-gray-600 transition-colors">Home</Link>
                    <span className="text-gray-300">|</span>
                    <span className="text-[#1e3a8a] font-bold">Booking Details</span>
                </div>

                {/* Layout Container */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                    
                    {/* Left Side Panel: Booking Details */}
                    <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg shadow-sm p-5 sm:p-7">
                        
                        {/* Header Row: DATE ညာဘက်အစွန်း */}
                        <div className="flex flex-row justify-between items-center border-b border-gray-200 pb-4 mb-5">
                            <h2 className="text-base font-bold text-gray-800">Booking Details</h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                                DATE : <span className="text-gray-800">{booking.date}</span>
                            </p>
                        </div>

                        {/* ⚡ Flight Identifier Section - flex justify-between သုံးပြီး ညာဘက် ကပ်ထားပါတယ် */}
                        <div className="flex flex-row justify-between items-start mb-6 w-full">
                            {/* Left: Logo Box */}
                            <div className="w-24 h-24 shrink-0 bg-[#e0f2fe]/50 rounded-xl flex items-center justify-center p-3">
                                <Image 
                                    src={logoImg} 
                                    alt="Airline Logo" 
                                    width={100} 
                                    height={100} 
                                    className="object-contain"
                                />
                            </div>

                            {/* Right: Top Info List - DATE ရဲ့ အောက်တည့်တည့် ညာဘက်အစွန်းကို ရောက်သွားအောင် ချိန်ညှိထားပါတယ် */}
                            <div className="flex flex-col gap-3 text-[13px] max-w-xs w-full pt-0.5">
                                <div className="flex gap-2">
                                    <span className="text-gray-500 font-medium min-w-[100px]">Flight No</span>
                                    <span className="text-gray-900 font-bold">: {booking.flightNo}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-500 font-medium min-w-[100px]">Airline</span>
                                    <span className="text-gray-900 font-semibold">: {booking.airline}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-500 font-medium min-w-[100px]">Country</span>
                                    <span className="text-gray-900 font-semibold">: {booking.country}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-500 font-medium min-w-[100px]">Ticket ID</span>
                                    <span className="text-[#1d4ed8] font-bold">: {booking.ticketId}</span>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-200 mb-6" />

                        {/* ⚡ Bottom Specific Route & Time Metrics - အောက်ကစာသားတွေကိုပါ ညာဘက်အစွန်းကို ပို့ပေးထားပါတယ် */}
                        <div className="flex flex-col items-end w-full">
                            <div className="space-y-4 text-[13px] max-w-xs w-full">
                                {/* Route Row */}
                                <div className="flex gap-2 items-center">
                                    <span className="text-gray-500 font-medium min-w-[100px]">Route</span>
                                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                        <span>:</span>
                                        <span className="bg-[#e0f2fe] text-[#0369a1] font-bold px-4 py-1 rounded-full text-xs">
                                            {booking.routeFrom}
                                        </span>
                                        <span className="text-gray-400 font-bold text-sm">⇄</span>
                                        <span className="bg-[#e0f2fe] text-[#0369a1] font-bold px-4 py-1 rounded-full text-xs">
                                            {booking.routeTo}
                                        </span>
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
                    </div>

                    {/* Right Side Panel: Passenger Information */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-5 sm:p-7 w-full">
                        <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100 text-gray-800">
                            <User size={18} className="text-gray-700" />
                            <h2 className="text-base font-bold">Passenger Information</h2>
                        </div>

                        <div className="space-y-4 text-[13px]">
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-medium min-w-[100px]">Name</span>
                                <span className="text-gray-800 font-semibold break-all sm:break-normal">: {booking.passenger.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-medium min-w-[100px]">Passport No</span>
                                <span className="text-gray-800 font-semibold">: {booking.passenger.passport}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-medium min-w-[100px]">Phone No</span>
                                <span className="text-gray-800 font-semibold">: {booking.passenger.phone}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-medium min-w-[100px]">Address</span>
                                <span className="text-gray-800 font-semibold break-all sm:break-normal">: {booking.passenger.address}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-medium min-w-[100px]">Nationality</span>
                                <span className="text-gray-800 font-semibold">: {booking.passenger.nationality}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-medium min-w-[100px]">Gender</span>
                                <span className="text-gray-800 font-semibold">: {booking.passenger.gender}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}