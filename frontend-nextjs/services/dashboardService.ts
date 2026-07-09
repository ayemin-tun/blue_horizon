import { useQuery } from '@tanstack/react-query';
import { api } from './apiClient';

export interface DashboardStatsData {
  total_revenue: number;
  active_flights: number;
  total_sale_count: number;
  active_agents: number;
  total_users: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStatsData;
  error: { code: string; details: string } | null;
}

export const useDashboardStatsQuery = () => {
  return useQuery<DashboardStatsResponse, Error>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/api/admin/dashboard/stats');
      return (response as unknown) as DashboardStatsResponse;
    },
    staleTime: 1000 * 10, // 2 minutes
  });
};