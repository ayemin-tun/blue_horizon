import { useQuery } from '@tanstack/react-query';
import { api, ApiResponse } from './apiClient';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface RouteDemandItem {
  route_id: number;
  route: string;
  total_bookings: number;
  demand_level: 'HIGH' | 'MEDIUM' | 'LOW';
  forecast_next_month: number;
}

export interface AgentPerformanceItem {
  agent_id: number;
  agent_name: string;
  total_bookings: number;
  total_revenue: number;
  performance_tier: 'TOP' | 'AVERAGE' | 'LOW';
}

export interface SeasonTrendItem {
  year_month: string;
  month_label: string;
  total_bookings: number;
  total_revenue: number;
  season_level: 'PEAK' | 'NORMAL' | 'LOW';
  mom_growth_pct: number;
  forecast_next_month: number;
}

export interface AirlineShareItem {
  airline_id: number;
  airline_name: string;
  total_bookings: number;
  total_revenue: number;
  share_tier: 'DOMINANT' | 'MODERATE' | 'MINOR';
}

// COBOL runs are heavier than a normal CRUD read (file I/O + subprocess),
// so we cache longer than the default and don't refetch on every tab focus.
const FORECAST_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
} as const;

// ─── 1. Route Demand ───────────────────────────────────────────────────────
export const useRouteDemandQuery = () => {
  return useQuery({
    queryKey: ['forecast', 'route-demand'],
    queryFn: async () => {
      const response = await api.get<RouteDemandItem[]>('/api/forecast/route-demand');
      return response;
    },
    ...FORECAST_QUERY_OPTIONS,
  });
};

// ─── 2. Agent Performance ──────────────────────────────────────────────────
export const useAgentPerformanceQuery = () => {
  return useQuery({
    queryKey: ['forecast', 'agent-performance'],
    queryFn: async () => {
      const response = await api.get<AgentPerformanceItem[]>('/api/forecast/agent-performance');
      return response;
    },
    ...FORECAST_QUERY_OPTIONS,
  });
};

// ─── 3. Season Trends ───────────────────────────────────────────────────────
export const useSeasonTrendsQuery = () => {
  return useQuery({
    queryKey: ['forecast', 'season-trends'],
    queryFn: async () => {
      const response = await api.get<SeasonTrendItem[]>('/api/forecast/season-trends');
      return response;
    },
    ...FORECAST_QUERY_OPTIONS,
  });
};

// ─── 4. Airline Share ───────────────────────────────────────────────────────
export const useAirlineShareQuery = () => {
  return useQuery({
    queryKey: ['forecast', 'airline-share'],
    queryFn: async () => {
      const response = await api.get<AirlineShareItem[]>('/api/forecast/airline-share');
      return response;
    },
    ...FORECAST_QUERY_OPTIONS,
  });
};

export type { ApiResponse };