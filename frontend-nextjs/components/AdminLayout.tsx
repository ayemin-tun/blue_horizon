import Link from 'next/link';
import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage?: string;
}

export default function AdminLayout({ children, activePage = 'Booking History' }: AdminLayoutProps) {
  const menuItems = [
    'System Overview',
    'Flight Management',
    'Booking History',
    'Agent Management',
    'Password Request',
    'Demand Forecasting',
    'Generate Report',
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#eef6fc] flex justify-between items-center px-8 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="text-blue-600 text-3xl font-bold italic">≈</div>
          <div>
            <h1 className="text-[#102b7b] font-bold text-xl leading-tight">BLUE HORIZON</h1>
            <p className="text-gray-500 text-xs">Air ticket analysis system</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full mt-6 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-100 py-6">
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item}
                href={item === 'Booking History' ? '/admin/booking_history' : '#'}
                className={`px-8 py-3 text-sm font-semibold transition-colors ${
                  activePage === item
                    ? 'bg-[#102b7b] text-white'
                    : 'text-blue-900 hover:bg-gray-50'
                }`}
              >
                {item}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}