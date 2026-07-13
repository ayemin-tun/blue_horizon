import { useQuery } from '@tanstack/react-query';
import { api, API_URL } from './apiClient';
import { useAuthStore } from './store/authStore';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SalesSummaryItem {
  ticket_id: string;
  date: string;
  route: string;
  class: string;
  price: number;
  status: string;
}

export interface SalesSummaryTotals {
  total_revenue: number;
  ticket_issues: number;
  average_ticket_sale: number;
}

export interface SalesSummaryResponse {
  success: boolean;
  summary: SalesSummaryTotals;
  data: SalesSummaryItem[];
  pagination: { total: number; skip: number; limit: number };
}

export interface SalesSummaryFilters {
  dateFrom?: string; // YYYY-MM-DD (from <input type="date">)
  dateTo?: string;
  search?: string;
  sortBy?: 'status' | 'date' | 'price';
  page?: number;
  limit?: number;
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') usp.set(key, String(value));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

// ─── Sales & Revenue Summary — table view (pure Python/SQL backend) ────────

export const useSalesSummaryQuery = (filters: SalesSummaryFilters, enabled: boolean) => {
  const { dateFrom, dateTo, search, sortBy = 'status', page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  return useQuery({
    queryKey: ['reports', 'sales-summary', dateFrom, dateTo, search, sortBy, page, limit],
    queryFn: async () => {
      const qs = buildQueryString({
        date_from: dateFrom,
        date_to: dateTo,
        search,
        sort_by: sortBy,
        skip,
        limit,
      });
      const response = await api.get<SalesSummaryItem[]>(`/api/reports/sales-summary${qs}`);
      return response as unknown as SalesSummaryResponse;
    },
    enabled,
    staleTime: 60 * 1000,
  });
};

// ─── CSV download — a direct browser download, not a react-query hook ─────

export type ReportKind =
  | 'sales-summary'
  | 'route-demand'
  | 'agent-performance'
  | 'season-trends'
  | 'airline-share';

const EXPORT_PATH: Record<ReportKind, string> = {
  'sales-summary': '/api/reports/sales-summary/export',
  'route-demand': '/api/reports/route-demand/export',
  'agent-performance': '/api/reports/agent-performance/export',
  'season-trends': '/api/reports/season-trends/export',
  'airline-share': '/api/reports/airline-share/export',
};

export interface DownloadFilters {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
}

// NOTE: uses the same API_URL as apiClient.ts (http://127.0.0.1:8000 in
// dev) so this hits the FastAPI backend directly — same as api.get does.
// Using a relative path here would send the request to the Next.js
// origin (localhost:3000) instead, which 404s since no such page/route
// exists there.
export async function downloadReportCsv(kind: ReportKind, filters: DownloadFilters = {}) {
  const qs = buildQueryString({
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    search: filters.search,
    sort_by: filters.sortBy,
  });

  const token = useAuthStore.getState().getValidToken();
  const res = await fetch(`${API_URL}${EXPORT_PATH[kind]}${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    throw new Error(`Export failed (${res.status})`);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${kind}-report.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}