import React from 'react';
import BookingTable from '@/components/BookingTables';
import { Metadata } from 'next';
import DashboardStats from '../components/DashboardStats';

export const metadata: Metadata = {
  title: "admin",
};

const OverviewPage: React.FC = () => {
  return (
    <div className="p-2 max-w-5xl mx-auto">
      {/* Title & Description */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-950">Overview Panel</h1>
        <p className="text-sm text-gray-600 mt-1">
          Blue Horizon enterprise ticket sales and administration console.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <DashboardStats />

      {/* Booking Table */}
      <BookingTable />
    </div>
  );
};

export default OverviewPage;