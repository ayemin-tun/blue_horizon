// components/Admin/BookingTable.tsx
import React from 'react';

// Static mock data for UI-only view
const recentBookings = [
  { id: 'BH-1001', agent: 'Agent Alpha', flight: 'UB-101', date: '2026-07-01', total: '150,000 MMK', status: 'Confirmed' },
  { id: 'BH-1002', agent: 'Agent Beta', flight: 'MAI-201', date: '2026-07-01', total: '250,000 MMK', status: 'Pending' },
  { id: 'BH-1003', agent: 'Agent Alpha', flight: 'UB-101', date: '2026-07-01', total: '150,000 MMK', status: 'Confirmed' },
  { id: 'BH-1004', agent: 'Agent Gamma', flight: 'UB-102', date: '2026-07-02', total: '150,000 MMK', status: 'Confirmed' },
  { id: 'BH-1005', agent: 'Agent Delta', flight: 'MAI-202', date: '2026-07-02', total: '250,000 MMK', status: 'Failed' },
];

const BookingTable: React.FC = () => {
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
            {recentBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{booking.id}</td>
                <td className="px-6 py-4 text-gray-700">{booking.agent}</td>
                <td className="px-6 py-4 text-gray-700">{booking.flight}</td>
                <td className="px-6 py-4 text-gray-600">{booking.date}</td>
                <td className="px-6 py-4 text-right font-medium text-gray-950">{booking.total}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium 
                    ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'}`}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;