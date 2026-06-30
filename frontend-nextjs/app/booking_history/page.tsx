import React, { useState, useMemo } from 'react';
import { Search, Eye } from 'lucide-react';

const BookingDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Date'); // Default sort criteria

  // Sample Data
  const bookings = [
    { id: 'FB-NQ23230221', route: 'Yangon → Mandalay', date: '26/06/2025', class: 'Business', status: 'Pending' },
    { id: 'FB-NQ23230223', route: 'Mandalay → Yangon', date: '22/03/2025', class: 'Business', status: 'Confirmed' },
    { id: 'FB-NQ23230226', route: 'Yangon → Heho', date: '20/01/2026', class: 'Economy', status: 'Cancelled' },
    { id: 'FB-NQ23230229', route: 'Yangon → NayPyiDaw', date: '15/04/2026', class: 'Economy', status: 'Confirmed' },
    { id: 'FB-NQ23230222', route: 'Yangon → Ann', date: '18/04/2026', class: 'Business', status: 'Confirmed' },
  ];

  // Logic for filtering and sorting
  const processedData = useMemo(() => {
    let data = [...bookings];

  // Filter by Ticket ID
if (searchTerm) {
  data = data.filter(b => b.id.toLowerCase().includes(searchTerm.toLowerCase()));
}

    // Sort logic
data.sort((a, b) => {
  const valA = (a as any)[sortBy.toLowerCase()];
  const valB = (b as any)[sortBy.toLowerCase()];
  return valA.localeCompare(valB);
});

    return data;
  }, [searchTerm, sortBy]);

  return (
    <div className="p-6 bg-white rounded-lg shadow border">
      {/* Search and Filter Controls */}
      <div className="flex gap-4 mb-6">
        <select 
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded text-sm"
        >
          <option value="Class">Sort by: Class</option>
          <option value="Status">Sort by: Status</option>
          <option value="Date">Sort by: Date</option>
        </select>

        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ticket ID..." 
            className="border p-2 pl-8 rounded text-sm w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Rendering */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-600">
            <th className="p-4">Ticket ID</th>
            <th className="p-4">Route</th>
            <th className="p-4">Status</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {processedData.map((b) => (
            <tr key={b.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-mono">{b.id}</td>
              <td className="p-4">{b.route}</td>
              <td className={`p-4 font-semibold ${
                b.status === 'Confirmed' ? 'text-green-600' : 
                b.status === 'Cancelled' ? 'text-red-600' : 'text-amber-500'
              }`}>
                {b.status}
              </td>
              <td className="p-4">
                <button className="flex items-center text-blue-900 hover:underline">
                  <Eye className="w-4 h-4 mr-1" /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingDashboard;