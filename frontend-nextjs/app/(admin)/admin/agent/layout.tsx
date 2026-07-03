'use client';

import React from 'react';
import Link from 'next/link';
export default function FlightManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-2 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="border-b border-slate-200 mb-6 pb-6">
        <h1 className="text-2xl font-bold text-blue-950 font-serif">Agent Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage agents and their associated data within the Blue Horizon enterprise ticket sales and administration console.
        </p>
      </div>


      <main>{children}</main>
    </div>
  );
}