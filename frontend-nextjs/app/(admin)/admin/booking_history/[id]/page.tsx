'use client';

import React from 'react';
import { User, ArrowRightLeft } from 'lucide-react';

export default function BookingDetails() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 mb-8">

        {/* LEFT CARD: Passenger Information */}
        {/* ဖုန်းမှာ အပြည့်ယူပြီး Laptop မှာ သတ်မှတ်အကျယ် (w-full md:w-80) ဖြစ်သွားပါမယ် */}
        <div className="w-full md:w-80 bg-[#FAFAFA] border border-gray-200 shadow-sm p-6 shrink-0 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-black fill-current" />
            <h2 className="text-base font-bold text-black">Passenger Information</h2>
          </div>
          <hr className="border-gray-200 mb-6" />

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex">
              <span className="w-24 sm:w-28 text-gray-800 font-medium">Name</span>
              <span className="w-4">:</span>
              <span className="text-gray-800">U Kyaw Min</span>
            </div>
            <div className="flex">
              <span className="w-24 sm:w-28 text-gray-800 font-medium">Passport No</span>
              <span className="w-4">:</span>
              <span className="text-gray-800">MJI04930</span>
            </div>
            <div className="flex">
              <span className="w-24 sm:w-28 text-gray-800 font-medium">Phone No</span>
              <span className="w-4">:</span>
              <span className="text-gray-800">+95 912789430</span>
            </div>
            <div className="flex">
              <span className="w-24 sm:w-28 text-gray-800 font-medium">Address</span>
              <span className="w-4">:</span>
              <span className="text-gray-800">Kamayut, Yangon</span>
            </div>
            <div className="flex">
              <span className="w-24 sm:w-28 text-gray-800 font-medium">Nationality</span>
              <span className="w-4">:</span>
              <span className="text-gray-800">Myanmar</span>
            </div>
            <div className="flex">
              <span className="w-24 sm:w-28 text-gray-800 font-medium">Gender</span>
              <span className="w-4">:</span>
              <span className="text-gray-800">Male</span>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Booking Details */}
        <div className="flex-1 bg-[#FAFAFA] border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 text-xs sm:text-sm">
            <h2 className="text-base font-bold text-gray-800">Booking Details</h2>
            <span className="text-gray-600">DATE : Sunday, June 21</span>
          </div>
          <hr className="border-gray-200 mb-6" />

          {/* Top Flight Info Section */}
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="w-32 h-32 bg-[#D1E8F2] flex items-center justify-center shrink-0 mx-auto sm:mx-0 rounded">
              <div className="w-16 h-8 bg-blue-600 rounded-bl-full rounded-tr-full transform -skew-x-12 opacity-80"></div>
            </div>

            {/* Flight Info List 1 */}
            <div className="space-y-4 text-xs sm:text-sm flex-1">
              <div className="flex">
                <span className="w-28 sm:w-32 text-gray-800 font-medium">Flight No</span>
                <span className="w-4">:</span>
                <span className="text-gray-800 font-bold">BH-101</span>
              </div>
              <div className="flex">
                <span className="w-28 sm:w-32 text-gray-800 font-medium">Airline</span>
                <span className="w-4">:</span>
                <span className="text-gray-800 font-bold">Blue Horizon</span>
              </div>
              <div className="flex">
                <span className="w-28 sm:w-32 text-gray-800 font-medium">Country</span>
                <span className="w-4">:</span>
                <span className="text-gray-800 font-bold">Myanmar</span>
              </div>
              <div className="flex">
                <span className="w-28 sm:w-32 text-gray-800 font-medium">Ticket ID</span>
                <span className="w-4">:</span>
                <span className="text-[#000080] font-bold">FB-NQ23230221</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 sm:w-32 text-gray-800 font-medium">Route</span>
                <span className="w-4">:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-[#D6EBF2] text-gray-700 px-3 py-1 rounded-full text-[11px] font-semibold">Yangon</span>
                  <div className="border border-[#B388FF] rounded-full p-0.5 shrink-0">
                    <ArrowRightLeft size={10} className="text-[#B388FF]" />
                  </div>
                  <span className="bg-[#D6EBF2] text-gray-700 px-3 py-1 rounded-full text-[11px] font-semibold">Mandalay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Flight Info Section */}
          <div className="space-y-4 text-xs sm:text-sm sm:pl-38 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
            <div className="flex">
              <span className="w-28 sm:w-32 text-gray-800 font-medium">Departure Time</span>
              <span className="w-4">:</span>
              <span className="text-gray-800 font-bold">9:00 AM</span>
            </div>
            <div className="flex">
              <span className="w-28 sm:w-32 text-gray-800 font-medium">Arrival Time</span>
              <span className="w-4">:</span>
              <span className="text-gray-800">10:30 AM</span>
            </div>
            <div className="flex">
              <span className="w-28 sm:w-32 text-gray-800 font-medium">Duration</span>
              <span className="w-4">:</span>
              <span className="text-gray-800">1hr(s) 30 min(s)</span>
            </div>
            <div className="flex">
              <span className="w-28 sm:w-32 text-gray-800 font-medium">Seat Class</span>
              <span className="w-4">:</span>
              <span className="text-gray-800">Business</span>
            </div>
            <div className="flex">
              <span className="w-28 sm:w-32 text-gray-800 font-medium">Status</span>
              <span className="w-4">:</span>
              <span className="text-emerald-700 font-bold">Confirmed</span>
            </div>
            <div className="flex">
              <span className="w-28 sm:w-32 text-gray-800 font-medium">Total Price</span>
              <span className="w-4">:</span>
              <span className="text-gray-800 font-bold">300000 MMK</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}