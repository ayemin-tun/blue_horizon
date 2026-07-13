import { ReportKind } from '@/services/reportService';

export type ReportOption = {
  value: ReportKind;
  label: string;
  supportsDateFilter: boolean; // only Sales Summary filters by date for now
};

export const REPORT_OPTIONS: ReportOption[] = [
  { value: 'sales-summary', label: 'Sales & Revenue Summary Report', supportsDateFilter: true },
  { value: 'route-demand', label: 'Route Demand Forecast Report', supportsDateFilter: false },
  { value: 'agent-performance', label: 'Agent Performance Report', supportsDateFilter: false },
  { value: 'season-trends', label: 'Seasonality Trend Report', supportsDateFilter: false },
  { value: 'airline-share', label: 'Airline Share Performance Report', supportsDateFilter: false },
];

export const PAGE_SIZE = 10;

export const formatMMK = (value: number) => `${Math.round(value).toLocaleString('en-US')} MMK`;