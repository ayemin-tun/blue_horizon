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

  // Tab Menu Data
  const tabs = [
    { name: 'Airline', href: '/admin/flight_mang' },
    { name: 'Route', href: '/admin/flight_mang/route' },
    { name: 'Flight', href: '/admin/flight_mang/flight' },
    { name: 'Route Schedule', href:'/admin/flight_mang/route_schedule'},
    { name: 'Today Schedule', href:'/admin/flight_mang/today_schedule'},
  ];

  return (
    <div className="p-2 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-950 font-serif">Flight Panel</h1>
        <p className="text-sm text-slate-500 mt-1">
          Blue Horizon enterprise ticket sales and administration console.
        </p>
      </div>

      {/* ── Custom Navbar / Tabs ── */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-6 -mb-px">
          {tabs.map((tab) => {
            // active path
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`pb-2.5 text-sm font-medium transition-all relative ${
                  isActive
                    ? 'text-blue-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.name}
                {/* Active Line Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <main>{children}</main>
    </div>
  );
}