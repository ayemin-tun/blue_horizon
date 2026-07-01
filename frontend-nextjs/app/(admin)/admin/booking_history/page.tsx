'use client';

import React from 'react';
import { Eye, ChevronLeft, ChevronRight, Search, User } from 'lucide-react';

export default function BookingHistory() {
  const bookings = [
    { id: 'FB-NQ23230221', route: 'Yangon → Mandalay', date: '26/06/2025', class: 'Business', status: 'Pending' },
    { id: 'FB-NQ23230223', route: 'Mandalay → Yangon', date: '22/03/2025', class: 'Business', status: 'Confirmed' },
    { id: 'FB-NQ23230226', route: 'Yangon → Heho', date: '20/01/2026', class: 'Economy', status: 'Cancelled' },
    { id: 'FB-NQ23230229', route: 'Yangon → NayPyiDaw', date: '15/04/2026', class: 'Economy', status: 'Confirmed' },
    { id: 'FB-NQ23230222', route: 'Yangon → Ann', date: '18/04/2026', class: 'Business', status: 'Confirmed' },
  ];

  return (
    <div className="flex flex-col h-screen font-sans bg-white text-[#102A43]">
      {/* FULL WIDTH HEADER - Light Cyan/Blue Background */}
      <header className="bg-[#E6F0F9] h-20 flex items-center px-8 justify-between shrink-0">
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          {/* Faux Logo Icon */}
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
            <div key={item} className={`px-4 py-3 rounded-md font-medium text-sm ${item === 'Booking History' ? 'bg-[#152B85] text-white shadow-sm' : 'text-[#152B85] hover:bg-gray-50 cursor-pointer'}`}>
              {item}
            </div>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header Text */}
          <h1 className="text-2xl font-bold text-[#152B85] mb-1">Booking History</h1>
          <p className="text-gray-500 text-sm mb-4">Blue Horizon Booking History Dashboard</p>
          
          {/* The Missing Horizontal Line */}
          <hr className="mb-6 border-gray-200" />

          {/* Stats Row - Colors specifically match text and numbers */}
          <div className="flex gap-6 mb-8">
            {/* Card 1 */}
            <div className="bg-white p-4 border border-gray-200 rounded w-48 shadow-sm">
              <p className="text-sm font-semibold text-[#152B85] mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-[#152B85]">15</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white p-4 border border-gray-200 rounded w-48 shadow-sm">
              <p className="text-sm font-semibold text-emerald-600 mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-emerald-600">12</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white p-4 border border-gray-200 rounded w-48 shadow-sm">
              <p className="text-sm font-semibold text-red-600 mb-1">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">3</p>
            </div>
            {/* Card 4 */}
            <div className="bg-white p-4 border border-gray-200 rounded w-48 shadow-sm">
              <p className="text-sm font-semibold text-amber-500 mb-1">Pending</p>
              <p className="text-3xl font-bold text-amber-500">2</p>
            </div>
          </div>

          {/* Restored Search & Filter Bar */}
          <div className="flex justify-end gap-4 mb-4">
            <div className="flex items-center border border-gray-300 rounded bg-white px-2">
              <select className="p-2 text-sm text-gray-600 outline-none bg-transparent appearance-none pr-8">
                <option>Sort by: Class</option>
              </select>
            </div>
            <div className="flex items-center border border-gray-300 rounded bg-white px-2">
              <select className="p-2 text-sm text-gray-600 outline-none bg-transparent appearance-none pr-8">
                <option>Sort by: Status</option>
              </select>
            </div>
            <div className="flex items-center border border-gray-300 rounded bg-white px-3 w-64">
              <input type="text" placeholder="Search by ticket ID" className="p-2 text-sm w-full outline-none" />
              <Search size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-gray-200 rounded shadow-sm">
            <table className="w-full text-sm text-center">
              <thead className="bg-[#E5E7EB] text-gray-700">
                <tr>{['Ticket ID', 'Route', 'Date', 'Class', 'Status', 'Action'].map(h => <th key={h} className="p-4 font-bold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100">
                    <td className="p-4 text-gray-800">{b.id}</td>
                    <td className="p-4 text-gray-800">{b.route}</td>
                    <td className="p-4 text-gray-800">{b.date}</td>
                    <td className="p-4 text-gray-800">{b.class}</td>
                    <td className={`p-4 font-bold ${b.status === 'Confirmed' ? 'text-emerald-600' : b.status === 'Cancelled' ? 'text-red-600' : 'text-amber-500'}`}>
                      {b.status}
                    </td>
                    <td className="p-4 text-gray-800 flex items-center justify-center gap-1 cursor-pointer font-bold"><Eye size={16}/> View</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="p-4 bg-[#F9FAFB] border-t border-gray-200 flex justify-between items-center text-xs text-gray-500 rounded-b">
              <span>Showing 1 to 5 bookings of 15 bookings</span>
              <div className="flex gap-1">
                <button className="border border-gray-300 bg-white px-2 py-1 rounded"><ChevronLeft size={14}/></button>
                {[1, 2, 3, 4].map(n => <button key={n} className={`border border-gray-300 px-2 py-1 rounded ${n === 1 ? 'bg-blue-50 text-blue-900' : 'bg-white'}`}>{n}</button>)}
                <button className="border border-gray-300 bg-white px-2 py-1 rounded"><ChevronRight size={14}/></button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}