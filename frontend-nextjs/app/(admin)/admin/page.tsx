
import React from 'react';
import Image from 'next/image';
import StatCard from '@/components/StatCard';
import BookingTable from '@/components/BookingTables';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "admin",
};

const OverviewPage: React.FC = () => {
  
  return (
    <div className="p-5">
      {/* Title & Description */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-950">Overview Panel</h1>
        <p className="text-sm text-gray-600 mt-1">
          Blue Horizon enterprise ticket sales and administration console.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
         <StatCard 
          title="Total Revenue"
          value="957,455,060"
          unit="MMK"
          subText="from last month"
          trendText="14.5"
          trendColor="text-green-600"
        />
        <StatCard 
          title="Active Flight"
          value="10"
          unit="Flights"
          subText="Sqlite live data"
        />
        <StatCard 
          title="Total Sale Count"
          value="1,521"
          unit="Tickets"
          subText="Accumulated via agents"
        />
        <StatCard 
          title="Active Agents"
          value="12"
          unit="Accounts"
          subText="All verified profile"
        />
        <StatCard 
          title="Total Users"
          value="200"
          unit="Users"
          subText="All verified profile"
        />
      </div>

      {/* Booking Table */}
      <BookingTable />
    </div>
  );
};

export default OverviewPage;