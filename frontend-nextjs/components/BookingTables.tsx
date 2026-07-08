// components/Admin/BookingTable.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { useAdminBookingsQuery } from "@/services/BookingService";
import { Loader2, ArrowRight } from 'lucide-react';

const BookingTable: React.FC = () => {
  const { data: apiResponse, isLoading } = useAdminBookingsQuery({
    skip: 0,
    limit: 5,
  });

  const bookings = apiResponse?.data?.bookings || [];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Bookings</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Booking ID</th>
              <th scope="col" className="px-6 py-3">Agent</th>
              <th scope="col" className="px-6 py-3">Flight</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3 text-right">Total</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-xs font-medium">Loading bookings...</span>
                  </div>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-xs font-medium text-gray-400">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.booking_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{booking.ticket_code}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {booking.agent_details?.name ?? (booking.user_id ? `User #${booking.user_id}` : '-')}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{booking.flight_details?.flight_no}</td>
                  <td className="px-6 py-4 text-gray-600">{booking.flight_details?.flight_date}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-950">
                    {booking.total_price?.toLocaleString()} MMK
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Go to Booking Page */}
      <div className="mt-5 flex justify-end">
        <Link
          href="/admin/booking"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
        >
          Go to Booking Page
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default BookingTable;