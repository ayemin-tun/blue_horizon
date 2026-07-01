'use client';

import React from 'react';
import { User, ArrowRightLeft } from 'lucide-react';

export default function BookingDetails() {
  return (
    <div className="flex flex-col h-screen font-sans bg-[#F8F9FA] text-[#102A43]">
      {/* FULL WIDTH HEADER */}
      <header className="bg-[#EBF5F8] h-20 flex items-center px-8 justify-between shrink-0 border-b border-gray-200">
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-8 bg-blue-600 rounded-bl-full rounded-tr-full transform -skew-x-12"></div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[#001B54] text-xl tracking-wide">BLUE HORIZON</span>
            <span className="text-[10px] text-gray-500 font-medium">Air ticket analysis system</span>
          </div>
        </div>
        {/* Profile Icon */}
        <div className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm">
          <User size={20} className="text-gray-600" />
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white border-r border-gray-100 py-6 px-4 space-y-1 shrink-0">
          {['System Overview', 'Flight Management', 'Booking History', 'Agent Management', 'Password Request', 'Demang Forecasting', 'Generate Report'].map((item) => (
            <div key={item} className={`px-4 py-3 rounded-md font-medium text-sm ${item === 'Booking History' ? 'bg-[#000080] text-white shadow-sm' : 'text-[#000080] hover:bg-gray-50 cursor-pointer'}`}>
              {item}
            </div>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* Split Content Cards */}
          <div className="flex gap-6 mb-8">
            
            {/* LEFT CARD: Passenger Information */}
            <div className="w-[350px] bg-[#FAFAFA] border border-gray-200 shadow-sm p-6 shrink-0 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-black fill-current" />
                <h2 className="text-base font-bold text-black">Passenger Information</h2>
              </div>
              <hr className="border-gray-200 mb-6" />
              
              <div className="space-y-4 text-sm">
                <div className="flex">
                  <span className="w-28 text-gray-800 font-medium">Name</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800">U Kyaw Min</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-800 font-medium">Passport No</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800">MJI04930</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-800 font-medium">Phone No</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800">+95 912789430</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-800 font-medium">Address</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800">Kamayut, Yangon</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-800 font-medium">Nationality</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800">Myanmar</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-800 font-medium">Gender</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800">Male</span>
                </div>
              </div>
            </div>

            {/* RIGHT CARD: Booking Details */}
            <div className="flex-1 bg-[#FAFAFA] border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4 text-sm">
                <h2 className="text-base font-bold text-gray-800">Booking Details</h2>
                <span className="text-gray-600">DATE : Sunday, June 21</span>
              </div>
              <hr className="border-gray-200 mb-6" />

              <div className="flex gap-8 mb-6">
                {/* Logo Placeholder Box */}
                <div className="w-32 h-32 bg-[#D1E8F2] flex items-center justify-center shrink-0">
                   <div className="w-16 h-8 bg-blue-600 rounded-bl-full rounded-tr-full transform -skew-x-12 opacity-80"></div>
                </div>

                {/* Top Flight Info */}
                <div className="space-y-4 text-sm flex-1">
                  <div className="flex">
                    <span className="w-32 text-gray-800 font-medium">Flight No</span>
                    <span className="w-4">:</span>
                    <span className="text-gray-800 font-bold">BH-101</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-800 font-medium">Airline</span>
                    <span className="w-4">:</span>
                    <span className="text-gray-800 font-bold">Blue Horizon</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-800 font-medium">Country</span>
                    <span className="w-4">:</span>
                    <span className="text-gray-800 font-bold">Myanmar</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-800 font-medium">Ticket ID</span>
                    <span className="w-4">:</span>
                    <span className="text-[#000080] font-bold">FB-NQ23230221</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-800 font-medium">Route</span>
                    <span className="w-4">:</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#D6EBF2] text-gray-700 px-4 py-1 rounded-full text-xs font-semibold">Yangon</span>
                      <div className="border border-[#B388FF] rounded-full p-0.5">
                         <ArrowRightLeft size={12} className="text-[#B388FF]" />
                      </div>
                      <span className="bg-[#D6EBF2] text-gray-700 px-4 py-1 rounded-full text-xs font-semibold">Mandalay</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Flight Info */}
              <div className="space-y-4 text-sm ml-40">
                <div className="flex">
                  <span className="w-32 text-gray-800 font-medium">Departure Time</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800 font-bold">9:00 AM</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-800 font-medium">Arrival Time</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800">10:30 AM</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-800 font-medium">Duration</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800">1hr(s) 30 min(s)</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-800 font-medium">Seat Class</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800">Business</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-800 font-medium">Status</span>
                  <span className="w-4">:</span>
                  <span className="text-emerald-700 font-bold">Confirmed</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-800 font-medium">Total Price</span>
                  <span className="w-4">:</span>
                  <span className="text-gray-800 font-bold">300000 MMK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Divider & Button */}
          <hr className="border-gray-300 mb-6" />
          <div className="flex justify-end pr-1">
            <button className="bg-[#000099] hover:bg-[#000080] text-white font-bold py-2 px-8 rounded">
              Print Booking
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}