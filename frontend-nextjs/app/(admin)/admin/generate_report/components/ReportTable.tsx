'use client';

import { ReportKind } from '@/services/reportService';
import StatusPill from './StatusPill';
import { formatMMK } from './reportConfig';

type Column = { key: string; label: string; render?: (row: any) => React.ReactNode };

function getColumns(kind: ReportKind): Column[] {
  switch (kind) {
    case 'sales-summary':
      return [
        { key: 'ticket_id', label: 'Ticket Id' },
        { key: 'date', label: 'Date' },
        { key: 'route', label: 'Route' },
        { key: 'class', label: 'Class' },
        { key: 'price', label: 'Price', render: (r) => Math.round(r.price).toLocaleString('en-US') },
        { key: 'status', label: 'Status', render: (r) => <StatusPill value={r.status} /> },
      ];
    case 'route-demand':
      return [
        { key: 'route', label: 'Route' },
        { key: 'total_bookings', label: 'Total Bookings' },
        { key: 'demand_level', label: 'Demand', render: (r) => <StatusPill value={r.demand_level} /> },
        { key: 'forecast_next_month', label: 'Forecast (next mo.)' },
      ];
    case 'agent-performance':
      return [
        { key: 'agent_name', label: 'Agent' },
        { key: 'total_bookings', label: 'Total Bookings' },
        { key: 'total_revenue', label: 'Total Revenue', render: (r) => formatMMK(r.total_revenue) },
        { key: 'performance_tier', label: 'Tier', render: (r) => <StatusPill value={r.performance_tier} /> },
      ];
    case 'season-trends':
      return [
        { key: 'month_label', label: 'Month' },
        { key: 'total_bookings', label: 'Bookings' },
        {
          key: 'mom_growth_pct',
          label: 'MoM Growth',
          render: (r) =>
            `${r.mom_growth_pct > 0 ? '▲' : r.mom_growth_pct < 0 ? '▼' : '—'} ${Math.abs(r.mom_growth_pct).toFixed(1)}%`,
        },
        { key: 'season_level', label: 'Season', render: (r) => <StatusPill value={r.season_level} /> },
        { key: 'forecast_next_month', label: 'Forecast (next mo.)' },
      ];
    case 'airline-share':
    default:
      return [
        { key: 'airline_name', label: 'Airline' },
        { key: 'total_bookings', label: 'Total Bookings' },
        { key: 'total_revenue', label: 'Total Revenue', render: (r) => formatMMK(r.total_revenue) },
        { key: 'share_tier', label: 'Tier', render: (r) => <StatusPill value={r.share_tier} /> },
      ];
  }
}

export default function ReportTable({ kind, rows }: { kind: ReportKind; rows: any[] }) {
  if (rows.length === 0) {
    return <p className="text-[#9098a8] py-8 text-center">No data for this scope yet.</p>;
  }

  const columns = getColumns(kind);

  return (
    <div className="w-full sm:max-[768px]:overflow-x-auto sm:max-[768px]:touch-pan-x">
      <table className="w-full border-collapse text-[0.88rem] block sm:table sm:min-[561px]:max-[768px]:min-w-160">
        
        
        <thead className="absolute w-1 h-1 overflow-hidden p-0 -m-1 border-0 [clip:rect(0,0,0,0)] sm:static sm:table-header-group sm:w-auto sm:h-auto sm:overflow-visible">
          <tr className="sm:table-row">
            {columns.map((c) => (
              <th 
                key={c.key} 
                className="text-left text-[0.72rem] uppercase tracking-wider text-[#6b7385] pb-[0.6rem] px-[0.6rem] pt-0 border-b border-[#e3e6ee] whitespace-nowrap sm:table-cell"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="block w-full sm:table-row-group">
          {rows.map((row, i) => (
            <tr 
              key={i} 
              className="block w-full border border-[#e3e6ee] rounded-lg p-[0.6rem_0.75rem] mb-[0.7rem] sm:table-row sm:w-auto sm:border-none sm:rounded-none sm:p-0 sm:mb-0"
            >
              {columns.map((c) => (
                <td 
                  key={c.key} 
                  data-label={c.label}
                  className="flex w-full justify-between items-center gap-3 py-[0.4rem] px-0 border-b border-[#f2f3f7] last:border-b-0 text-right 
                             before:content-[attr(data-label)] before:text-[0.72rem] before:font-semibold before:uppercase before:tracking-wide before:text-[#6b7385] before:text-left
                             sm:table-cell sm:w-auto sm:py-[0.65rem] sm:px-[0.6rem] sm:border-b sm:border-[#eef0f5] sm:text-left sm:before:hidden"
                >
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}