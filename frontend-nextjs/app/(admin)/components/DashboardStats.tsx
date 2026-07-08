'use client';
import React from 'react';
import StatCard from '@/components/StatCard';
import { useDashboardStatsQuery } from '@/services/dashboardService';

const DashboardStats: React.FC = () => {
  const { data: apiResponse, isLoading } = useDashboardStatsQuery();
  const stats = apiResponse?.data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      <StatCard
        title="Total Revenue"
        value={isLoading ? '...' : (stats?.total_revenue ?? 0).toLocaleString()}
        unit="MMK"
        subText="Confirmed bookings"
      />
      <StatCard
        title="Active Schedule"
        value={isLoading ? '...' : String(stats?.active_flights ?? 0)}
        unit="Schedule"
        subText="Currently scheduled"
      />
      <StatCard
        title="Total Sale Count"
        value={isLoading ? '...' : (stats?.total_sale_count ?? 0).toLocaleString()}
        unit="Tickets"
        subText="Accumulated via agents"
      />
      <StatCard
        title="Active Agents"
        value={isLoading ? '...' : String(stats?.active_agents ?? 0)}
        unit="Accounts"
        subText="All verified profile"
      />
      <StatCard
        title="Total Users"
        value={isLoading ? '...' : String(stats?.total_users ?? 0)}
        unit="Users"
        subText="All verified profile"
      />
    </div>
  );
};

export default DashboardStats;