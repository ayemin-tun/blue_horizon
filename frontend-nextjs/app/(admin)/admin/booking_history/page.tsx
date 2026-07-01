'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; 
import { Eye, Search } from 'lucide-react';

export default function BookingHistory() {
  const router = useRouter(); 

  const bookings = [
    { id: 'FB-NQ23230221', route: 'Yangon → Mandalay', date: '26/06/2025', class: 'Business', status: 'Pending' },
    { id: 'FB-NQ23230223', route: 'Mandalay → Yangon', date: '22/03/2025', class: 'Business', status: 'Confirmed' },
    { id: 'FB-NQ23230226', route: 'Yangon → Heho', date: '20/01/2026', class: 'Economy', status: 'Cancelled' },
    { id: 'FB-NQ23230229', route: 'Yangon → NayPyiDaw', date: '15/04/2026', class: 'Economy', status: 'Confirmed' },
    { id: 'FB-NQ23230222', route: 'Yangon → Ann', date: '18/04/2026', class: 'Business', status: 'Confirmed' },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
          <p className="text-xs sm:text-sm font-semibold text-[#152B85] mb-1">Total Bookings</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#152B85]">15</p>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
          <p className="text-xs sm:text-sm font-semibold text-emerald-600 mb-1">Confirmed</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600">12</p>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
          <p className="text-xs sm:text-sm font-semibold text-red-600 mb-1">Cancelled</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">3</p>
        </div>
        {/* Card 4 */}
        <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
          <p className="text-xs sm:text-sm font-semibold text-amber-500 mb-1">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-500">2</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 mb-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex items-center border border-gray-300 rounded bg-white px-2 flex-1 sm:flex-initial">
            <select className="p-2 text-xs sm:text-sm text-gray-600 outline-none bg-transparent appearance-none pr-8 w-full">
              <option>Sort by: Class</option>
            </select>
          </div>
          <div className="flex items-center border border-gray-300 rounded bg-white px-2 flex-1 sm:flex-initial">
            <select className="p-2 text-xs sm:text-sm text-gray-600 outline-none bg-transparent appearance-none pr-8 w-full">
              <option>Sort by: Status</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center border border-gray-300 rounded bg-white px-3 w-full sm:w-64">
          <input type="text" placeholder="Search by ticket ID" className="p-2 text-xs sm:text-sm w-full outline-none" />
          <Search size={16} className="text-gray-400 shrink-0" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-x-auto">
        <table className="w-full text-xs sm:text-sm text-center min-w-150">
          <thead className="bg-[#E5E7EB] text-gray-700 whitespace-nowrap">
            <tr>
              {['Ticket ID', 'Route', 'Date', 'Class', 'Status', 'Action'].map(h => (
                <th key={h} className="p-3 sm:p-4 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors whitespace-nowrap">
                <td className="p-3 sm:p-4 text-gray-800">{b.id}</td>
                <td className="p-3 sm:p-4 text-gray-800">{b.route}</td>
                <td className="p-3 sm:p-4 text-gray-800">{b.date}</td>
                <td className="p-3 sm:p-4 text-gray-800">{b.class}</td>
                <td className={`p-3 sm:p-4 font-bold ${b.status === 'Confirmed' ? 'text-emerald-600' : b.status === 'Cancelled' ? 'text-red-600' : 'text-amber-500'}`}>
                  {b.status}
                </td>
                <td className="p-3 sm:p-4 text-gray-800 flex items-center justify-center font-bold">
                  <button 
                    onClick={() => router.push(`/admin/booking_history/${b.id}`)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition"
                  >
                    <Eye className="w-4 h-4" /> 
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}