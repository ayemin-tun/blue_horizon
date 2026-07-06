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
      <div className="border-b border-slate-200 mb-6 pb-4">
        <h1 className="text-2xl font-bold text-blue-950 font-serif">Active Schedule Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and update flight instance details, pricing, and operational status within the Blue Horizon flight administration console.
        </p>
      </div>


      <main>{children}</main>
    </div>
  );
}