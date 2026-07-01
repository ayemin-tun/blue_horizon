'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FlightManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isMainPage = pathname === '/admin/booking_history';

  return (
    <div className="p-2 max-w-5xl mx-auto">
      
      {/* ── Custom Top Navbar/Back Button ── */}
      {!isMainPage && (
        <div className="mb-4">
          <Link 
            href="/admin/booking_history" 
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
          >
            {/* Left Arrow Icon (←) */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5} 
              stroke="currentColor" 
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to History
          </Link>
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-950 font-serif">Booking History</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
           Blue Horizon Booking History Dashboard
        </p>
      </div>

      <main>{children}</main>
    </div>
  );
}